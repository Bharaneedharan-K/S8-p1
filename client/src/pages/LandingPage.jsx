import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { ethers } from 'ethers';
import LandRegistry from '../blockchain/LandRegistry.json';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FCFDF5] font-sans selection:bg-[#D8E983] selection:text-[#2C3318]">

      {/* Hero Section */}
      <div className="relative pt-6 pb-20 lg:pt-12 lg:pb-32 overflow-hidden">

        {/* Modern Background Blobs */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[800px] h-[800px] bg-gradient-to-br from-[#D8E983]/20 to-[#AEB877]/20 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[600px] h-[600px] bg-gradient-to-tr from-[#A5C89E]/20 to-[#AEB877]/20 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2E6D5]/50 border border-[#AEB877]/20 backdrop-blur-sm animate-fadeIn">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AEB877] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A5532]"></span>
                </span>
                <span className="text-xs font-bold text-[#4A5532] tracking-wider uppercase">Official Government Portal</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-playfair font-black text-[#2C3318] leading-[1.1] tracking-tight">
                WELFORA <br />
                <span className="relative inline-block text-3xl lg:text-5xl mt-2 font-medium">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#AEB877] to-[#8B9850]">Right Welfare to Right People</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-[#D8E983]/30 -rotate-2 -z-0"></span>
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-[#5C6642] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Empowering Indian farmers with a <span className="font-bold text-[#4A5532]">blockchain-backed</span> identity and land management system. Transparent, immutable, and built for trust.
              </p>

              {/* Public Verification Tool */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl max-w-lg mx-auto lg:mx-0 text-left">
                <h3 className="text-[#2C3318] font-bold mb-3 flex items-center gap-2">
                  <span className="text-xl">🔍</span> Public Verification
                </h3>
                <p className="text-xs text-[#5C6642] mb-3">Verify land authenticity by pasting the blockchain hash.</p>
                <VerificationSearch />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
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

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-[#9CA385]">
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
              <div className="relative z-10 bg-[#EBF0D8] backdrop-blur-xl border-2 border-[#AEB877]/50 p-6 rounded-3xl shadow-2xl shadow-[#2C3318]/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
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
      // Use a public RPC or specific provider. For localhost/amoy, we assume metamask or fallback
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545'); // Fallback
      }

      const contractAddress = LandRegistry.address; // Dynamic address from artifacts
      // Simple ABI for getLand
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
        // Likely not found in contract
        setResult({
          status: 'TAMPERED',
          message: 'Blockchain Record Missing (Possible Dev Reset)',
          land: dbLand,
          isDevReset: true
        });
        return;
      }

      // 4. Recalculate Hash locally (Data Integrity Check)
      // Note: Must match exactly backend hashing logic: surveyNumber-area-address-ownerName
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
      <form onSubmit={handleVerify} className="relative flex items-center">
        <input
          type="text"
          placeholder="Enter Survey Number (e.g. SR-101)..."
          value={surveyInput}
          onChange={(e) => setSurveyInput(e.target.value)}
          className="w-full pl-4 pr-12 py-3 bg-white/80 border border-[#AEB877]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877] text-sm font-mono text-[#2C3318]"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 p-2 bg-[#2C3318] text-white rounded-lg hover:bg-[#4A5532] transition-colors disabled:opacity-50"
        >
          {loading ? '...' : '🔍'}
        </button>
      </form>

      {error && <p className="text-red-600 text-xs mt-2 font-bold bg-red-50 p-2 rounded border border-red-200">❌ {error}</p>}

      {result && (
        <div className="mt-4 p-5 rounded-2xl bg-white/80 border border-[#E2E6D5] shadow-sm animate-fadeIn backdrop-blur-sm">
          {/* Header with Status Badge */}
          <div className="flex justify-between items-center mb-4 border-b border-[#E2E6D5] pb-2">
            <h4 className="font-bold text-[#2C3318] flex items-center gap-2">
              <span>🌾</span> Land Details
            </h4>
            {result.status === 'VERIFIED' ? (
              <span className="px-2 py-1 bg-[#E6F4EA] text-[#2C3318] text-xs font-bold rounded-lg border border-[#A5C89E] flex items-center gap-1">
                <span>✅</span> Verified
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg border border-gray-200 flex items-center gap-1">
                <span>ℹ️</span> Record Found
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-[#9CA385] font-bold uppercase mb-0.5">Owner Name</p>
              <p className="font-bold text-[#2C3318] text-lg">{result.land.ownerName}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-[#9CA385] font-bold uppercase mb-0.5">Survey No</p>
              <p className="font-bold text-[#2C3318]">{result.land.surveyNumber}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-[#9CA385] font-bold uppercase mb-0.5">Area</p>
              <p className="font-bold text-[#2C3318]">{result.land.area} Acres</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-[#9CA385] font-bold uppercase mb-0.5">District</p>
              <p className="font-bold text-[#2C3318]">{result.land.district || 'N/A'}</p>
            </div>
          </div>

          {/* Hash Footer */}
          <div className="mt-4 pt-3 border-t border-[#E2E6D5]">
            <p className="text-[10px] text-[#9CA385] font-mono break-all">
              <span className="font-bold">Hash:</span> {result.land.landHash}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
