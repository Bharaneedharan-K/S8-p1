import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const FarmerProfilePage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/auth/profile/stats');
                setStats(res.data.stats);
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3318]">My Profile</h1>
                        <p className="text-[#5C6642]">Manage your personal information</p>
                    </div>
                    <Link to="/farmer/verify" className="px-5 py-2 bg-[#2C3318] text-white rounded-xl shadow hover:bg-[#4A5532]">
                        {user.status === 'FARMER_VERIFIED' ? 'View ID Card' : 'Verify Identity →'}
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#AEB877]/20 relative overflow-hidden mb-8">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#2C3318] to-[#4A5532] opacity-10"></div>

                    <div className="relative flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 bg-[#AEB877] rounded-full flex items-center justify-center text-5xl text-white shadow-xl border-4 border-white">
                                {user.name.charAt(0)}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#2C3318]">{user.name}</h2>
                                    <p className="text-[#5C6642] font-medium">{user.district}, India</p>
                                </div>
                                <span className={`mt-2 md:mt-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.status === 'FARMER_VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {user.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-[#5C6642] uppercase font-bold">Email Address</p>
                                    <p className="text-[#2C3318] font-medium">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-[#5C6642] uppercase font-bold">Mobile Number</p>
                                    <p className="text-[#2C3318] font-medium">+91 {user.mobile}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-[#5C6642] uppercase font-bold">Member Since</p>
                                    <p className="text-[#2C3318] font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-[#5C6642] uppercase font-bold">Account Type</p>
                                    <p className="text-[#2C3318] font-medium">Verified Farmer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <h3 className="text-xl font-bold text-[#2C3318] mb-4">My Farm Statistics</h3>
                {loading ? (
                    <div className="animate-pulse h-32 bg-gray-200 rounded-xl"></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Lands" value={stats?.totalLands || 0} icon="🌾" />
                        <StatCard label="Total Area" value={`${stats?.totalArea || 0} Ac`} icon="📐" />
                        <StatCard label="Verified" value={stats?.approvedLands || 0} icon="✅" />
                        <StatCard label="Schemes Applied" value={stats?.totalApplications || 0} icon="📋" />
                    </div>
                )}

            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div className="bg-white p-5 rounded-2xl border border-[#AEB877]/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-2xl mb-2">{icon}</div>
        <p className="text-3xl font-bold text-[#2C3318]">{value}</p>
        <p className="text-xs text-[#5C6642] font-bold uppercase mt-1">{label}</p>
    </div>
);
