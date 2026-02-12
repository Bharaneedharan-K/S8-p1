import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FaTractor, FaUserShield, FaBuildingColumns, FaMapLocationDot,
  FaRightLeft, FaCircleCheck, FaHandHoldingDollar, FaClipboardList,
  FaFileSignature, FaUsers, FaUserTie, FaPhone, FaCircleInfo,
  FaClock, FaLayerGroup, FaGears, FaCalendarDays, FaLock
} from 'react-icons/fa6';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Unified Header */}
        <div className="mb-10 bg-[#0B3D91] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-[#0B3D91]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4B8BF5] rounded-full -mr-16 -mt-32 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF9933] rounded-full -ml-10 -mb-20 opacity-20 blur-2xl"></div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl text-white shadow-inner border border-white/20">
              {user?.role === 'FARMER' ? <FaTractor /> : user?.role === 'OFFICER' ? <FaUserShield /> : <FaBuildingColumns />}
            </div>
            <div>
              <p className="text-[#90CAF9] text-sm font-bold uppercase tracking-widest mb-1">{user?.role} Portal</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Welcome back, {user?.name.split(' ')[0]}
              </h1>
              <p className="text-blue-100 mt-1 text-sm md:text-base max-w-lg">
                Access your dashboard to manage records, verify documents, and track status.
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-6 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex flex-col items-center">
            <p className="text-[#90CAF9] text-xs font-bold uppercase flex items-center gap-2"><FaCalendarDays /> Date</p>
            <p className="text-white font-bold text-lg">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="animate-fadeIn">
          {user?.role === 'FARMER' && <FarmerDashboard user={user} />}
          {user?.role === 'OFFICER' && <OfficerDashboard user={user} />}
          {user?.role === 'ADMIN' && <AdminDashboard />}
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E0E0E0] flex items-center justify-between hover:shadow-md transition-shadow group">
    <div>
      <p className="text-sm font-bold text-[#555555] uppercase tracking-wider">{title}</p>
      <p className={`text-3xl font-bold mt-1 text-[${color}] group-hover:scale-105 transition-transform origin-left`}>{value}</p>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gray-50 text-[${color}]`}>
      {icon}
    </div>
  </div>
);

const ActionCard = ({ to, title, description, icon, color = "bg-[#0B3D91]", locked = false }) => {
  if (locked) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm relative overflow-hidden group">
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-not-allowed transition-all">
          <div className="w-16 h-16 bg-[#E0E0E0] rounded-full flex items-center justify-center shadow-inner mb-2">
            <FaLock className="text-3xl text-[#757575]" />
          </div>
          <span className="text-xs font-bold text-[#555555] uppercase tracking-wider bg-white/80 px-3 py-1 rounded-full shadow-sm">
            Verification Pending
          </span>
        </div>

        {/* Dimmed Content */}
        <div className="opacity-40 pointer-events-none flex flex-col h-full grayscale">
          <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-md`}>
            {icon}
          </div>
          <h3 className="font-bold text-xl text-[#222222] mb-2">{title}</h3>
          <p className="text-[#555555] text-sm leading-relaxed flex-1">{description}</p>
          <div className="mt-4 flex items-center text-[#0B3D91] text-sm font-bold">
            Access <span>→</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={to} className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col h-full">
      <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-md`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl text-[#222222] mb-2 group-hover:text-[#0B3D91] transition-colors">{title}</h3>
      <p className="text-[#555555] text-sm leading-relaxed flex-1">{description}</p>
      <div className="mt-4 flex items-center text-[#0B3D91] text-sm font-bold group-hover:gap-2 transition-all">
        Access <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </div>
    </Link>
  );
};

// --- Sub-Dashboards ---

const FarmerDashboard = ({ user }) => {
  const isVerified = user?.status === 'FARMER_VERIFIED';
  const isPending = !isVerified;

  return (
    <div className="space-y-8">
      {/* Status Banner */}
      {!isVerified && (
        <div className="bg-gradient-to-r from-[#FFF3E0] to-[#FFF3E0]/40 border border-[#FFCC80] rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-pulse-slow">
          <div className="bg-[#FF9933] p-3 rounded-full text-white"><FaClock /></div>
          <div>
            <h3 className="text-lg font-bold text-[#E65100]">Verification Pending</h3>
            <p className="text-[#555555] text-sm">Your profile is under review by the designated officer. Features are limited until approval.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Status" value={isVerified ? 'Verified' : 'Pending'} icon={isVerified ? <FaCircleCheck /> : <FaClock />} color={isVerified ? '#2E8B57' : '#FF9933'} />
        <StatCard title="District" value={user?.district} icon={<FaMapLocationDot />} color="#0B3D91" />
        <StatCard title="Lands" value="--" icon={<FaLayerGroup />} color="#222222" />
        <StatCard title="Applications" value="--" icon={<FaFileSignature />} color="#555555" />
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold text-[#222222] mb-6 flex items-center gap-2">
          <span className="w-8 h-1 bg-[#0B3D91] rounded-full"></span> Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            to="/farmer/lands"
            title="My Land Records"
            description="View ownership details, history, and status of your registered lands."
            icon={<FaMapLocationDot />}
            color="bg-[#0B3D91]"
            locked={isPending}
          />
          <ActionCard
            to="/farmer/schemes"
            title="Government Schemes"
            description="Apply for subsidies and financial aid programs tailored for you."
            icon={<FaHandHoldingDollar />}
            color="bg-[#2E8B57]"
            locked={isPending}
          />
          <ActionCard
            to="/transfer-requests"
            title="Land Transfers"
            description="Manage incoming and outgoing land transfer requests."
            icon={<FaRightLeft />}
            color="bg-[#FF9933]"
            locked={isPending}
          />
          <ActionCard
            to="/farmer/profile"
            title="My Profile"
            description="Update personal details and view account account settings."
            icon={<FaUserTie />}
            color="bg-[#555555]"
            locked={false}
          />
        </div>
      </div>
    </div>
  );
};

const OfficerDashboard = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Assigned District" value={user?.district} icon={<FaMapLocationDot />} color="#0B3D91" />
        <StatCard title="Pending Review" value="--" icon={<FaClock />} color="#FF9933" />
        <StatCard title="Verified Today" value="--" icon={<FaCircleCheck />} color="#2E8B57" />
        <StatCard title="Transfer Requests" value="--" icon={<FaRightLeft />} color="#555555" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#222222] mb-6 flex items-center gap-2">
          <span className="w-8 h-1 bg-[#0B3D91] rounded-full"></span> Officer Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            to="/officer/farmers"
            title="Verify Farmers"
            description="Review and approve farmer identity documents."
            icon={<FaUserTie />}
            color="bg-[#0B3D91]"
          />
          <ActionCard
            to="/officer/add-land"
            title="Register New Land"
            description="Create new land records in the registry."
            icon={<FaFileSignature />}
            color="bg-[#2E8B57]"
          />
          <ActionCard
            to="/officer/lands"
            title="View Records"
            description="Search and view all land records in your district."
            icon={<FaLayerGroup />}
            color="bg-[#FF9933]"
          />
          <ActionCard
            to="/transfer-requests"
            title="Approve Transfers"
            description="Verify land transfer requests after buyer acceptance."
            icon={<FaRightLeft />}
            color="bg-[#555555]"
          />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Farmers" value="--" icon={<FaUsers />} color="#0B3D91" />
        <StatCard title="Total Officers" value="--" icon={<FaUserShield />} color="#2E8B57" />
        <StatCard title="Lands Minted" value="--" icon={<FaLayerGroup />} color="#FF9933" />
        <StatCard title="Pending Actions" value="--" icon={<FaClock />} color="#D32F2F" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#222222] mb-6 flex items-center gap-2">
          <span className="w-8 h-1 bg-[#0B3D91] rounded-full"></span> Administration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            to="/admin/verify-land"
            title="Verify Land (Mint)"
            description="Final approval to mint seeded lands to Blockchain."
            icon={<FaFileSignature />}
            color="bg-[#0B3D91]"
          />
          <ActionCard
            to="/transfer-requests"
            title="Approve Transfers"
            description="Execute land ownership transfers via Blockchain."
            icon={<FaRightLeft />}
            color="bg-[#FF9933]"
          />
          <ActionCard
            to="/admin/officers"
            title="Manage Officers"
            description="Add or remove officers and assign districts."
            icon={<FaUserShield />}
            color="bg-[#2E8B57]"
          />
          <ActionCard
            to="/admin/farmers"
            title="Manage Farmers"
            description="Oversee registered farmers and their status."
            icon={<FaUsers />}
            color="bg-[#555555]"
          />
          <ActionCard
            to="/admin/schemes"
            title="Manage Schemes"
            description="Create and update government welfare schemes."
            icon={<FaHandHoldingDollar />}
            color="bg-[#0B3D91]"
          />
          <ActionCard
            to="/admin/logs"
            title="Audit Logs"
            description="View system-wide activity and blockchain events."
            icon={<FaClipboardList />}
            color="bg-[#90A4AE]"
          />
        </div>
      </div>
    </div>
  );
};
