import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const LandRecordsPage = () => {
    const { token, user } = useContext(AuthContext);
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedLand, setSelectedLand] = useState(null);
    const [transferData, setTransferData] = useState({ buyerEmail: '', saleDeed: null });
    const [transferLoading, setTransferLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchLands = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get('/land');
                setLands(res.data.lands || []);
            } catch (err) {
                setError('Failed to fetch land records.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLands();
    }, [token]);

    const [officers, setOfficers] = useState([]);

    const handleTransferClick = async (land) => {
        setSelectedLand(land);
        setShowTransferModal(true);
        setTransferData({ buyerEmail: '', saleDeed: null, officerId: '' });
        setError('');
        setSuccessMsg('');

        // Fetch Officers in Land's District
        try {
            const res = await apiClient.get(`/auth/users?role=OFFICER&district=${land.district}&status=OFFICER_ACTIVE`);
            setOfficers(res.data.users || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLand) return;

        try {
            setTransferLoading(true);
            const formData = new FormData();
            formData.append('landId', selectedLand._id);
            formData.append('buyerEmail', transferData.buyerEmail);
            formData.append('saleDeed', transferData.saleDeed);
            if (transferData.officerId) formData.append('officerId', transferData.officerId);

            await apiClient.post('/transfer/initiate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessMsg('Transfer Request Initiated Successfully!');
            setTimeout(() => {
                setShowTransferModal(false);
                setSuccessMsg('');
            }, 2000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to initiate transfer');
        } finally {
            setTransferLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'LAND_APPROVED':
                return <span className="bg-[#E6F4EA] text-[#2C3318] px-3 py-1 rounded-full text-xs font-bold border border-[#A5C89E]">✅ Verified & Minted</span>;
            case 'LAND_REJECTED':
                return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">❌ Rejected</span>;
            default:
                return <span className="bg-[#FFFBB1] text-[#4A5532] px-3 py-1 rounded-full text-xs font-bold border border-[#AEB877]/30">⏳ Pending Approval</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3318]">
                            {user?.role === 'FARMER' ? 'My Land Records' : 'Land Registry'}
                        </h1>
                        <p className="text-[#5C6642] mt-1">
                            {user?.role === 'FARMER'
                                ? 'View the verification status of your registered lands.'
                                : 'Overview of all submitted land records and their blockchain status.'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-[#AEB877] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-[#5C6642]">Loading records...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center">
                        {error}
                    </div>
                ) : lands.length === 0 ? (
                    <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-[#AEB877]/30">
                        <p className="text-2xl mb-2">�</p>
                        <p className="text-[#5C6642] font-bold">No land records found.</p>
                        {user?.role === 'OFFICER' && (
                            <p className="text-sm text-[#9CA385] mt-1">Use the "Add Land" page to register new plots.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lands.map((land) => (
                            <div key={land._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#AEB877]/10 hover:shadow-md transition-all hover:scale-[1.01]">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-[#F2F5E6] text-[#4A5532] text-xs font-bold rounded uppercase tracking-wider">
                                        {land.landType}
                                    </span>
                                    {getStatusBadge(land.status)}
                                </div>

                                <h3 className="text-xl font-bold text-[#2C3318] mb-1">{land.surveyNumber}</h3>
                                <p className="text-[#5C6642] text-sm mb-4 flex items-center gap-1">
                                    <span>📍</span> {land.district}
                                </p>

                                <div className="space-y-3 border-t border-[#AEB877]/10 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#9CA385]">Owner</span>
                                        <span className="font-bold text-[#4A5532]">{land.ownerName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#9CA385]">Area</span>
                                        <span className="font-bold text-[#4A5532]">{land.area} Acres</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#9CA385]">Submitted</span>
                                        <span className="font-bold text-[#4A5532]">{new Date(land.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {land.status === 'LAND_REJECTED' && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="text-xs font-bold text-red-800 uppercase mb-1">⚠️ Rejection Remark</p>
                                        <p className="text-sm text-red-600 italic">"{land.rejectionReason}"</p>
                                    </div>
                                )}

                                {land.status === 'LAND_APPROVED' && (
                                    <div className="mt-4 pt-4 border-t border-[#AEB877]/10">
                                        <p className="text-xs font-bold text-[#9CA385] uppercase mb-1">Blockchain Hash</p>
                                        <div className="flex items-center gap-2 bg-[#F2F5E6] p-2 rounded border border-[#AEB877]/20">
                                            <p className="text-xs text-[#2C3318] font-mono truncate flex-1" title={land.landHash}>
                                                {land.landHash || 'Pending Sync...'}
                                            </p>
                                            {land.landHash && (
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(land.landHash)}
                                                    className="text-[#AEB877] hover:text-[#4A5532] transition-colors p-1"
                                                    title="Copy Hash"
                                                >
                                                    📋
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <a
                                        href={land.documentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block w-full text-center py-2 border border-[#AEB877] text-[#4A5532] font-bold rounded-xl hover:bg-[#AEB877] hover:text-white transition-colors text-sm"
                                    >
                                        📄 View Document
                                    </a>

                                    {/* Transfer Button (Only for Farmer & Approved Lands) */}
                                    {user?.role === 'FARMER' && land.status === 'LAND_APPROVED' && (
                                        <button
                                            onClick={() => handleTransferClick(land)}
                                            className="mt-3 block w-full text-center py-2 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] transition-colors text-sm"
                                        >
                                            🔁 Transfer Ownership
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3318]/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-[#AEB877]/20 anim-scale-in">
                            <div className="flex justify-between items-center mb-6 border-b border-[#E2E6D5] pb-4">
                                <h2 className="text-2xl font-bold text-[#2C3318]">Transfer Ownership</h2>
                                <button onClick={() => setShowTransferModal(false)} className="text-[#9CA385] hover:text-[#2C3318] text-xl">✕</button>
                            </div>

                            {successMsg ? (
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-center font-bold mb-4">
                                    {successMsg}
                                </div>
                            ) : (
                                <form onSubmit={handleTransferSubmit} className="space-y-4">
                                    {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

                                    <div>
                                        <label className="block text-sm font-bold text-[#5C6642] mb-1">Buyer's Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={transferData.buyerEmail}
                                            onChange={(e) => setTransferData({ ...transferData, buyerEmail: e.target.value })}
                                            className="input-modern w-full"
                                            placeholder="Enter buyer's registered email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#5C6642] mb-1">Upload Sale Deed</label>
                                        <input
                                            type="file"
                                            required
                                            onChange={(e) => setTransferData({ ...transferData, saleDeed: e.target.files[0] })}
                                            className="block w-full text-sm text-[#5C6642] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#AEB877] file:text-[#2C3318] hover:file:bg-[#8B9850]"
                                        />
                                        <p className="text-xs text-[#9CA385] mt-1">Legally binding sale agreement.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#5C6642] mb-1">Select Verification Officer <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar border border-[#AEB877]/20 rounded-xl p-2 bg-[#F2F5E6]">
                                            {officers.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic col-span-2 text-center py-2">No active officers in {selectedLand.district}.</p>
                                            ) : (
                                                officers.map(off => (
                                                    <div
                                                        key={off._id}
                                                        onClick={() => setTransferData({ ...transferData, officerId: off._id })}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${transferData.officerId === off._id
                                                            ? 'bg-[#2C3318] text-white border-[#2C3318]'
                                                            : 'bg-white text-[#2C3318] border-[#E2E6D5] hover:border-[#AEB877]'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${transferData.officerId === off._id ? 'bg-[#AEB877] text-[#2C3318]' : 'bg-[#AEB877]/20 text-[#4A5532]'
                                                            }`}>
                                                            {off.name.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-xs truncate">{off.name}</p>
                                                            <p className={`text-[10px] font-bold truncate ${transferData.officerId === off._id ? 'text-[#AEB877]' : 'text-[#5C6642]'
                                                                }`}>
                                                                📍 {off.area || 'General'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowTransferModal(false)}
                                            className="flex-1 py-3 border border-[#AEB877] text-[#5C6642] font-bold rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={transferLoading || !transferData.officerId}
                                            className="flex-1 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {transferLoading ? 'Processing...' : 'Initiate Transfer'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
