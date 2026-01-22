import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const LandRecordsPage = () => {
    const { token, user } = useContext(AuthContext);
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLands = async () => {
            try {
                setLoading(true);
                // Backend automatically filters based on role (Farmer -> Own lands, Officer -> All/District in future)
                const res = await axios.get('/api/land', {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};
