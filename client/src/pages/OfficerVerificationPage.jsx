import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const OfficerVerificationPage = () => {
  const { token } = useContext(AuthContext);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchPendingFarmers = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by district for officers
      const res = await apiClient.get('/auth/users?status=FARMER_PENDING_VERIFICATION');
      setFarmers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFarmers();
  }, [token]);

  const handleVerification = async (farmerId, status) => {
    if (!window.confirm(`Are you sure you want to ${status === 'FARMER_VERIFIED' ? 'APPROVE' : 'REJECT'} this application?`)) return;

    try {
      await apiClient.patch(`/auth/users/${farmerId}/status`,
        { status }
      );
      setSuccess(`Farmer application ${status === 'FARMER_VERIFIED' ? 'approved' : 'rejected'} successfully`);
      fetchPendingFarmers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2E6D5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3318]">Farmer Verification</h1>
            <p className="text-[#5C6642] mt-1">Review and approve pending farmer registrations</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-[#4A5532]">
            Pending: {farmers.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-fadeIn border border-red-200">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="bg-[#E6F4EA] text-[#2C3318] px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-fadeIn border border-[#A5C89E]">
            <span>✅</span> {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#AEB877] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#5C6642]">Loading applications...</p>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#AEB877]/20 shadow-sm">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-[#2C3318]">All Caught Up!</h3>
            <p className="text-[#5C6642]">No pending verifications at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {farmers.map((farmer) => (
              <div key={farmer._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#AEB877]/20 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Farmer Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#AEB877]/10 text-[#4A5532] rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#2C3318]">{farmer.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 text-sm">
                          <div>
                            <span className="text-[#9CA385] font-bold text-xs uppercase">Email</span>
                            <p className="text-[#4A5532]">{farmer.email}</p>
                          </div>
                          <div>
                            <span className="text-[#9CA385] font-bold text-xs uppercase">Mobile</span>
                            <p className="text-[#4A5532] font-mono">{farmer.mobile}</p>
                          </div>
                          <div>
                            <span className="text-[#9CA385] font-bold text-xs uppercase">District</span>
                            <p className="text-[#4A5532]">{farmer.district}</p>
                          </div>
                          <div>
                            <span className="text-[#9CA385] font-bold text-xs uppercase">Registered On</span>
                            <p className="text-[#4A5532]">{new Date(farmer.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-[#AEB877]/10 md:pl-6 pt-4 md:pt-0">
                    <h4 className="text-sm font-bold text-[#9CA385] uppercase mb-3">Submitted Documents</h4>
                    <div className="flex gap-3">
                      {farmer.aadhaarUrl ? (
                        <button
                          onClick={() => setViewingDoc({ url: farmer.aadhaarUrl, type: 'Aadhaar Card' })}
                          className="flex items-center gap-2 px-3 py-2 bg-[#F2F5E6] hover:bg-[#AEB877]/20 rounded-lg text-sm font-bold text-[#4A5532] transition-colors border border-[#AEB877]/20"
                        >
                          <span>📄</span> Aadhaar
                        </button>
                      ) : <span className="text-red-500 text-sm">Missing Aadhaar</span>}

                      {farmer.selfieUrl ? (
                        <button
                          onClick={() => setViewingDoc({ url: farmer.selfieUrl, type: 'Selfie Photo' })}
                          className="flex items-center gap-2 px-3 py-2 bg-[#F2F5E6] hover:bg-[#AEB877]/20 rounded-lg text-sm font-bold text-[#4A5532] transition-colors border border-[#AEB877]/20"
                        >
                          <span>📸</span> Selfie
                        </button>
                      ) : <span className="text-red-500 text-sm">Missing Selfie</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[140px]">
                    <button
                      onClick={() => handleVerification(farmer._id, 'FARMER_VERIFIED')}
                      className="flex-1 px-4 py-2 bg-[#AEB877] hover:bg-[#8B9850] text-[#2C3318] font-bold rounded-xl shadow-sm transition-colors text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(farmer._id, 'FARMER_REJECTED')}
                      className="flex-1 px-4 py-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Modal */}
        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3318]/60 backdrop-blur-sm" onClick={() => setViewingDoc(null)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-[#E2E6D5] flex justify-between items-center bg-[#F2F5E6]">
                <h3 className="font-bold text-lg text-[#2C3318]">{viewingDoc.type} Preview</h3>
                <button onClick={() => setViewingDoc(null)} className="text-[#5C6642] hover:text-[#2C3318] text-2xl">×</button>
              </div>
              <div className="flex-1 p-4 bg-[#E2E6D5] overflow-auto flex items-center justify-center">
                {viewingDoc.url.endsWith('.pdf') ? (
                  <iframe src={viewingDoc.url} className="w-full h-full min-h-[500px] rounded" title="doc"></iframe>
                ) : (
                  <img src={viewingDoc.url} alt="Doc" className="max-w-full max-h-[70vh] object-contain rounded shadow-lg" />
                )}
              </div>
              <div className="p-4 bg-white border-t border-[#E2E6D5] flex justify-end gap-3">
                <a href={viewingDoc.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#AEB877] text-white font-bold rounded-lg hover:bg-[#8B9850]">Download</a>
                <button onClick={() => setViewingDoc(null)} className="px-4 py-2 bg-[#F2F5E6] text-[#4A5532] font-bold rounded-lg hover:bg-[#E2E6D5]">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
