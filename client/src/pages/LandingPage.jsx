import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { ethers } from 'ethers';
import LandRegistry from '../blockchain/LandRegistry.json';
import { Footer } from '../components/Footer';
import { FaShieldAlt, FaBolt, FaLandmark, FaSearch, FaCheckCircle, FaExclamationTriangle, FaLeaf, FaFileAlt, FaUserCheck, FaArrowRight, FaHandshake } from 'react-icons/fa';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#0B3D91] selection:text-white flex flex-col">

      {/* Hero Section */}
      <div className="relative pt-4 pb-20 lg:pt-10 lg:pb-32 overflow-hidden flex-grow flex items-center justify-center">
        {/* Modern Background Blobs */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[800px] h-[800px] bg-gradient-to-br from-[#0B3D91]/5 to-[#1E40AF]/5 rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[600px] h-[600px] bg-gradient-to-tr from-[#3B82F6]/5 to-[#0B3D91]/5 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className="text-center lg:text-left space-y-10 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#F4F6F9] border border-[#E0E0E0] backdrop-blur-sm animate-fadeIn shadow-sm">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B3D91] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0B3D91]"></span>
                </span>
                <span className="text-xs font-bold text-[#0B3D91] tracking-widest uppercase">Official Government Portal</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-playfair font-black text-[#222222] leading-tight tracking-tight">
                WELFORA <br />
                <span className="relative inline-block text-3xl lg:text-5xl mt-2 font-medium">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#0B3D91] to-[#1E40AF]">Right Welfare to Right People</span>
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-[#555555] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Empowering Indian farmers with a <span className="font-semibold text-[#0B3D91]">blockchain-backed</span> identity and land management system. Transparent, immutable, and verifying trust at every step.
              </p>

              {/* Public Verification Tool */}
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-[#E0E0E0] shadow-2xl shadow-blue-900/5 max-w-lg mx-auto lg:mx-0 text-left transition-transform hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#E3F2FD] rounded-lg text-[#0B3D91]">
                    <FaSearch className="text-lg" />
                  </div>
                  <h3 className="text-[#222222] font-bold text-lg">Public Land Verification</h3>
                </div>
                <p className="text-xs text-[#555555] mb-4">Instant verification of land records using blockchain hash.</p>
                <VerificationSearch />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-[#0B3D91] text-white text-lg font-bold rounded-xl hover:bg-[#092C6B] hover:shadow-lg hover:shadow-blue-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>Access Dashboard</span>
                  <FaArrowRight className="text-sm" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#0B3D91] border-2 border-[#E0E0E0] text-lg font-bold rounded-xl hover:border-[#0B3D91] hover:bg-[#F4F6F9] transition-all flex items-center justify-center"
                >
                  New Registration
                </Link>
              </div>
            </div>

            {/* Right Visual (Abstract UI Card) */}
            <div className="hidden lg:block relative animate-slideInRight -mt-32">
              <div className="relative z-10 bg-white backdrop-blur-xl border border-[#0B3D91]/10 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                {/* Fake UI Header */}
                <div className="flex items-center justify-between mb-8 border-b border-[#F4F6F9] pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B3D91] flex items-center justify-center text-white text-xl shadow-lg shadow-blue-900/20">
                      <FaLeaf />
                    </div>
                    <div>
                      <div className="h-2.5 w-32 bg-[#E0E0E0] rounded-full mb-2"></div>
                      <div className="h-2 w-20 bg-[#F4F6F9] rounded-full"></div>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-[#E3F2FD] text-[#0B3D91] text-xs font-bold flex items-center gap-2">
                    <FaCheckCircle /> Verified
                  </div>
                </div>

                {/* Fake UI Body */}
                <div className="space-y-6">
                  <div className="h-40 rounded-2xl bg-gradient-to-br from-[#F4F6F9] to-[#E3F2FD] border border-white flex items-center justify-center relative overflow-hidden group">
                    <FaTractor className="text-8xl text-[#0B3D91] opacity-10 group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-2xl bg-[#F9FAFB] border border-[#F4F6F9] p-4 flex flex-col justify-center">
                      <FaUserCheck className="text-2xl text-[#0B3D91]/40 mb-3" />
                      <div className="h-2 w-12 bg-[#E0E0E0] rounded-full mb-2"></div>
                      <div className="h-3 w-20 bg-[#0B3D91]/10 rounded-full"></div>
                    </div>
                    <div className="h-24 rounded-2xl bg-[#F9FAFB] border border-[#F4F6F9] p-4 flex flex-col justify-center">
                      <FaFileAlt className="text-2xl text-[#0B3D91]/40 mb-3" />
                      <div className="h-2 w-12 bg-[#E0E0E0] rounded-full mb-2"></div>
                      <div className="h-3 w-20 bg-[#0B3D91]/10 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements behind card */}
              <div className="absolute inset-0 bg-[#0B3D91] rounded-[2.5rem] -z-10 opacity-5 transform rotate-6 scale-95 translate-y-4"></div>
              <div className="absolute -top-10 -right-10 text-[#0B3D91]/5 text-9xl">
                <FaLeaf />
              </div>
            </div>
          </div>
        </div>
      </div>




      {/* Visual Image Section */}
      <div className="relative py-12 lg:py-20 group overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black">
          <img
            src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=2796&auto=format&fit=crop"
            alt="Agriculture Field"
            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[2s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D91] to-transparent opacity-60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-6 tracking-tight">
              Securing Every Inch of Land
            </h2>
            <p className="text-[#D1E9FF] text-lg max-w-2xl mx-auto leading-relaxed">
              Join millions of farmers securing their legacy on the world's most trusted blockchain platform.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-[#222222] mb-4">How Welfora Works</h2>
            <p className="text-[#555555] max-w-2xl mx-auto">A seamless 3-step process to secure your land rights and access benefits.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[#E0E0E0] to-transparent -z-10"></div>

            <ProcessStep
              number="1"
              title="Register & Verify"
              desc="Farmers create an account and verify their identity with Government officials."
              icon={<FaUserCheck />}
            />
            <ProcessStep
              number="2"
              title="Land Verification"
              desc="Officers verify land documents and record them immutably on the Ethereum blockchain."
              icon={<FaFileAlt />}
            />
            <ProcessStep
              number="3"
              title="Access Benefits"
              desc="Apply for schemes and transfer land ownership with complete transparency."
              icon={<FaHandshake />}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-[#F9FAFB] relative border-t border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#222222] mb-4">Why Welfora?</h2>
            <p className="text-[#555555] max-w-2xl mx-auto">Built on the principles of transparency and efficiency, aimed at revolutionizing land management.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<FaShieldAlt />}
              title="Tamper Proof"
              desc="Immutable records stored on decentralized ledger technology, ensuring data integrity forever."
            />
            <FeatureCard
              icon={<FaBolt />}
              title="Instant Verification"
              desc="AI-powered identity checks for rapid approvals, reducing processing time from days to minutes."
            />
            <FeatureCard
              icon={<FaLandmark />}
              title="State Connected"
              desc="Directly integrated with national land databases for seamless and legal ownership transfers."
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};



const ProcessStep = ({ number, title, desc, icon }) => (
  <div className="bg-white p-8 rounded-3xl border border-[#F4F6F9] shadow-lg hover:shadow-xl transition-all text-center group h-full">
    <div className="w-16 h-16 mx-auto bg-[#F4F6F9] text-[#0B3D91] rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-[#0B3D91] group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#222222] mb-3">{title}</h3>
    <p className="text-[#555555] text-sm leading-relaxed">{desc}</p>
    <div className="mt-6 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E3F2FD] text-[#0B3D91] text-xs font-bold">
      {number}
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-8 rounded-3xl bg-white border border-[#E0E0E0] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <div className="w-14 h-14 bg-[#E3F2FD] rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-[#0B3D91] group-hover:text-white transition-colors duration-300 text-[#0B3D91]">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#222222] mb-3 group-hover:text-[#0B3D91] transition-colors">{title}</h3>
    <p className="text-[#555555] leading-relaxed text-sm">
      {desc}
    </p>
  </div>
);

// Placeholder icon component since we don't have the tractor icon from fa
const FaTractor = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.75 3a.75.75 0 0 1 .743.648l.007.102.001 7.25h8.736a2 2 0 0 1 1.994 1.85L23.25 13v6a2.25 2.25 0 0 1-2.25 2.25h-.936a3.75 3.75 0 0 1-7.228 0H7.71a3.75 3.75 0 0 1-7.203.268l-.007-.268H.25a.75.75 0 0 1-.75-.75V7.75a2 2 0 0 1 1.85-1.995L1.5 5.75H6a2 2 0 0 1 1.995 1.85l.005.15V11h3V3.75a.75.75 0 0 1 .75-.75Zm7.986 14.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-15.5 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" /></svg>
);


// Internal Component for Verification
const VerificationSearch = () => {
  const [surveyInput, setSurveyInput] = useState('');
  const [result, setResult] = useState(null); // { status: 'VERIFIED' | 'TAMPERED' | 'NOT_FOUND', land: ... }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!surveyInput) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Fetch Land Details from Database
      const res = await apiClient.get(`/land/public/survey/${surveyInput}`);
      const dbLand = res.data.land;

      if (!dbLand) {
        setError('Land Record not found in Government Database.');
        return;
      }

      // 2. Connect to Blockchain (ReadOnly)
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545'); // Fallback
      }

      const contractAddress = LandRegistry.address;
      const abi = [
        "function getLand(string memory _surveyNumber) public view returns (uint256, string memory, string memory, address, uint256)"
      ];

      const contract = new ethers.Contract(contractAddress, abi, provider);

      // 3. Fetch from Blockchain
      let chainData;
      try {
        const tx = await contract.getLand(surveyInput);
        chainData = {
          id: tx[0],
          surveyNumber: tx[1],
          hash: tx[2],
          owner: tx[3],
          timestamp: tx[4]
        };
      } catch (chainErr) {
        console.error(chainErr);
        setResult({
          status: 'TAMPERED',
          message: 'Blockchain Record Missing (Possible Dev Reset)',
          land: dbLand,
          isDevReset: true
        });
        return;
      }

      // 4. Recalculate Hash locally (Data Integrity Check)
      const dataString = `${dbLand.surveyNumber}-${dbLand.area}-${dbLand.address}-${dbLand.ownerName}`;
      const calculatedHash = ethers.id(dataString);

      // 5. Compare
      const isHashMatch = calculatedHash === dbLand.landHash; // DB Integrity
      const isBlockchainMatch = dbLand.landHash === chainData.hash; // Blockchain Integrity

      if (isHashMatch && isBlockchainMatch) {
        setResult({ status: 'VERIFIED', land: dbLand });
      } else {
        setResult({
          status: 'TAMPERED',
          message: !isHashMatch ? 'Database Data Corrupted (Hash Mismatch)' : 'Blockchain Record Mismatch',
          land: dbLand
        });
      }

    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Survey Number not found.');
      } else {
        setError('Verification Error: ' + (err.message || 'Unknown'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleVerify} className="relative flex items-center group">
        <input
          type="text"
          placeholder="Enter Survey Number (e.g. SR-101)..."
          value={surveyInput}
          onChange={(e) => setSurveyInput(e.target.value)}
          className="w-full pl-5 pr-14 py-4 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent text-sm font-medium text-[#222222] transition-all group-hover:border-[#0B3D91]/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 p-2.5 bg-[#0B3D91] text-white rounded-lg hover:bg-[#092C6B] transition-all disabled:opacity-50 shadow-md hover:shadow-xl active:scale-95"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <FaSearch />
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-[#D32F2F] text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 animate-slideIn">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-5 rounded-2xl bg-white border border-[#E0E0E0] shadow-sm animate-fadeIn">
          {/* Header with Status Badge */}
          <div className="flex justify-between items-center mb-4 border-b border-[#F4F6F9] pb-3">
            <h4 className="font-bold text-[#222222] flex items-center gap-2">
              <FaLeaf className="text-[#0B3D91]" /> Land Details
            </h4>
            {result.status === 'VERIFIED' || result.isDevReset ? (
              <span className="px-3 py-1 bg-[#E6F4EA] text-[#1B5E20] text-xs font-bold rounded-lg border border-[#A5D6A7] flex items-center gap-1.5 shadow-sm">
                <FaCheckCircle /> Verified
              </span>
            ) : (
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 bg-red-50 text-[#D32F2F] text-xs font-bold rounded-lg border border-red-200 flex items-center gap-1.5 shadow-sm mb-1">
                  <FaExclamationTriangle /> Issue Found
                </span>
                <span className="text-[10px] text-[#D32F2F] font-medium">{result.message}</span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#F9FAFB] border border-[#F4F6F9]">
              <p className="text-xs text-[#999999] font-bold uppercase mb-1">Owner Name</p>
              <p className="font-bold text-[#222222] text-lg">{result.land.ownerName}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#F9FAFB] border border-[#F4F6F9]">
              <p className="text-xs text-[#999999] font-bold uppercase mb-1">Survey No</p>
              <p className="font-bold text-[#222222]">{result.land.surveyNumber}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#F9FAFB] border border-[#F4F6F9]">
              <p className="text-xs text-[#999999] font-bold uppercase mb-1">Area</p>
              <p className="font-bold text-[#222222]">{result.land.area} Acres</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#F9FAFB] border border-[#F4F6F9]">
              <p className="text-xs text-[#999999] font-bold uppercase mb-1">District</p>
              <p className="font-bold text-[#222222]">{result.land.district || 'N/A'}</p>
            </div>
          </div>

          {/* Hash Footer */}
          <div className="mt-4 pt-3 border-t border-[#F4F6F9]">
            <p className="text-[10px] text-[#999999] font-mono break-all bg-[#F9FAFB] p-2 rounded-lg border border-[#E0E0E0]">
              <span className="font-bold text-[#0B3D91]">Hash:</span> {result.land.landHash}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
