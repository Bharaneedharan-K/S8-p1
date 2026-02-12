import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaMapMarkedAlt, FaRulerCombined, FaCalendarAlt, FaFileAlt, FaExchangeAlt, FaUser, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';

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

    const StatusBadge = ({ land }) => {
        let status = land.status;
        let config = { color: '', icon: null, label: '' };

        if (status === 'LAND_APPROVED') {
            config = { color: 'bg-green-50 text-green-700 border-green-200', icon: <FaCheckCircle />, label: 'Verified & Minted' };
        } else if (status === 'LAND_REJECTED') {
            config = { color: 'bg-red-50 text-red-700 border-red-200', icon: <FaTimesCircle />, label: 'Rejected' };
        } else if (land.verificationDocument) {
            config = { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <FaClock />, label: 'Pending Admin Approval' };
        } else {
            config = { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <FaClock />, label: 'Scheduled (Officer Pending)' };
        }

        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${config.color}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#0B3D91] rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-900/20">
                        <FaMapMarkedAlt />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] tracking-tight">
                            {user?.role === 'FARMER' ? 'My Land Records' : 'Land Registry'}
                        </h1>
                        <p className="text-[#555555] text-sm mt-1">
                            {user?.role === 'FARMER'
                                ? 'View and manage the verification status of your lands.'
                                : 'Overview of all submitted land records.'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#0B3D91]/30 border-t-[#0B3D91] rounded-full animate-spin mb-4"></div>
                        <p className="text-[#555555] font-medium">Loading records...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-[#D32F2F] p-4 rounded-xl border border-red-200 text-center flex items-center justify-center gap-2 mb-6">
                        <span>⚠️</span> {error}
                    </div>
                ) : lands.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-[#E0E0E0] shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl text-gray-300 mx-auto mb-4">
                            <FaMapMarkedAlt />
                        </div>
                        <h3 className="text-xl font-bold text-[#222222] mb-2">No Land Records Found</h3>
                        <p className="text-[#555555]">You haven't registered any lands yet.</p>
                        {user?.role === 'OFFICER' && (
                            <p className="text-sm text-[#999999] mt-1">Use the "Register New Land" page to add records.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lands.map((land) => (
                            <div key={land._id} className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden group flex flex-col">
                                {/* Card Header */}
                                <div className="bg-[#F9FAFB] px-5 py-4 border-b border-[#F4F6F9] flex justify-between items-center">
                                    <span className="px-2.5 py-1 bg-white items-center gap-1.5 flex text-[#555555] text-xs font-bold rounded-lg border border-[#E0E0E0] shadow-sm">
                                        <FaMapMarkerAlt className="text-[#0B3D91]" /> {land.landType}
                                    </span>
                                    <StatusBadge land={land} />
                                </div>

                                <div className="p-5 flex-1">
                                    <h3 className="text-2xl font-black text-[#222222] mb-1 tracking-tight">{land.surveyNumber}</h3>
                                    <p className="text-[#555555] text-sm mb-5 flex items-center gap-1.5 font-medium">
                                        <FaMapMarkedAlt className="text-[#999999]" /> {land.district}, India
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div className="bg-[#F4F6F9] p-3 rounded-xl border border-[#E0E0E0]">
                                            <p className="text-xs text-[#999999] font-bold uppercase mb-1">Area</p>
                                            <p className="text-[#222222] font-bold flex items-center gap-1.5">
                                                <FaRulerCombined className="text-[#0B3D91]" /> {land.area} Ac
                                            </p>
                                        </div>
                                        <div className="bg-[#F4F6F9] p-3 rounded-xl border border-[#E0E0E0]">
                                            <p className="text-xs text-[#999999] font-bold uppercase mb-1">Date</p>
                                            <p className="text-[#222222] font-bold flex items-center gap-1.5">
                                                <FaCalendarAlt className="text-[#0B3D91]" /> {new Date(land.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {land.status === 'LAND_REJECTED' && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-xs font-bold text-[#D32F2F] uppercase mb-1 flex items-center gap-1"><FaTimesCircle /> Rejection Reason</p>
                                            <p className="text-sm text-[#D32F2F] italic">"{land.rejectionReason}"</p>
                                        </div>
                                    )}

                                    {land.status === 'LAND_APPROVED' && (
                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold text-[#999999] uppercase mb-1">Blockchain Hash</p>
                                            <div className="flex items-center gap-2 bg-[#F4F6F9] p-2 rounded-lg border border-[#E0E0E0] group-hover:border-[#0B3D91]/20 transition-colors">
                                                <p className="text-[10px] text-[#555555] font-mono truncate flex-1 leading-none select-all" title={land.landHash}>
                                                    {land.landHash || 'Pending Sync...'}
                                                </p>
                                                {land.landHash && (
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(land.landHash)}
                                                        className="text-[#0B3D91] hover:text-[#092C6B] transition-colors p-1 rounded hover:bg-white"
                                                        title="Copy Hash"
                                                    >
                                                        📋
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="p-5 pt-0 mt-auto grid gap-3">
                                    {land.verificationDocument || land.documentUrl ? (
                                        <a
                                            href={land.verificationDocument || land.documentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#E0E0E0] text-[#555555] font-bold rounded-xl hover:bg-[#F4F6F9] hover:text-[#0B3D91] hover:border-[#0B3D91] transition-all text-sm group-hover:shadow-sm"
                                        >
                                            <FaFileAlt /> {land.verificationDocument ? 'View Verified Report' : 'View Application Doc'}
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#E0E0E0] text-gray-300 font-bold rounded-xl cursor-not-allowed text-sm"
                                        >
                                            <FaFileAlt /> No Document
                                        </button>
                                    )}

                                    {/* Transfer Button (Only for Farmer & Approved Lands) */}
                                    {user?.role === 'FARMER' && land.status === 'LAND_APPROVED' && (
                                        <button
                                            onClick={() => handleTransferClick(land)}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#222222] text-white font-bold rounded-xl hover:bg-black transition-colors text-sm shadow-md hover:shadow-lg"
                                        >
                                            <FaExchangeAlt /> Transfer Ownership
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E0E0E0]">
                            <div className="bg-[#0B3D91] p-6 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Transfer Ownership</h2>
                                    <p className="text-blue-100 text-sm">Land Survey No: {selectedLand?.surveyNumber}</p>
                                </div>
                                <button onClick={() => setShowTransferModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white">
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                {successMsg ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center animate-slideIn">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
                                            <FaCheckCircle />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-800 mb-2">Request Sent!</h3>
                                        <p className="text-green-700">{successMsg}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleTransferSubmit} className="space-y-6">
                                        {error && <div className="text-[#D32F2F] text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"><FaTimesCircle /> {error}</div>}

                                        <div>
                                            <label className="block text-sm font-bold text-[#222222] mb-1.5">Buyer's Email Address</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    value={transferData.buyerEmail}
                                                    onChange={(e) => setTransferData({ ...transferData, buyerEmail: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all"
                                                    placeholder="e.g. buyer@example.com"
                                                />
                                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#222222] mb-1.5">Upload Sale Deed</label>
                                            <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 text-center hover:bg-[#F9FAFB] transition-colors group cursor-pointer">
                                                <input
                                                    type="file"
                                                    required
                                                    onChange={(e) => setTransferData({ ...transferData, saleDeed: e.target.files[0] })}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className="w-10 h-10 bg-blue-50 text-[#0B3D91] rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <FaFileAlt />
                                                    </div>
                                                    <p className="text-sm font-bold text-[#555555] group-hover:text-[#222222] transition-colors">{transferData.saleDeed ? transferData.saleDeed.name : 'Click to Upload Deed'}</p>
                                                    <p className="text-xs text-[#999999] mt-1">PDF or Image (Max 5MB)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#222222] mb-1.5">Select Officer for Verification <span className="text-[#D32F2F]">*</span></label>
                                            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-[#E0E0E0] rounded-xl p-2 bg-[#F9FAFB]">
                                                {officers.length === 0 ? (
                                                    <div className="text-center py-4 text-[#999999]">
                                                        <p className="text-sm italic">No active officers found in {selectedLand?.district}.</p>
                                                    </div>
                                                ) : (
                                                    officers.map(off => (
                                                        <div
                                                            key={off._id}
                                                            onClick={() => setTransferData({ ...transferData, officerId: off._id })}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${transferData.officerId === off._id
                                                                ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-md'
                                                                : 'bg-white text-[#222222] border-[#E0E0E0] hover:border-[#0B3D91]'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 ${transferData.officerId === off._id ? 'bg-white text-[#0B3D91] border-transparent' : 'bg-blue-50 text-[#0B3D91] border-white shadow-sm'
                                                                }`}>
                                                                {off.name.charAt(0)}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="font-bold text-sm truncate">{off.name}</p>
                                                                <p className={`text-xs font-medium truncate ${transferData.officerId === off._id ? 'text-blue-100' : 'text-[#555555]'
                                                                    }`}>
                                                                    📍 {off.area || 'General Area'}
                                                                </p>
                                                            </div>
                                                            {transferData.officerId === off._id && <FaCheckCircle className="ml-auto text-white" />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-2 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowTransferModal(false)}
                                                className="flex-1 py-3 border border-[#E0E0E0] text-[#555555] font-bold rounded-xl hover:bg-[#F4F6F9] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={transferLoading || !transferData.officerId}
                                                className="flex-1 py-3 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {transferLoading ? <FaSpinner className="animate-spin" /> : 'Initiate Transfer'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
