import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'FARMER':
        return <FarmerDashboard />;
      case 'OFFICER':
        return <OfficerDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <div className="text-gray-500">Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFDF5] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 md:flex md:items-end md:justify-between">
          <div>
            <h1 className="gov-h1 mb-2">Dashboard Overview</h1>
            <p className="text-[#5C6642]">Welcome back, {user?.name}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[#A5C89E]/20 text-[#2C3318] border border-[#A5C89E]/30 mt-4 md:mt-0">
            {user?.role} Portal
          </span>
        </div>

        <div className="animate-fadeIn">
          {renderDashboardByRole()}
        </div>
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const isPending = user?.status === 'FARMER_PENDING_VERIFICATION';
  const isVerified = user?.status === 'FARMER_VERIFIED';

  return (
    <div className="space-y-8">
      {/* 1. Status Banner */}
      {isPending && (
        <div className="bg-gradient-to-r from-[#FFFBB1] to-[#FFFBB1]/50 border border-[#D8E983] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8E983]/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-[#D8E983]/30 p-3 rounded-full text-[#4A5532] text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#4A5532]">Action Required</h3>
              <p className="text-[#5C6642] mt-1 text-sm">
                Your account is pending verification. Please upload your documents to access services.
              </p>
            </div>
            <Link
              to="/farmer/verify"
              className="mt-4 sm:mt-0 px-5 py-2.5 bg-[#AEB877] hover:bg-[#8B9850] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#AEB877]/30 transition-all active:scale-95"
            >
              Verify Identity →
            </Link>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="bg-gradient-to-r from-[#A5C89E]/20 to-[#A5C89E]/10 border border-[#A5C89E]/30 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-[#A5C89E]/30 p-3 rounded-full text-[#2C3318] text-xl">✅</div>
          <div>
            <h3 className="text-lg font-bold text-[#2C3318]">Verified Account</h3>
            <p className="text-[#5C6642] text-sm">You have full access to all land records and government schemes.</p>
          </div>
        </div>
      )}

      {/* 2. Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-[#AEB877] relative overflow-hidden group hover:bg-[#FFFBB1]/30 transition-colors">
          <p className="text-sm font-bold text-[#9CA385] uppercase tracking-wider mb-2">District</p>
          <p className="text-2xl font-bold text-[#2C3318]">{user?.district}</p>
          <div className="absolute bottom-4 right-4 text-[#AEB877]/10 text-6xl font-bold -z-10 group-hover:scale-110 transition-transform select-none">📍</div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-[#A5C89E] relative overflow-hidden group hover:bg-[#A5C89E]/10 transition-colors">
          <p className="text-sm font-bold text-[#9CA385] uppercase tracking-wider mb-2">Mobile</p>
          <p className="text-2xl font-bold text-[#2C3318] font-mono tracking-tight">{user?.mobile}</p>
          <div className="absolute bottom-4 right-4 text-[#A5C89E]/10 text-6xl font-bold -z-10 group-hover:scale-110 transition-transform select-none">📱</div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-[#D8E983] relative overflow-hidden group hover:bg-[#D8E983]/10 transition-colors">
          <p className="text-sm font-bold text-[#9CA385] uppercase tracking-wider mb-2">Status</p>
          <div className="mt-1">
            {isPending && <span className="badge badge-pending">Pending</span>}
            {isVerified && <span className="badge badge-verified">Verified</span>}
            {user?.status === 'FARMER_REJECTED' && <span className="badge badge-rejected">Rejected</span>}
          </div>
          <div className="absolute bottom-4 right-4 text-[#D8E983]/20 text-6xl font-bold -z-10 group-hover:scale-110 transition-transform select-none">🛡️</div>
        </div>
      </div>

      {/* 3. Services Grid */}
      <div>
        <h2 className="gov-h2 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Quick Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Land Records */}
          <div className={`glass-card p-0 overflow-hidden flex flex-col h-full group ${!isVerified ? 'opacity-80 grayscale-[0.5]' : 'hover:ring-2 hover:ring-[#AEB877]/30'}`}>
            <div className="relative h-32 bg-gradient-to-r from-[#AEB877] to-[#8B9850] p-6 text-white overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold">Land Records</h3>
                <p className="text-[#FFFBB1] text-sm mt-1">Manage registration & ownership</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-10 -mt-20 blur-2xl"></div>
              <div className="absolute bottom-4 right-6 text-5xl">🏞️</div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between bg-white/60 relative">
              {!isVerified && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
                  <span className="text-4xl shadow-lg rounded-full bg-white p-2 mb-2">🔒</span>
                  <p className="font-bold text-[#5C6642]">Locked</p>
                </div>
              )}
              <p className="text-[#5C6642] text-sm mb-4">
                View digital copies of your land records, check ownership status, and request mutations.
              </p>
              {isVerified && (
                <Link to="/farmer/lands" className="w-full btn-outline justify-between group-hover:bg-[#FFFBB1]/50 group-hover:text-[#2C3318] group-hover:border-[#AEB877]">
                  Access Records <span>→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Schemes */}
          <div className={`glass-card p-0 overflow-hidden flex flex-col h-full group ${!isVerified ? 'opacity-80 grayscale-[0.5]' : 'hover:ring-2 hover:ring-[#A5C89E]/30'}`}>
            <div className="relative h-32 bg-gradient-to-r from-[#A5C89E] to-[#8CAE85] p-6 text-white overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold">Government Schemes</h3>
                <p className="text-[#FFFBB1] text-sm mt-1">Subsidies & financial aid</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-10 -mt-20 blur-2xl"></div>
              <div className="absolute bottom-4 right-6 text-5xl">🌾</div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between bg-white/60 relative">
              {!isVerified && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
                  <span className="text-4xl shadow-lg rounded-full bg-white p-2 mb-2">🔒</span>
                  <p className="font-bold text-[#5C6642]">Locked</p>
                </div>
              )}
              <p className="text-[#5C6642] text-sm mb-4">
                Browse available government schemes, check eligibility, and track application status.
              </p>
              {isVerified && (
                <Link to="/farmer/schemes" className="w-full btn-outline border-[#A5C89E] justify-between group-hover:bg-[#FFFBB1]/50 group-hover:text-[#2C3318] group-hover:border-[#A5C89E]">
                  View Schemes <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OfficerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
          <div>
            <p className="text-sm font-bold text-[#9CA385] uppercase tracking-wider">Assigned District</p>
            <p className="text-3xl font-bold text-[#2C3318] mt-1">{user?.district}</p>
          </div>
          <div className="w-12 h-12 bg-[#AEB877]/20 text-[#4A5532] rounded-xl flex items-center justify-center text-2xl group-hover:bg-[#AEB877] group-hover:text-white transition-colors">
            📍
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
          <div>
            <p className="text-sm font-bold text-[#9CA385] uppercase tracking-wider">Pending Tasks</p>
            <p className="text-3xl font-bold text-[#D8E983] mt-1" style={{ textShadow: '1px 1px 0 #AEB877' }}>--</p>
            <p className="text-xs text-[#5C6642] mt-1">Requires review</p>
          </div>
          <div className="w-12 h-12 bg-[#D8E983]/20 text-[#8B9850] rounded-xl flex items-center justify-center text-2xl group-hover:bg-[#D8E983] group-hover:text-[#4A5532] transition-colors">
            ⏳
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
          <div>
            <p className="text-sm font-bold text-[#9CA385] uppercase tracking-wider">Verified Total</p>
            <p className="text-3xl font-bold text-[#A5C89E] mt-1" style={{ textShadow: '1px 1px 0 #5C6642' }}>--</p>
          </div>
          <div className="w-12 h-12 bg-[#A5C89E]/20 text-[#5C6642] rounded-xl flex items-center justify-center text-2xl group-hover:bg-[#A5C89E] group-hover:text-white transition-colors">
            ✅
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="gov-h2">Action Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/officer/farmers"
            className="group glass-card p-6 border border-transparent hover:border-[#AEB877]/50 transition-all"
          >
            <div className="w-14 h-14 bg-[#FFFBB1] text-[#4A5532] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-[#AEB877] group-hover:text-white transition-colors shadow-sm">
              👨‍🌾
            </div>
            <h3 className="font-bold text-lg text-[#2C3318] group-hover:text-[#AEB877]">Verify Farmers</h3>
            <p className="text-[#5C6642] text-sm mt-2">Review submitted documents and approve registrations.</p>
          </Link>

          <Link
            to="/officer/add-land"
            className="group glass-card p-6 border border-transparent hover:border-[#A5C89E]/50 transition-all"
          >
            <div className="w-14 h-14 bg-[#A5C89E]/20 text-[#2C3318] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-[#A5C89E] group-hover:text-white transition-colors shadow-sm">
              📝
            </div>
            <h3 className="font-bold text-lg text-[#2C3318] group-hover:text-[#A5C89E]">Add Land Record</h3>
            <p className="text-[#5C6642] text-sm mt-2">Create new land ownership entries in the registry.</p>
          </Link>

          <Link
            to="/officer/lands"
            className="group glass-card p-6 border border-transparent hover:border-[#D8E983]/50 transition-all"
          >
            <div className="w-14 h-14 bg-[#D8E983]/20 text-[#4A5532] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-[#D8E983] group-hover:text-[#2C3318] transition-colors shadow-sm">
              📂
            </div>
            <h3 className="font-bold text-lg text-[#2C3318] group-hover:text-[#8B9850]">View Records</h3>
            <p className="text-[#5C6642] text-sm mt-2">Track status of submitted land records (Approved/Pending).</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#AEB877] to-[#8B9850] rounded-2xl p-8 text-white text-center shadow-lg shadow-[#AEB877]/20">
        <span className="text-5xl block mb-4 filter drop-shadow-md">⚙️</span>
        <h2 className="text-3xl font-bold mb-2">Admin Control Panel</h2>
        <p className="text-[#FFFBB1] max-w-xl mx-auto">Manage system-wide settings, user roles, and monitor blockchain network status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/officers" className="btn-outline border-[#AEB877]/30 bg-white hover:bg-[#FFFBB1]/30 h-32 flex-col gap-2 shadow-sm">
          <span className="text-3xl">👨‍💼</span>
          <span className="font-bold text-[#4A5532]">Manage Officers</span>
        </Link>
        <Link to="/admin/farmers" className="btn-outline border-[#AEB877]/30 bg-white hover:bg-[#FFFBB1]/30 h-32 flex-col gap-2 shadow-sm">
          <span className="text-3xl">👨‍🌾</span>
          <span className="font-bold text-[#4A5532]">Manage Farmers</span>
        </Link>
        <Link to="/admin/verify-land" className="btn-outline border-[#AEB877]/30 bg-white hover:bg-[#FFFBB1]/30 h-32 flex-col gap-2 shadow-sm">
          <span className="text-3xl">📝</span>
          <span className="font-bold text-[#4A5532]">Verify Land</span>
        </Link>
        <Link to="/admin/schemes" className="btn-outline border-[#AEB877]/30 bg-white hover:bg-[#FFFBB1]/30 h-32 flex-col gap-2 shadow-sm">
          <span className="text-3xl">💰</span>
          <span className="font-bold text-[#4A5532]">Manage Schemes</span>
        </Link>
        <Link to="/admin/applications" className="btn-outline border-[#AEB877]/30 bg-white hover:bg-[#FFFBB1]/30 h-32 flex-col gap-2 shadow-sm">
          <span className="text-3xl">📊</span>
          <span className="font-bold text-[#4A5532]">Review Applications</span>
        </Link>
        <Link to="/admin/logs" className="btn-outline border-[#AEB877]/30 bg-white hover:bg-[#FFFBB1]/30 h-32 flex-col gap-2 shadow-sm">
          <span className="text-3xl">⛓️</span>
          <span className="font-bold text-[#4A5532]">Blockchain Logs</span>
        </Link>
      </div>
    </div>
  );
};
