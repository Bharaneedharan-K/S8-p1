import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ethers } from 'ethers';
import LandRegistry from '../blockchain/LandRegistry.json';

export const TransferRequestsPage = () => {
    const { user, token } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // For Officer verification upload
    const [verifyFile, setVerifyFile] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/transfer');
            setRequests(res.data.requests || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch transfer requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token]);

    // 1. Buyer Accept
    const handleAccept = async (id) => {
        try {
            if (!window.confirm('Are you sure you want to ACCEPT this land transfer and become the new owner?')) return;

            setActionLoading(id);
            await apiClient.post(`/transfer/accept/${id}`);
            setSuccess('Transfer Accepted! Sent to Officer for verification.');
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept transfer');
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // 2. Officer Verify
    const handleVerifyStart = (id) => {
        setSelectedRequestId(id);
        setVerifyFile(null);
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if (!verifyFile || !selectedRequestId) return;

        try {
            setActionLoading(selectedRequestId);
            const formData = new FormData();
            formData.append('verificationDocument', verifyFile);

            await apiClient.patch(`/transfer/verify/${selectedRequestId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Transfer Verified! Sent to Admin.');
            setSelectedRequestId(null);
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // 3. Admin Approve (Blockchain)
    const handleApprove = async (req) => {
        try {
            if (!window.ethereum) return alert('MetaMask not installed');

            // Force Localhost
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }],
                });
            } catch (switchError) {/* Handle error */ }

            const confirm = window.confirm(`Approve Transfer for Land ${req.landId.surveyNumber}?\nFrom: ${req.sellerId.name}\nTo: ${req.buyerId.name}`);
            if (!confirm) return;

            setActionLoading(req._id);

            // Generate Hash
            const transferString = `${req.landId.surveyNumber}-${req.sellerId._id}-${req.buyerId._id}-${Date.now()}`;
            const transferHash = ethers.id(transferString);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(LandRegistry.address, LandRegistry.abi, signer);

            // Check if land exists on blockchain
            let isRegistered = false;
            try {
                await contract.getLand(req.landId.surveyNumber);
                isRegistered = true;
            } catch (error) {
                console.log("Land not found on chain, will register fresh:", error);
                isRegistered = false;
            }

            let tx;
            if (isRegistered) {
                // If exists, Transfer
                tx = await contract.transferLand(req.landId.surveyNumber, transferHash);
            } else {
                // If missing, Register (Mint Fresh)
                // We use transferHash as the landHash for simplicity in this flow
                tx = await contract.registerLand(req.landId.surveyNumber, transferHash);
            }

            await tx.wait();

            // Backend Update
            await apiClient.patch(`/transfer/approve/${req._id}`, {
                status: 'TRANSFER_COMPLETED',
                transferHash,
                txHash: tx.hash
            });

            setSuccess('Transfer APPROVED & Executed on Blockchain!');
            fetchRequests();

        } catch (err) {
            console.error(err);
            setError('Approval failed: ' + (err.reason || err.message));
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 5000);
        }
    };

    // 4. Universal Reject
    const handleReject = async (id) => {
        const reason = prompt('Please enter the reason for rejection:');
        if (!reason) return;

        try {
            setActionLoading(id);
            await apiClient.patch(`/transfer/reject/${id}`, { reason });
            setSuccess('Transfer Rejected Successfully.');
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Rejection failed');
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'TRANSFER_INITIATED': 'bg-yellow-100 text-yellow-800',
            'TRANSFER_ACCEPTED': 'bg-blue-100 text-blue-800',
            'TRANSFER_VERIFIED': 'bg-purple-100 text-purple-800',
            'TRANSFER_COMPLETED': 'bg-green-100 text-green-800',
            'TRANSFER_REJECTED': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>{status.replace('TRANSFER_', '')}</span>;
    };

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[#2C3318] mb-8">
                    {user.role === 'FARMER' ? 'My Transfer Requests' : 'Manage Land Transfers'}
                </h1>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4">{success}</div>}

                {loading ? <p>Loading...</p> : (
                    <div className="grid gap-6">
                        {requests.length === 0 ? <p className="text-gray-500">No transfer requests found.</p> :
                            requests.map(req => (
                                <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#AEB877]/20 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-[#2C3318]">{req.landId?.surveyNumber}</h3>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        <p className="text-sm text-[#5C6642]">
                                            <span className="font-bold">Seller:</span> {req.sellerId?.name} ➝ <span className="font-bold">Buyer:</span> {req.buyerId?.name}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <a href={req.saleDeedUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">📄 View Sale Deed</a>
                                            {req.verificationDocument && (
                                                <a href={req.verificationDocument} target="_blank" rel="noreferrer" className="text-[#5C6642] hover:underline hover:text-[#2C3318]">📄 View Officer Report</a>
                                            )}
                                        </div>

                                        {req.status === 'TRANSFER_REJECTED' && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                <p className="text-xs font-bold text-red-800 uppercase mb-1">❌ Transfer Rejected</p>
                                                <p className="text-sm text-red-600 italic">"{req.rejectionReason || 'No reason provided'}"</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* BUYER ACTIONS */}
                                        {user.role === 'FARMER' && user._id === req.buyerId?._id && req.status === 'TRANSFER_INITIATED' && (
                                            <>
                                                <button
                                                    onClick={() => handleReject(req._id)}
                                                    className="px-4 py-2 border border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAccept(req._id)}
                                                    disabled={actionLoading === req._id}
                                                    className="px-6 py-2 bg-[#AEB877] text-[#2C3318] font-bold rounded-xl hover:bg-[#8B9850]"
                                                >
                                                    {actionLoading === req._id ? 'Processing...' : 'Accept'}
                                                </button>
                                            </>
                                        )}

                                        {/* OFFICER ACTIONS */}
                                        {user.role === 'OFFICER' && req.status === 'TRANSFER_ACCEPTED' && (
                                            <>
                                                <button
                                                    onClick={() => handleReject(req._id)}
                                                    className="px-4 py-2 border border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyStart(req._id)}
                                                    className="px-6 py-2 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532]"
                                                >
                                                    Verify & Upload
                                                </button>
                                            </>
                                        )}

                                        {/* ADMIN ACTIONS */}
                                        {user.role === 'ADMIN' && req.status === 'TRANSFER_VERIFIED' && (
                                            <>
                                                <button
                                                    onClick={() => handleReject(req._id)}
                                                    className="px-4 py-2 border border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(req)}
                                                    disabled={actionLoading === req._id}
                                                    className="px-6 py-2 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532]"
                                                >
                                                    {actionLoading === req._id ? 'Minting...' : 'Approve & Mint'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Officer Verify Modal */}
                {selectedRequestId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-[#F2F5E6] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#AEB877]">
                            <div className="bg-[#2C3318] p-6 text-center">
                                <h3 className="text-xl font-bold text-white">Upload Verification Report</h3>
                                <p className="text-[#AEB877] text-sm mt-1">Please verify the land details physically before uploading.</p>
                            </div>

                            <form onSubmit={handleVerifySubmit} className="p-8">
                                <div className="mb-6">
                                    <label className="block text-[#2C3318] font-bold mb-2">Select Document</label>
                                    <div className="relative border-2 border-dashed border-[#AEB877] rounded-xl p-8 text-center hover:bg-white transition-colors cursor-pointer group">
                                        <input
                                            type="file"
                                            required
                                            onChange={e => setVerifyFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-[#5C6642] group-hover:text-[#2C3318]">
                                            {verifyFile ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-2xl">📄</span>
                                                    <span className="font-medium truncate max-w-[200px]">{verifyFile.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-2xl mb-2">📂</p>
                                                    <p className="font-medium">Click to Upload Report</p>
                                                    <p className="text-xs opacity-70 mt-1">PDF or Image formats</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRequestId(null)}
                                        className="flex-1 py-3 border-2 border-[#AEB877] text-[#5C6642] font-bold rounded-xl hover:bg-[#E3E8D0] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {actionLoading ? 'Uploading...' : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
