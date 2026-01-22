import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const MyApplicationsPage = () => {
    const { token } = useContext(AuthContext);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await axios.get('/api/applications/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
                            <div key={app._id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#AEB877]/20 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(app.status)}
                                        <span className="text-sm text-[#9CA385]">{new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#2C3318]">{app.schemeId?.schemeName}</h3>
                                    <p className="text-[#5C6642] text-sm mt-1">
                                        Land: <span className="font-bold">{app.landId?.surveyNumber}</span> ({app.landId?.area} Acres)
                                    </p>
                                    {app.status === 'REJECTED' && (
                                        <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                            <strong>Remark:</strong> {app.adminRemarks}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center items-end min-w-[120px]">
                                    <span className="text-xs font-bold text-[#9CA385] uppercase">Benefit</span>
                                    <span className="text-2xl font-bold text-[#2C3318]">₹{app.schemeId?.benefitAmount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
