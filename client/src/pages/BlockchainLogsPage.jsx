import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ethers } from 'ethers';
import LandRegistry from '../blockchain/LandRegistry.json';

// 1. Define Error Boundary Component (Catches Crashes)
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary Caught:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 p-8 flex flex-col items-center justify-center text-red-900">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-red-200 max-w-2xl w-full">
                        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>💥</span> Application Crashed
                        </h1>
                        <div className="mb-4">
                            <p className="font-bold">Error Message:</p>
                            <pre className="bg-red-100 p-3 rounded text-sm overflow-auto text-red-800 border border-red-200">
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// 2. The Main Content Component
const BlockchainLogsContent = () => {
    const { token } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalLands: 0, lastBlock: 0 });
    const [logs, setLogs] = useState(["Ready to fetch."]);

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    const fetchLogs = async () => {
        setLoading(true);
        setLogs(["Starting fetch sequence..."]);
        try {
            // A. Check Artifacts
            addLog("Checking Artifacts...");
            if (!LandRegistry || !LandRegistry.address) {
                throw new Error("LandRegistry.json is missing 'address' field.");
            }
            addLog(`Address found: ${LandRegistry.address}`);

            // B. Connect Provider
            addLog("Connecting to JSON-RPC...");
            const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
            const network = await provider.getNetwork();
            addLog(`Connected to Chain ID: ${network.chainId.toString()}`);

            // C. Contract
            addLog("Initializing Contract...");
            const contract = new ethers.Contract(LandRegistry.address, LandRegistry.abi, provider);

            // D. Stats
            addLog("Fetching Block Number...");
            const blockNum = await provider.getBlockNumber();
            addLog(`Block: ${blockNum}`);

            addLog("Fetching Total Lands...");
            const totalBig = await contract.totalLands();
            const totalNum = Number(totalBig);
            addLog(`Total: ${totalNum} (converted from BigInt)`);

            setStats({ totalLands: totalNum, lastBlock: blockNum });

            // E. Events
            addLog("Querying Events (LandRegistered)...");
            const filter = contract.filters.LandRegistered();
            const rawLogs = await contract.queryFilter(filter, 0, 'latest');
            addLog(`Raw Events Found: ${rawLogs.length}`);

            const parsed = [];
            for (const log of rawLogs) {
                try {
                    // Defensive Parsing & Debugging [object Object]
                    // In Ethers v6, indexed strings in events are HASHED.
                    // Non-indexed strings are recoverable.
                    // If args[0] is an object/Proxy, we explicitly convert it.

                    let survey = "Unknown";
                    let hash = "Unknown";
                    let tsp = "Unknown";
                    let registrar = "Unknown";

                    if (log.args) {
                        // 1. Survey Number (Indexed String -> Topic Hash)
                        // IMPORTANT: In Solidity 'event LandRegistered(string indexed surveyNumber...)',
                        // The string value is Keccak-256 hashed because it is indexed.
                        // You CANNOT recover the original string from the log if it is indexed.
                        // We must rely on the non-indexed params or just show the hash.
                        // OR, if the contract was not indexed, we'd see the string.
                        // For now, let's dump what we have.
                        survey = log.args[0] ? String(log.args[0]) : "Unknown";

                        // 2. Land Hash (Non-indexed String) -> Should be visible
                        hash = log.args[1] ? String(log.args[1]) : "Unknown";

                        // 3. Timestamp (uint256)
                        try {
                            const tsNum = Number(log.args[2]);
                            tsp = new Date(tsNum * 1000).toLocaleString();
                        } catch (e) {
                            tsp = "Invalid Time";
                        }

                        // 4. Registrar Address
                        registrar = log.args[3] ? String(log.args[3]) : "Unknown";
                    }

                    parsed.push({
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber,
                        surveyNumber: survey,
                        landHash: hash,
                        timestamp: tsp,
                        registrar: registrar
                    });
                } catch (parseErr) {
                    addLog(`Error parsing log ${log.transactionHash}: ${parseErr.message}`);
                }
            }

            setEvents(parsed.reverse());
            addLog("Events parsed & state updated. Rendering...");

        } catch (err) {
            console.error(err);
            addLog(`CRITICAL ERROR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3318]">Blockchain Audit Trail</h1>
                        <p className="text-[#5C6642]">Immutable Ledger of Land Registrations</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="px-6 py-2 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Fetching...' : '🔄 Refresh Logs'}
                    </button>
                </div>

                {/* Debug Box */}
                <div className="mb-6 bg-black/90 p-4 rounded-xl text-green-400 font-mono text-xs max-h-48 overflow-y-auto border border-green-900 shadow-inner">
                    <div className="font-bold text-white border-b border-green-800 pb-1 mb-2 sticky top-0 bg-black/90">LIVE LOGS:</div>
                    {logs.map((L, i) => <div key={i}>{L}</div>)}
                </div>

                {/* Info Alert about Indexed Strings */}
                <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-800">
                    <p className="font-bold">ℹ️ Note on Survey Numbers:</p>
                    <p>
                        In Ethereum logs, <b>indexed strings</b> are hashed (Keccak-256).
                        If you see a long hash in the "Survey No." column, that is the cryptographic proof of the survey number.
                        (To see the plain text, we would need to un-index the parameter in the smart contract).
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#AEB877]/20">
                        <p className="text-[#5C6642] font-bold text-xs uppercase">Total Records</p>
                        <p className="text-4xl font-bold text-[#2C3318]">{stats.totalLands} 📄</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#AEB877]/20">
                        <p className="text-[#5C6642] font-bold text-xs uppercase">Block Height</p>
                        <p className="text-4xl font-bold text-[#2C3318]">#{stats.lastBlock} 🧱</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#AEB877]/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FFFBB1]">
                                <tr>
                                    <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Time</th>
                                    <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Survey No. (Topic Hash)</th>
                                    <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Record Hash</th>
                                    <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Block</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#AEB877]/10">
                                {events.map((evt) => (
                                    <tr key={evt.txHash} className="hover:bg-[#F2F5E6]/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C6642] font-mono">{evt.timestamp}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-[#2C3318] font-mono text-xs" title="Indexed String Hash">{evt.surveyNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-blue-600 max-w-[150px] truncate" title={evt.landHash}>{evt.landHash}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-[#2C3318]">#{evt.blockNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {events.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No logs found. Check console or click refresh.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Export Wrapped Component
export const BlockchainLogsPage = () => {
    return (
        <ErrorBoundary>
            <BlockchainLogsContent />
        </ErrorBoundary>
    );
};
