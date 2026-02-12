import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ethers } from 'ethers';
import LandRegistry from '../blockchain/LandRegistry.json';

export const VerifyLandPage = () => {
    const { token } = useContext(AuthContext);
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [processingId, setProcessingId] = useState(null);
    const [viewingDocument, setViewingDocument] = useState(null);

    // Fetch Pending Lands
    const fetchPendingLands = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/land/pending');
            setLands(res.data.lands || []);
        } catch (err) {
            setError('Failed to fetch pending land records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingLands();
    }, [token]);

    // Blockchain & Approval Logic
    const handleVerifyAndApprove = async (land) => {
        try {
            if (!window.ethereum) {
                alert('MetaMask is not installed!');
                return;
            }

            // Force switch to Localhost (Chain ID 1337 = 0x539)
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x539',
                                    chainName: 'Localhost 8545',
                                    rpcUrls: ['http://127.0.0.1:8545'],
                                    nativeCurrency: {
                                        name: "ETH",
                                        symbol: "ETH",
                                        decimals: 18
                                    },
                                },
                            ],
                        });
                    } catch (addError) {
                        setError('Please add Localhost 8545 to MetaMask manually.');
                        setTimeout(() => setError(''), 5000);
                        return;
                    }
                } else {
                    console.error(switchError);
                    // On some versions, simple switch error might not be 4902
                }
            }


            setProcessingId(land._id);
            setError('');

            // 1. Generate Hash (Using simple string concat for demo, usually use precise hashing or Merkle tree)
            const dataString = `${land.surveyNumber}-${land.area}-${land.address}-${land.ownerName}`;
            const landHash = ethers.id(dataString);



            const confirm = window.confirm(`Verifying Land: ${land.surveyNumber}\nHash: ${landHash.slice(0, 10)}...\n\nConfirm to mint to Blockchain?`);
            if (!confirm) {
                setProcessingId(null);
                return;
            }

            // 2. Blockchain Transaction
            const provider = new ethers.BrowserProvider(window.ethereum); // Ethers v6 syntax
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(LandRegistry.address, LandRegistry.abi, signer);

            const tx = await contract.registerLand(land.surveyNumber, landHash);
            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            await tx.wait();
            console.log('Transaction mined');

            // 3. Backend Update (Store Hash, TxHash & verificationDocument)
            // MUST usage FormData for file upload
            const updateData = new FormData();
            updateData.append('status', 'LAND_APPROVED');
            updateData.append('landHash', landHash);
            updateData.append('txHash', tx.hash);


            await apiClient.patch(`/land/verify/${land._id}`, updateData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(`Land ${land.surveyNumber} Successfully Verified & Minted!`);
            fetchPendingLands();
            setTimeout(() => setSuccess(''), 5000);

        } catch (err) {
            console.error(err);
            // Handle "Already Registered" Error
            if (err.message && (err.message.includes('already registered') || err.message.includes('execution reverted'))) {
                const alreadyRegistered = window.confirm(
                    `Blockchain Error: "${err.reason || 'Land already registered'}"\n\nIt seems this land was already minted but the database wasn't updated.\n\nDo you want to FORCE SYNC the database to 'Approved'?`
                );

                if (alreadyRegistered) {
                    try {
                        const updateData = new FormData();
                        updateData.append('status', 'LAND_APPROVED');
                        updateData.append('landHash', 'SYNCED_FROM_BLOCKCHAIN');
                        updateData.append('txHash', 'PREVIOUSLY_MINTED');



                        await apiClient.patch(`/land/verify/${land._id}`, updateData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        setSuccess('Database forcefully synced with Blockchain!');
                        fetchPendingLands();
                        setTimeout(() => setSuccess(''), 5000);
                        return; // Exit success
                    } catch (syncErr) {
                        setError('Failed to sync database: ' + syncErr.message);
                        setTimeout(() => setError(''), 5000);
                    }
                }
            }
            setError('Verification failed: ' + (err.reason || err.message || 'Unknown error'));
            setTimeout(() => setError(''), 5000);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (land) => {
        const reason = window.prompt("Enter Rejection Reason:");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            alert("Rejection reason is required!");
            return;
        }

        try {
            setProcessingId(land._id);
            await apiClient.patch(`/land/verify/${land._id}`, {
                status: 'LAND_REJECTED',
                rejectionReason: reason
            });

            setSuccess(`Land ${land.surveyNumber} Rejected.`);
            fetchPendingLands();
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error(err);
            setError('Rejection failed');
            setTimeout(() => setError(''), 5000);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8 relative">
            {/* Toast Notifications */}
            <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {error && (
                    <div className="pointer-events-auto bg-white border-l-4 border-[#D32F2F] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
                        <span className="text-2xl">🚫</span>
                        <div>
                            <h4 className="font-bold text-[#D32F2F]">Error</h4>
                            <p className="text-[#D32F2F] text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="pointer-events-auto bg-white border-l-4 border-[#2E8B57] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <h4 className="font-bold text-[#1B5E20]">Success</h4>
                            <p className="text-[#2E8B57] text-sm">{success}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="gov-h1 mb-1">Verify Land Records</h1>
                    <p className="text-[#555555]">Review documents and mint land titles to the Blockchain.</p>
                </div>

                {loading ? (
                    <p className="text-center text-[#555555]">Loading pending records...</p>
                ) : lands.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E0E0E0]">
                        <p className="text-[#555555] font-bold">No pending land records.</p>
                        <p className="text-sm text-[#999999]">All caught up!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {lands.map(land => (
                            <div key={land._id} className="glass-card p-6 shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="px-2 py-1 bg-blue-50 text-[#0B3D91] text-xs font-bold rounded border border-blue-100">
                                            {land.landType}
                                        </span>
                                        <h3 className="text-xl font-bold text-[#222222] mt-2">{land.surveyNumber}</h3>
                                        <p className="text-sm text-[#555555]">Area: {land.area} Acres</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-[#555555] uppercase">Owner</p>
                                        <p className="font-bold text-[#222222]">{land.ownerName}</p>
                                        <p className="text-xs text-[#555555]">Start Date: {new Date(land.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E0E0E0] mb-4 space-y-2">
                                    <p className="text-sm text-[#555555]">
                                        <span className="font-bold text-[#222222]">Address:</span> {land.address}
                                    </p>
                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            onClick={() => setViewingDocument(land.verificationDocument || land.documentUrl)}
                                            className="text-[#0B3D91] font-bold text-sm hover:underline flex items-center gap-1"
                                        >
                                            📄 View Land Document
                                        </button>
                                        <div className="text-[#999999] text-xs">
                                            Verified by: {land.officerId?.name}
                                        </div>
                                    </div>

                                    {/* Verification Details */}

                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleReject(land)}
                                        className="flex-1 py-3 border border-red-200 text-[#D32F2F] font-bold rounded-xl hover:bg-red-50 transition-colors"
                                        disabled={processingId === land._id}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleVerifyAndApprove(land)}
                                        disabled={processingId === land._id}
                                        className="flex-[2] py-3 bg-[#0B3D91] text-white font-bold rounded-xl shadow-lg hover:bg-[#092C6B] transition-colors flex items-center justify-center gap-2"
                                    >
                                        {processingId === land._id ? (
                                            <>
                                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                Minting...
                                            </>
                                        ) : (
                                            <>
                                                <span>✓ Verify & Mint</span>
                                                <span className="text-blue-200 text-xs">(Blockchain)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Document Viewer Modal */}
            {
                viewingDocument && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setViewingDocument(null)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-bold text-[#222222]" id="modal-title">
                                            Land Document Preview
                                        </h3>
                                        <button onClick={() => setViewingDocument(null)} className="text-[#999999] hover:text-[#555555] text-2xl">×</button>
                                    </div>
                                    <div className="bg-[#F4F6F9] rounded-xl border border-[#E0E0E0] p-4 flex justify-center items-center min-h-[300px]">
                                        {viewingDocument.endsWith('.pdf') ? (
                                            <iframe
                                                src={`https://docs.google.com/gview?url=${viewingDocument}&embedded=true`}
                                                className="w-full h-96 rounded-lg"
                                                title="doc"
                                            ></iframe>
                                        ) : (
                                            <img src={viewingDocument} className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm" alt="doc" />
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                    <a href={viewingDocument} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-[#0B3D91] text-base font-bold text-white hover:bg-[#092C6B] focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                        Download Original
                                    </a>
                                    <button type="button" onClick={() => setViewingDocument(null)} className="mt-3 w-full inline-flex justify-center rounded-xl border border-[#E0E0E0] shadow-sm px-4 py-2 bg-white text-base font-medium text-[#555555] hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Close Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
