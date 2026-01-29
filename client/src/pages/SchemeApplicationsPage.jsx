import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const SchemeApplicationsPage = () => {
    const { token } = useContext(AuthContext);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchApps = async () => {
        try {
            const res = await axios.get('/api/applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApps(res.data.applications);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchApps(); }, [token]);

    const handleReview = async (appId, status) => {
        const remarks = status === 'REJECTED' ? prompt('Enter Rejection Reason:') : 'Approved by Admin';
        if (status === 'REJECTED' && !remarks) return;

        setProcessingId(appId);
        try {
            await axios.patch(`/api/applications/${appId}/review`, { status, adminRemarks: remarks }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchApps();
        } catch (err) {
            alert('Review failed');
        } finally {
            setProcessingId(null);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-50 text-red-700'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <div className="min-h-screen bg-[#FCFDF5] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[#2C3318] mb-8">Scheme Applications</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-[#AEB877]/20 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#FFFBB1]">
                            <tr>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Farmer Name</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Scheme</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Land Details</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Status</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#AEB877]/10">
                            {apps.map(app => (
                                <tr key={app._id} className="hover:bg-[#F2F5E6]/30">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-[#2C3318]">{app.farmerId?.name}</p>
                                        <p className="text-xs text-[#5C6642]">Ph: {app.farmerId?.mobile}</p>
                                    </td>
                                    <td className="px-6 py-4">{app.schemeId?.schemeName}</td>
                                    <td className="px-6 py-4 text-sm text-[#5C6642]">
                                        <p>Sur: {app.landId?.surveyNumber}</p>
                                        <p>{app.landId?.area} Acres, {app.district}</p>
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                    <td className="px-6 py-4">
                                        {app.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReview(app._id, 'APPROVED')}
                                                    disabled={processingId === app._id}
                                                    className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReview(app._id, 'REJECTED')}
                                                    disabled={processingId === app._id}
                                                    className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {app.status !== 'PENDING' && <span className="text-xs text-gray-400">Reviewed</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
