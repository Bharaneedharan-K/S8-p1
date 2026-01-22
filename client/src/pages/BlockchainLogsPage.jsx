import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const BlockchainLogsPage = () => {
    const { token } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Fetch only approved lands which represent blockchain transactions
                const res = await axios.get('/api/land?status=LAND_APPROVED', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data.lands || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#FCFDF5] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2C3318] flex items-center gap-3">
                        <span className="text-4xl">⛓️</span> Blockchain Ledger
                    </h1>
                    <p className="text-[#5C6642] mt-2">
                        Immutable record of all land verification transactions committed to the Local Ethereum Network.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-[#AEB877] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-[#5C6642]">Syncing with Ledger...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#AEB877]/30">
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-[#5C6642] font-bold">No transactions found on the blockchain yet.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#AEB877]/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F2F5E6] border-b border-[#AEB877]/20">
                                    <tr>
                                        <th className="px-6 py-4 text-[#4A5532] font-bold text-xs uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-4 text-[#4A5532] font-bold text-xs uppercase tracking-wider">Survey No</th>
                                        <th className="px-6 py-4 text-[#4A5532] font-bold text-xs uppercase tracking-wider">Transaction Hash (Tx)</th>
                                        <th className="px-6 py-4 text-[#4A5532] font-bold text-xs uppercase tracking-wider">Data Hash</th>
                                        <th className="px-6 py-4 text-[#4A5532] font-bold text-xs uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#AEB877]/10">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-[#F2F5E6]/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C6642]">
                                                {new Date(log.blockchainTimestamp || log.updatedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#2C3318]">
                                                {log.surveyNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono max-w-[120px] truncate" title={log.txHash}>
                                                        {log.txHash}
                                                    </code>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(log.txHash)}
                                                        className="text-[#AEB877] hover:text-[#4A5532]"
                                                        title="Copy Tx Hash"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <code className="bg-[#E6F4EA] text-[#2C3318] px-2 py-1 rounded text-xs font-mono max-w-[120px] truncate" title={log.landHash}>
                                                    {log.landHash}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Confirmed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
