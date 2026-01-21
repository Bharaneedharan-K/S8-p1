import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FCFDF5] font-sans selection:bg-[#D8E983] selection:text-[#2C3318]">

      {/* Navbar Placeholder (Visual continuity if needed, otherwise Navbar component handles it) */}

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">

        {/* Modern Background Blobs */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[800px] h-[800px] bg-gradient-to-br from-[#D8E983]/20 to-[#AEB877]/20 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[600px] h-[600px] bg-gradient-to-tr from-[#A5C89E]/20 to-[#AEB877]/20 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2E6D5]/50 border border-[#AEB877]/20 backdrop-blur-sm mb-8 animate-fadeIn">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AEB877] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A5532]"></span>
                </span>
                <span className="text-xs font-bold text-[#4A5532] tracking-wider uppercase">Official Government Portal</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-playfair font-black text-[#2C3318] leading-[1.1] mb-6 tracking-tight">
                Land Records, <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#AEB877] to-[#8B9850]">Secured.</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-[#D8E983]/30 -rotate-2 -z-0"></span>
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-[#5C6642] mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Empowering Indian farmers with a <span className="font-bold text-[#4A5532]">blockchain-backed</span> identity and land management system. Transparent, immutable, and built for trust.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-[#2C3318] text-[#D8E983] text-lg font-bold rounded-xl hover:shadow-lg hover:shadow-[#2C3318]/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>Access Dashboard</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#4A5532] border-2 border-[#E2E6D5] text-lg font-bold rounded-xl hover:border-[#AEB877] hover:bg-[#F2F5E6] transition-all flex items-center justify-center"
                >
                  New Registration
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-[#9CA385]">
                <div className="flex items-center gap-2">
                  <span className="text-[#AEB877]">✓</span> Government of India
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#AEB877]">✓</span> 256-bit Encryption
                </div>
              </div>
            </div>

            {/* Right Visual (Abstract UI Card) */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
              <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-2xl shadow-[#AEB877]/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Fake UI Header */}
                <div className="flex items-center justify-between mb-6 border-b border-[#AEB877]/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#AEB877] flex items-center justify-center text-white text-lg">🌾</div>
                    <div>
                      <div className="h-2 w-24 bg-[#2C3318]/10 rounded mb-1"></div>
                      <div className="h-2 w-16 bg-[#2C3318]/5 rounded"></div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#D8E983]/20 text-[#4A5532] text-xs font-bold">Verified</div>
                </div>
                {/* Fake UI Body */}
                <div className="space-y-4">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-[#F2F5E6] to-[#E2E6D5] border border-white flex items-center justify-center relative overflow-hidden group">
                    <div className="text-6xl opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">🚜</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-xl bg-white/60 border border-white p-3">
                      <div className="h-2 w-8 bg-[#AEB877]/20 rounded mb-2"></div>
                      <div className="h-4 w-12 bg-[#2C3318]/10 rounded"></div>
                    </div>
                    <div className="h-16 rounded-xl bg-white/60 border border-white p-3">
                      <div className="h-2 w-8 bg-[#AEB877]/20 rounded mb-2"></div>
                      <div className="h-4 w-12 bg-[#2C3318]/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements behind card */}
              <div className="absolute top-10 -right-10 w-full h-full bg-[#2C3318] rounded-3xl -z-10 opacity-5 transform rotate-6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔒"
              title="Tamper Proof"
              desc="Immutable records stored on decentralized ledger technology."
              color="bg-[#E6F4EA]"
            />
            <FeatureCard
              icon="⚡"
              title="Instant Verification"
              desc="AI-powered identity checks for rapid approvals."
              color="bg-[#FFFBB1]"
            />
            <FeatureCard
              icon="🏛️"
              title="State Connected"
              desc="Directly integrated with national land databases."
              color="bg-[#F2F5E6]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group p-8 rounded-3xl bg-white border border-[#E2E6D5] hover:border-[#AEB877] shadow-sm hover:shadow-xl transition-all duration-300">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#2C3318] mb-3 group-hover:text-[#AEB877] transition-colors">{title}</h3>
    <p className="text-[#5C6642] leading-relaxed">
      {desc}
    </p>
  </div>
);
