import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { FaLeaf, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export const ServerAwakeLoader = ({ children }) => {
    const [isServerReady, setIsServerReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const checkServer = async () => {
            try {
                // Determine the correct health endpoint based on API_BASE_URL
                // If base url ends with /api, we just call /health
                // If base url is root, we call /api/health
                // Safest is to just call '/health' relative to the apiClient's base
                await apiClient.get('/health');
                setIsServerReady(true);
            } catch (err) {
                console.log('Waiting for server...', err.message);
                setRetryCount(prev => prev + 1);

                // Retry after 2 seconds
                setTimeout(checkServer, 2000);
            }
        };

        checkServer();
    }, []);

    return (
        <>
            {/* Always render the app behind the loader */}
            {children}

            {/* Loader Overlay - Only visible when server is NOT ready */}
            {!isServerReady && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-all duration-500">
                    {/* 1. Animated Background Mesh (Optional - simplified for overlay) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    </div>

                    {/* 2. Glassmorphism Card */}
                    <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 transform transition-all duration-500 animate-fadeIn">

                        {/* Logo with Ripple Effect */}
                        <div className="relative mb-8 group">
                            <div className="absolute inset-0 bg-[#0B3D91] rounded-2xl animate-ping opacity-10 duration-1000"></div>
                            <div className="relative w-24 h-24 bg-gradient-to-tr from-[#0B3D91] to-[#1e5bb8] rounded-2xl shadow-lg flex items-center justify-center transform transition-transform group-hover:rotate-6">
                                <FaLeaf className="text-4xl text-white drop-shadow-md animate-bounce-slow" />
                            </div>
                            {/* Decorative Ring */}
                            <div className="absolute -inset-2 border-2 border-[#0B3D91]/10 rounded-3xl animate-spin-slow-reverse"></div>
                        </div>

                        {/* Modern Typography */}
                        <div className="flex flex-col mb-8">
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0B3D91] to-[#2563EB] tracking-tighter">
                                WELFORA
                            </h1>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 border-b border-blue-100 pb-1">
                                Government of India
                            </span>
                        </div>

                        {/* Status Section */}
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <span className="text-sm font-bold text-[#0B3D91] animate-pulse">
                                    Waking up Server...
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {retryCount}s
                                </span>
                            </div>

                            {/* Shimmering Progress Bar */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-[#0B3D91] w-[60%] animate-[shimmer_2s_infinite_linear] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]"></div>
                                <div className="h-full bg-[#0B3D91] rounded-full w-full animate-progress-indeterminate origin-left"></div>
                            </div>

                            <p className="text-xs text-slate-500 max-w-[80%] mx-auto leading-relaxed">
                                Securely connecting to Render Cloud. This checks server health and verifies your session.
                            </p>
                        </div>

                        {/* Alert for Long Wait */}
                        {retryCount > 15 && (
                            <div className="mt-6 p-3 bg-amber-50/80 border border-amber-100 rounded-xl text-amber-700 text-xs flex items-center gap-3 animate-fadeIn">
                                <FaExclamationTriangle className="text-lg flex-shrink-0 animate-pulse" />
                                <span className="text-left font-medium">
                                    Starting up from sleep mode. <br />
                                    Thank you for your patience.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-8 text-xs text-white/80 font-medium drop-shadow-md">
                        Protected by Blockchain Technology
                    </div>
                </div>
            )}
        </>
    );
};
