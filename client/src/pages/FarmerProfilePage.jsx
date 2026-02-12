import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCalendarAlt,
    FaCheckCircle, FaLeaf, FaClipboardList, FaAddressCard, FaTractor,
    FaPlus, FaList, FaHandHoldingUsd, FaArrowRight, FaEdit
} from 'react-icons/fa';

export const FarmerProfilePage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/auth/profile/stats');
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
        <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0B3D91]">
                            Welcome back, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-[#555555] mt-1 text-sm font-medium">
                            Here is what's happening with your farm today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-[#555555] shadow-sm border border-[#E0E0E0] flex items-center gap-2">
                            <FaCalendarAlt className="text-[#0B3D91]" />
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Profile & Quick Actions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300">
                            <div className="h-32 bg-gradient-to-br from-[#0B3D91] to-[#1E40AF]"></div>
                            <div className="px-6 pb-6 relative">
                                <div className="absolute -top-16 left-6">
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                        <div className="w-full h-full bg-[#E3F2FD] rounded-xl flex items-center justify-center text-4xl font-bold text-[#0B3D91]">
                                            {user.name.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#222222]">{user.name}</h2>
                                            <p className="text-xs text-[#555555] font-bold uppercase tracking-wider mt-1">{user.role}</p>
                                        </div>
                                        {user.status === 'FARMER_VERIFIED' ? (
                                            <span className="bg-[#E6F4EA] text-[#1B5E20] text-[10px] font-bold px-2 py-1 rounded-full border border-[#A5D6A7] flex items-center gap-1">
                                                <FaCheckCircle /> Verified
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-200 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div> Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-[#555555] p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
                                            <FaEnvelope className="text-[#0B3D91] w-4" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[#555555] p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
                                            <FaPhone className="text-[#0B3D91] w-4" />
                                            <span>+91 {user.mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[#555555] p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
                                            <FaMapMarkerAlt className="text-[#0B3D91] w-4" />
                                            <span>{user.district || 'District N/A'}, India</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[#F4F6F9]">
                                        <p className="text-[10px] text-[#999999] text-center font-medium">
                                            Member since {new Date(user.createdAt).getFullYear()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-[#E3F2FD]/50 rounded-2xl p-6 border border-[#BBDEFB] text-center">
                            <h3 className="text-[#0B3D91] font-bold text-sm mb-2">Need Help?</h3>
                            <p className="text-xs text-[#555555] mb-4">Contact your assigned officer or district admin for support.</p>
                            <button className="text-xs font-bold text-white bg-[#0B3D91] px-4 py-2 rounded-lg hover:bg-[#092C6B] transition-colors w-full">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Stats & Actions */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats Widgets */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatWidget
                                label="Total Lands"
                                value={loading ? '...' : stats?.totalLands || 0}
                                icon={<FaLeaf />}
                                color="text-green-600"
                                bg="bg-green-50"
                                border="border-green-100"
                            />
                            <StatWidget
                                label="Total Area"
                                value={loading ? '...' : `${stats?.totalArea || 0} Ac`}
                                icon={<FaTractor />}
                                color="text-blue-600"
                                bg="bg-blue-50"
                                border="border-blue-100"
                            />
                            <StatWidget
                                label="Verified"
                                value={loading ? '...' : stats?.approvedLands || 0}
                                icon={<FaCheckCircle />}
                                color="text-teal-600"
                                bg="bg-teal-50"
                                border="border-teal-100"
                            />
                            <StatWidget
                                label="Schemes"
                                value={loading ? '...' : stats?.totalApplications || 0}
                                icon={<FaClipboardList />}
                                color="text-purple-600"
                                bg="bg-purple-50"
                                border="border-purple-100"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-xl font-bold text-[#222222] mb-4 flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-[#F4F6F9] text-[#0B3D91]"><FaList className="text-sm" /></span>
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <QuickActionCard
                                    to="/farmer/add-land"
                                    title="Add New Land"
                                    desc="Register a new land parcel for verification."
                                    icon={<FaPlus />}
                                    color="bg-[#0B3D91] text-white"
                                    hover="hover:bg-[#092C6B]"
                                />
                                <QuickActionCard
                                    to="/farmer/lands"
                                    title="View My Lands"
                                    desc="Check status of your registered lands."
                                    icon={<FaLeaf />}
                                    color="bg-white text-[#0B3D91] border border-[#E0E0E0]"
                                    hover="hover:bg-[#F9FAFB] hover:border-[#0B3D91]"
                                />
                                <QuickActionCard
                                    to="/farmer/schemes"
                                    title="Browse Schemes"
                                    desc="Apply for government subsidies and benefits."
                                    icon={<FaHandHoldingUsd />}
                                    color="bg-white text-[#0B3D91] border border-[#E0E0E0]"
                                    hover="hover:bg-[#F9FAFB] hover:border-[#0B3D91]"
                                />
                                <QuickActionCard
                                    to="/farmer/applications"
                                    title="My Applications"
                                    desc="Track the status of your scheme applications."
                                    icon={<FaClipboardList />}
                                    color="bg-white text-[#0B3D91] border border-[#E0E0E0]"
                                    hover="hover:bg-[#F9FAFB] hover:border-[#0B3D91]"
                                />
                            </div>
                        </div>

                        {/* Recent Activity Placeholder (Future Feature) */}
                        <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-[#222222] text-sm uppercase tracking-wide">Recent Activity</h3>
                                <button className="text-xs font-bold text-[#0B3D91] hover:underline">View All</button>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-sm text-[#555555] italic">Loading activity...</p>
                                ) : stats?.totalLands > 0 ? (
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#F9FAFB] border border-[#F4F6F9]">
                                        <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#1B5E20]">
                                            <FaCheckCircle />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#222222]">System Status</p>
                                            <p className="text-xs text-[#555555]">Your account is active and operating normally.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-[#555555] text-sm">
                                        No recent activity. Start by adding a land record!
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const StatWidget = ({ label, value, icon, color, bg, border }) => (
    <div className={`p-5 rounded-2xl bg-white border ${border} shadow-sm flex flex-col items-center justify-center gap-2 group hover:-translate-y-1 transition-transform duration-300`}>
        <div className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <p className="text-2xl font-black text-[#222222] tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-[#999999] uppercase tracking-wider">{label}</p>
    </div>
);

const QuickActionCard = ({ to, title, desc, icon, color, hover }) => (
    <Link
        to={to}
        className={`p-6 rounded-2xl shadow-sm flex items-start justify-between gap-4 transition-all duration-300 group ${color} ${hover}`}
    >
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="font-bold text-lg leading-none">{title}</h3>
            </div>
            <p className={`text-xs opacity-80 leading-relaxed ${title === 'Add New Land' ? 'text-blue-100' : 'text-[#555555]'}`}>
                {desc}
            </p>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:translate-x-1 ${title === 'Add New Land' ? 'bg-white/20' : 'bg-[#F4F6F9]'}`}>
            <FaArrowRight />
        </div>
    </Link>
);
