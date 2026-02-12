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
            case 'APPROVED': return <span className="bg-[#E6F4EA] text-[#1B5E20] px-3 py-1 rounded-full text-xs font-bold border border-[#A5D6A7]">🟢 Approved</span>;
            case 'REJECTED': return <span className="bg-red-50 text-[#D32F2F] px-3 py-1 rounded-full text-xs font-bold border border-red-200">🔴 Rejected</span>;
            default: return <span className="bg-yellow-50 text-[#F57F17] px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">🟡 Pending</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="gov-h1 mb-8">My Applications</h1>

                {loading ? <div className="text-center text-[#555555]">Loading...</div> : apps.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#E0E0E0] text-[#555555]">No applications found.</div>
                ) : (
                    <div className="space-y-4">
                        {apps.map(app => (
                            <div key={app._id} className="glass-card overflow-hidden border border-[#E0E0E0] hover:shadow-md transition-all">
                                {/* Header: Status & ID */}
                                <div className="bg-[#F9FAFB] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E0E0E0]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg border border-[#E0E0E0]">
                                            <span className="text-2xl">📝</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#222222] text-lg">{app.schemeId?.schemeName}</h3>
                                            <p className="text-xs text-[#555555] font-mono">App ID: {app._id.slice(-6).toUpperCase()}</p>
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
                                        <h4 className="text-xs font-bold text-[#555555] uppercase tracking-wider">Scheme Details</h4>
                                        <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                                            <span className="text-[#555555]">Type</span>
                                            <span className="font-bold text-[#222222]">{app.schemeId?.schemeType}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                                            <span className="text-[#555555]">Funding</span>
                                            <span className="font-bold text-[#222222]">{app.schemeId?.fundingPattern}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#F4F6F9] p-3 rounded-lg border border-[#E0E0E0]">
                                            <span className="text-xs font-bold text-[#555555] uppercase">Benefit</span>
                                            <span className="text-xl font-bold text-[#0B3D91]">₹{app.schemeId?.benefitAmount}</span>
                                        </div>
                                    </div>

                                    {/* Land Details */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-[#555555] uppercase tracking-wider">Land Record</h4>
                                        <div className="flex items-start gap-3 bg-[#FAFAFA] p-3 rounded-xl border border-[#E0E0E0]">
                                            <div className="text-2xl">🚜</div>
                                            <div>
                                                <p className="text-sm font-bold text-[#222222]">Survey No: {app.landId?.surveyNumber}</p>
                                                <p className="text-xs text-[#555555]">{app.landId?.area} Acres • {app.landId?.landType}</p>
                                                <p className="text-xs text-[#999999] mt-1">{app.landId?.district} District</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline & Documents */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-[#555555] uppercase tracking-wider">Tracking</h4>
                                        <div className="relative pl-4 border-l-2 border-[#E0E0E0] space-y-4">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#E0E0E0] ring-4 ring-white"></div>
                                                <p className="text-xs font-bold text-[#222222]">Application Submitted</p>
                                                <p className="text-[10px] text-[#999999]">{new Date(app.createdAt).toLocaleString()}</p>
                                            </div>
                                            {app.status !== 'PENDING' && (
                                                <div className="relative">
                                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${app.status === 'APPROVED' ? 'bg-[#2E8B57]' : 'bg-[#D32F2F]'}`}></div>
                                                    <p className="text-xs font-bold text-[#222222]">Reviewed by Admin</p>
                                                    <p className="text-[10px] text-[#999999]">{app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : 'Recently'}</p>
                                                    {app.adminRemarks && (
                                                        <p className="mt-1 text-xs bg-red-50 text-[#D32F2F] p-2 rounded border border-red-100">
                                                            "{app.adminRemarks}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {app.documents && app.documents.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                                                <p className="text-xs font-bold text-[#555555] mb-2">Attached Documents:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {app.documents.map((doc, idx) => (
                                                        <a key={idx} href={doc} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-white border border-[#E0E0E0] rounded hover:bg-[#F4F6F9] text-[#222222] flex items-center gap-1">
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
