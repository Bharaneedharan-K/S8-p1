import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const MyApplicationsPage = () => {
    const { token } = useContext(AuthContext);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await apiClient.get('/applications/my');
                setApps(res.data.applications);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchApps();
    }, [token]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">🟢 Approved</span>;
            case 'REJECTED': return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">🔴 Rejected</span>;
            default: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">🟡 Pending</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[#2C3318] mb-8">My Applications</h1>

                {loading ? <div className="text-center">Loading...</div> : apps.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">No applications found.</div>
                ) : (
                    <div className="space-y-4">
                        {apps.map(app => (
                            <div key={app._id} className="bg-white rounded-2xl shadow-sm border border-[#AEB877]/20 overflow-hidden hover:shadow-md transition-all">
                                {/* Header: Status & ID */}
                                <div className="bg-[#F9FAFB] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#AEB877]/10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg border border-[#AEB877]/20">
                                            <span className="text-2xl">📝</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#2C3318] text-lg">{app.schemeId?.schemeName}</h3>
                                            <p className="text-xs text-[#5C6642] font-mono">App ID: {app._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(app.status)}
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Scheme Details */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-[#9CA385] uppercase tracking-wider">Scheme Details</h4>
                                        <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                                            <span className="text-[#5C6642]">Type</span>
                                            <span className="font-bold text-[#2C3318]">{app.schemeId?.schemeType}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                                            <span className="text-[#5C6642]">Funding</span>
                                            <span className="font-bold text-[#2C3318]">{app.schemeId?.fundingPattern}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#F2F5E6] p-3 rounded-lg">
                                            <span className="text-xs font-bold text-[#4A5532] uppercase">Benefit</span>
                                            <span className="text-xl font-bold text-[#2C3318]">₹{app.schemeId?.benefitAmount}</span>
                                        </div>
                                    </div>

                                    {/* Land Details */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-[#9CA385] uppercase tracking-wider">Land Record</h4>
                                        <div className="flex items-start gap-3 bg-[#FAFAF5] p-3 rounded-xl border border-[#AEB877]/10">
                                            <div className="text-2xl">🚜</div>
                                            <div>
                                                <p className="text-sm font-bold text-[#2C3318]">Survey No: {app.landId?.surveyNumber}</p>
                                                <p className="text-xs text-[#5C6642]">{app.landId?.area} Acres • {app.landId?.landType}</p>
                                                <p className="text-xs text-[#9CA385] mt-1">{app.landId?.district} District</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline & Documents */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-[#9CA385] uppercase tracking-wider">Tracking</h4>
                                        <div className="relative pl-4 border-l-2 border-[#AEB877]/20 space-y-4">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#AEB877] ring-4 ring-white"></div>
                                                <p className="text-xs font-bold text-[#2C3318]">Application Submitted</p>
                                                <p className="text-[10px] text-[#9CA385]">{new Date(app.createdAt).toLocaleString()}</p>
                                            </div>
                                            {app.status !== 'PENDING' && (
                                                <div className="relative">
                                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${app.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <p className="text-xs font-bold text-[#2C3318]">reviewed by Admin</p>
                                                    <p className="text-[10px] text-[#9CA385]">{app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : 'Recently'}</p>
                                                    {app.adminRemarks && (
                                                        <p className="mt-1 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                                                            "{app.adminRemarks}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {app.documents && app.documents.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-[#AEB877]/10">
                                                <p className="text-xs font-bold text-[#5C6642] mb-2">Attached Documents:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {app.documents.map((doc, idx) => (
                                                        <a key={idx} href={doc} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-white border border-[#AEB877]/30 rounded hover:bg-[#F2F5E6] text-[#2C3318] flex items-center gap-1">
                                                            📄 View Doc {idx + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
