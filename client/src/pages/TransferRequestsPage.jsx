import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ethers } from 'ethers';
import LandRegistry from '../blockchain/LandRegistry.json';
import { FaExchangeAlt, FaFileContract, FaCheck, FaTimes, FaUser, FaMapMarkerAlt, FaFileUpload, FaSpinner, FaArrowRight, FaFileAlt, FaShieldAlt, FaClock, FaCheckCircle, FaUserTie, FaUserCog } from 'react-icons/fa';

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

            // Force Switch to Polygon Amoy
            const targetChainId = '0x13882'; // Amoy
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChainId }],
                });
            } catch (switchError) {
                // Should add chain if missing, but for now just error
                if (switchError.code === 4902) {
                    alert('Please add Polygon Amoy Network to MetaMask');
                }
                return;
            }

            const confirm = window.confirm(`Approve Transfer for Land ${req.landId.surveyNumber}?\nFrom: ${req.sellerId.name}\nTo: ${req.buyerId.name}`);
            if (!confirm) return;

            setActionLoading(req._id);

            // Generate Hash
            const transferString = `${req.landId.surveyNumber}-${req.sellerId._id}-${req.buyerId._id}-${Date.now()}`;
            const transferHash = ethers.id(transferString);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(LandRegistry.address, LandRegistry.abi, signer);

            // Gas Overrides for Amoy
            const gasOptions = {
                maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
                maxFeePerGas: ethers.parseUnits('50', 'gwei'),
            };

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
                tx = await contract.transferLand(req.landId.surveyNumber, transferHash, gasOptions);
            } else {
                // If missing, Register (Mint Fresh)
                tx = await contract.registerLand(req.landId.surveyNumber, transferHash, gasOptions);
            }

            console.log('Transaction sent:', tx.hash);
            await tx.wait();
            console.log('Transaction mined');

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

            // Handle User Rejection
            if (err.info?.error?.code === 4001 || err.code === 'ACTION_REJECTED') {
                setError('Transaction Cancelled by User.');
                setTimeout(() => setError(''), 3000);
                setActionLoading(null);
                return;
            }

            // Handle Insufficient Funds
            if (err.code === 'INSUFFICIENT_FUNDS' || err.message?.includes('insufficient funds')) {
                setError('⚠️ Insufficient Test MATIC. Please get free tokens from Amoy Faucet.');
                window.open('https://faucet.polygon.technology/', '_blank');
                setTimeout(() => setError(''), 10000);
                setActionLoading(null);
                return;
            }

            // Handle Rate Limits specifically
            if (err.message && (err.message.includes('429') || err.message.includes('too many errors') || err.message.includes('rate limit'))) {
                setError('⚠️ Network Busy (RPC Rate Limit). Please wait 1 minute and try again.');
                setTimeout(() => setError(''), 10000);
                setActionLoading(null);
                return;
            }

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

    const TransferProgress = ({ status }) => {
        const steps = [
            { id: 'TRANSFER_INITIATED', label: 'Initiated', icon: <FaFileContract />, desc: 'Seller Created' },
            { id: 'TRANSFER_ACCEPTED', label: 'Accepted', icon: <FaUser />, desc: 'Buyer Accepted' },
            { id: 'TRANSFER_VERIFIED', label: 'Verified', icon: <FaUserTie />, desc: 'Officer Verified' },
            { id: 'TRANSFER_COMPLETED', label: 'Approved', icon: <FaCheckCircle />, desc: 'Admin Approved' }
        ];

        const currentStepIndex = steps.findIndex(s => s.id === status);
        const isRejected = status === 'TRANSFER_REJECTED';

        if (isRejected) {
            return (
                <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-center gap-2 text-red-700 font-bold">
                    <FaTimes /> Transfer Rejected
                </div>
            );
        }

        return (
            <div className="w-full py-4">
                <div className="relative flex items-center justify-between w-full">
                    {/* Progress Bar Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>

                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-[#0B3D91] -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 border-2 
                                    ${isCompleted ? 'bg-[#0B3D91] border-[#0B3D91] text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                    {isCompleted ? <FaCheck /> : index + 1}
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isCompleted ? 'text-[#0B3D91]' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-gray-500 hidden sm:block">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dynamic Status Message */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg text-center text-sm text-[#0B3D91] font-medium flex items-center justify-center gap-2">
                    {status === 'TRANSFER_INITIATED' && <><FaUser /> Waiting for Buyer to Accept Request</>}
                    {status === 'TRANSFER_ACCEPTED' && <><FaUserTie /> Waiting for Officer to Verify & Upload Report</>}
                    {status === 'TRANSFER_VERIFIED' && <><FaUserCog /> Waiting for Admin to Approve & Mint</>}
                    {status === 'TRANSFER_COMPLETED' && <><FaCheckCircle /> Transfer Successfully Completed!</>}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#0B3D91] rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-900/20">
                        <FaExchangeAlt />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] tracking-tight">
                            {user.role === 'FARMER' ? 'My Transfer Requests' : 'Manage Transfers'}
                        </h1>
                        <p className="text-[#555555] text-sm mt-1">
                            {user.role === 'FARMER' ? 'Track and manage your land sale and purchase requests.' : 'Verify and approve land transfer requests.'}
                        </p>
                    </div>
                </div>

                {error && <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 shadow-sm flex items-center gap-2 animate-slideIn"><FaTimes /> {error}</div>}
                {success && <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl mb-6 shadow-sm flex items-center gap-2 animate-slideIn"><FaCheck /> {success}</div>}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#0B3D91]/30 border-t-[#0B3D91] rounded-full animate-spin mb-4"></div>
                        <p className="text-[#555555] font-medium">Loading requests...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {requests.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-[#E0E0E0] shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl text-gray-300 mx-auto mb-4">
                                    <FaExchangeAlt />
                                </div>
                                <h3 className="text-xl font-bold text-[#222222] mb-2">No Requests Found</h3>
                                <p className="text-[#555555]">You don't have any active transfer requests at the moment.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req._id} className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                                    {/* Header */}
                                    <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#F4F6F9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white border border-[#E0E0E0] rounded-xl flex items-center justify-center text-[#0B3D91]">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#999999] font-bold uppercase tracking-wider">Survey Number</p>
                                                <h3 className="text-lg font-black text-[#222222]">{req.landId?.surveyNumber}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Transfer Parties Flow */}
                                        <div className="relative bg-[#F4F6F9] rounded-xl p-5 border border-[#E0E0E0] mb-6">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                                <div className="flex-1 text-center md:text-left">
                                                    <p className="text-xs text-[#555555] uppercase font-bold mb-1">Seller (Current Owner)</p>
                                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] flex items-center justify-center text-gray-400 text-xs shadow-sm">
                                                            <FaUser />
                                                        </div>
                                                        <span className="font-bold text-[#222222]">{req.sellerId?.name}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#0B3D91] text-white z-10 shadow-lg shadow-blue-900/20">
                                                    <FaArrowRight className="text-xs" />
                                                </div>

                                                <div className="flex-1 text-center md:text-right">
                                                    <p className="text-xs text-[#555555] uppercase font-bold mb-1">Buyer (New Owner)</p>
                                                    <div className="flex items-center justify-center md:justify-end gap-3">
                                                        <span className="font-bold text-[#222222]">{req.buyerId?.name}</span>
                                                        <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] flex items-center justify-center text-gray-400 text-xs shadow-sm">
                                                            <FaUser />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Tracker */}
                                        <div className="mb-8 px-2">
                                            <TransferProgress status={req.status} />
                                        </div>

                                        {/* Error State if Rejected */}
                                        {req.status === 'TRANSFER_REJECTED' && (
                                            <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                                <FaTimes className="text-[#D32F2F] mt-1" />
                                                <div>
                                                    <h4 className="text-[#D32F2F] font-bold text-sm">Transfer Rejected</h4>
                                                    <p className="text-[#B71C1C] text-sm mt-1">Reason: "{req.rejectionReason || 'No reason provided'}"</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions & Documents Footer */}
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-[#F4F6F9]">
                                            <div className="flex flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                <a href={req.saleDeedUrl} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-sm font-bold text-[#555555] hover:text-[#0B3D91] hover:border-[#0B3D91] transition-colors shadow-sm w-full md:w-auto justify-center">
                                                    <FaFileAlt /> Sale Deed
                                                </a>
                                                {req.verificationDocument && (
                                                    <a href={req.verificationDocument} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-sm font-bold text-[#555555] hover:text-[#2E8B57] hover:border-[#2E8B57] transition-colors shadow-sm w-full md:w-auto justify-center">
                                                        <FaShieldAlt /> Officer Report
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                {/* BUYER ACTIONS */}
                                                {user.role === 'FARMER' && user._id === req.buyerId?._id && req.status === 'TRANSFER_INITIATED' && (
                                                    <>
                                                        <button onClick={() => handleReject(req._id)} className="flex-1 md:flex-none px-5 py-2.5 border border-[#FFCDD2] text-[#D32F2F] bg-red-50 hover:bg-red-100 font-bold rounded-xl transition-colors">
                                                            Reject
                                                        </button>
                                                        <button onClick={() => handleAccept(req._id)} disabled={actionLoading === req._id}
                                                            className="flex-1 md:flex-none px-6 py-2.5 bg-[#2E8B57] text-white font-bold rounded-xl hover:bg-[#1B5E20] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                            {actionLoading === req._id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Accept Request
                                                        </button>
                                                    </>
                                                )}

                                                {/* OFFICER ACTIONS */}
                                                {user.role === 'OFFICER' && req.status === 'TRANSFER_ACCEPTED' && (
                                                    <>
                                                        <button onClick={() => handleReject(req._id)} className="flex-1 md:flex-none px-5 py-2.5 border border-[#FFCDD2] text-[#D32F2F] bg-red-50 hover:bg-red-100 font-bold rounded-xl transition-colors">
                                                            Reject
                                                        </button>
                                                        <button onClick={() => handleVerifyStart(req._id)}
                                                            className="flex-1 md:flex-none px-6 py-2.5 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                            <FaShieldAlt /> Verify & Upload
                                                        </button>
                                                    </>
                                                )}

                                                {/* ADMIN ACTIONS */}
                                                {user.role === 'ADMIN' && req.status === 'TRANSFER_VERIFIED' && (
                                                    <>
                                                        <button onClick={() => handleReject(req._id)} className="flex-1 md:flex-none px-5 py-2.5 border border-[#FFCDD2] text-[#D32F2F] bg-red-50 hover:bg-red-100 font-bold rounded-xl transition-colors">
                                                            Reject
                                                        </button>
                                                        <button onClick={() => handleApprove(req)} disabled={actionLoading === req._id}
                                                            className="flex-1 md:flex-none px-6 py-2.5 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                            {actionLoading === req._id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Approve & Mint
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Officer Verify Modal */}
                {selectedRequestId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E0E0E0]">
                            <div className="bg-[#0B3D91] p-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-3 backdrop-blur-sm border border-white/20">
                                    <FaShieldAlt />
                                </div>
                                <h3 className="text-xl font-bold text-white relative z-10">Upload Verification Report</h3>
                                <p className="text-blue-100 text-sm mt-1 relative z-10">Verify land details physically before uploading.</p>
                            </div>

                            <form onSubmit={handleVerifySubmit} className="p-8">
                                <div className="mb-6">
                                    <label className="block text-[#222222] font-bold mb-2">Select Document</label>
                                    <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-xl p-8 text-center hover:bg-[#F4F6F9] transition-colors cursor-pointer group">
                                        <input
                                            type="file"
                                            required
                                            onChange={e => setVerifyFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-[#555555] group-hover:text-[#222222]">
                                            {verifyFile ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-2xl text-[#0B3D91]"><FaFileContract /></span>
                                                    <span className="font-medium truncate max-w-[200px]">{verifyFile.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-[#F4F6F9] rounded-full flex items-center justify-center text-[#999999] mx-auto mb-2 text-xl group-hover:bg-[#E3F2FD] group-hover:text-[#0B3D91] transition-colors">
                                                        <FaFileUpload />
                                                    </div>
                                                    <p className="font-bold">Click to Upload Report</p>
                                                    <p className="text-xs opacity-70 mt-1">PDF, JPG or PNG</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRequestId(null)}
                                        className="flex-1 py-3 border border-[#E0E0E0] text-[#555555] font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-3 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <FaSpinner className="animate-spin" /> : 'Submit Report'}
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
