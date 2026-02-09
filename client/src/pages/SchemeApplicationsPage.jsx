import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { TN_DISTRICTS } from '../utils/constants';

export const SchemeApplicationsPage = () => {
    const { token } = useContext(AuthContext);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [schemes, setSchemes] = useState([]); // For filter dropdown

    // Filters
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [districtFilter, setDistrictFilter] = useState('');
    const [schemeFilter, setSchemeFilter] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Initial Fetch (Schemes List & Apps)
    useEffect(() => {
        const fetchSchemesList = async () => {
            try {
                const res = await apiClient.get('/schemes/active'); // Or separate endpoint for all schemes names
                setSchemes(res.data.schemes || []);
            } catch (err) { console.error('Failed to fetch schemes list', err); }
        };
        fetchSchemesList();
    }, [token]);

    useEffect(() => {
        fetchApps();
    }, [token, statusFilter, districtFilter, schemeFilter]);

    const fetchApps = async () => {
        try {
            setLoading(true);
            let query = `/applications?status=${statusFilter}`;
            if (districtFilter) query += `&district=${districtFilter}`;
            if (schemeFilter) query += `&schemeId=${schemeFilter}`;

            const res = await apiClient.get(query);
            setApps(res.data.applications);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleReview = async (appId, status) => {
        const remarks = status === 'REJECTED' ? prompt('Enter Rejection Reason (Required):') : window.confirm('Approve this application?') ? 'Approved by Admin' : null;

        if (!remarks) return; // Cancelled or empty
        if (status === 'REJECTED' && remarks.trim() === '') return;

        setProcessingId(appId);
        try {
            await apiClient.patch(`/applications/${appId}/review`, { status, adminRemarks: remarks });
            fetchApps(); // Refresh list
        } catch (err) {
            alert('Review failed');
        } finally {
            setProcessingId(null);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-50 text-red-700 border-red-200'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold border ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <div className="min-h-screen bg-[#E2E6D5] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3318]">Applications Review</h1>
                        <p className="text-[#5C6642] mt-1">Manage and verify farmer scheme applications.</p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#AEB877]/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#9CA385] uppercase mb-1">Status</label>
                        <select
                            className="w-full p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#2C3318] focus:outline-none focus:border-[#AEB877]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Applications</option>
                            <option value="PENDING">Pending Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#9CA385] uppercase mb-1">Filter by Scheme</label>
                        <select
                            className="w-full p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#2C3318] focus:outline-none focus:border-[#AEB877]"
                            value={schemeFilter}
                            onChange={(e) => setSchemeFilter(e.target.value)}
                        >
                            <option value="">All Schemes</option>
                            {schemes.map(s => <option key={s._id} value={s._id}>{s.schemeName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#9CA385] uppercase mb-1">Filter by District</label>
                        <select
                            className="w-full p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#2C3318] focus:outline-none focus:border-[#AEB877]"
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                        >
                            <option value="">All Districts</option>
                            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* Applications Grid */}
                {loading ? (
                    <div className="text-center py-12 text-[#5C6642]">Loading applications...</div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#AEB877]/30">
                        <p className="text-4xl mb-4">📂</p>
                        <p className="text-[#5C6642] font-bold text-lg">No applications found matching filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.map(app => (
                            <div key={app._id} className="bg-white rounded-xl p-4 shadow-sm border border-[#AEB877]/20 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                                {/* Header: Status & Farmer */}
                                <div className="flex justify-between items-start mb-3 border-b border-[#F2F5E6] pb-2">
                                    <div>
                                        <h3 className="font-bold text-[#2C3318] text-lg">{app.farmerId?.name}</h3>
                                        <p className="text-xs text-[#5C6642] font-mono">{app.farmerId?.mobile}</p>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>

                                {/* Scheme Info */}
                                <div className="mb-3 bg-[#FFFBB1]/10 p-2 rounded-lg border border-[#AEB877]/10">
                                    <h4 className="text-[10px] font-bold text-[#9CA385] uppercase mb-1">Applying For</h4>
                                    <p className="font-bold text-[#2C3318] text-sm leading-tight">{app.schemeId?.schemeName}</p>
                                    <div className="flex gap-3 mt-1 text-xs">
                                        <span>Benefit: <b className="text-[#4A5532]">₹{app.schemeId?.benefitAmount}</b></span>
                                    </div>
                                </div>

                                {/* Land Info */}
                                <div className="mb-3 pl-2 border-l-2 border-[#AEB877]/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🚜</span>
                                        <div>
                                            <p className="text-xs font-bold text-[#2C3318]">Survey {app.landId?.surveyNumber}</p>
                                            <p className="text-[10px] text-[#5C6642]">{app.landId?.area} Acres, {app.district}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Link */}
                                {app.documents && app.documents.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {app.documents.map((doc, i) => (
                                                <a key={i} href={doc} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold text-[#5C6642] hover:bg-[#2C3318] hover:text-white transition-colors">
                                                    📄 Doc {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Spacer to push buttons to bottom */}
                                <div className="mt-auto pt-2">
                                    {app.status === 'PENDING' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReview(app._id, 'APPROVED')}
                                                disabled={processingId === app._id}
                                                className="flex-1 py-1.5 bg-[#2C3318] hover:bg-[#4A5532] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReview(app._id, 'REJECTED')}
                                                disabled={processingId === app._id}
                                                className="flex-1 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            <p className="text-[10px] font-bold text-[#9CA385] uppercase">
                                                {app.status === 'APPROVED' ? 'Verified & Approved' : 'Rejected'}
                                            </p>
                                            {app.adminRemarks && (
                                                <p className="text-[10px] text-[#5C6642] italic truncate" title={app.adminRemarks}>"{app.adminRemarks}"</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
