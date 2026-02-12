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
    // No window.confirm - direct action with visual feedback
    try {
      await apiClient.patch(`/auth/users/${farmerId}/status`,
        { status }
      );

      if (status === 'FARMER_VERIFIED') {
        setSuccess('Farmer verified successfully');
        setError('');
      } else {
        setError('Farmer application rejected');
        setSuccess('');
      }

      fetchPendingFarmers();

      // Clear notification after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="gov-h1 mb-1">Farmer Verification</h1>
            <p className="text-[#555555]">Review and approve pending farmer registrations</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-[#0B3D91] border border-[#E0E0E0]">
            Pending: {farmers.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-[#D32F2F] px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-fadeIn border border-red-200">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="bg-[#E6F4EA] text-[#1B5E20] px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-fadeIn border border-[#A5D6A7]">
            <span>✅</span> {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#0B3D91] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#555555]">Loading applications...</p>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E0E0E0] shadow-sm">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-[#222222]">All Caught Up!</h3>
            <p className="text-[#555555]">No pending verifications at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {farmers.map((farmer) => (
              <div key={farmer._id} className="glass-card p-6 border border-[#E0E0E0] hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Farmer Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-[#0B3D91] rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#222222]">{farmer.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 text-sm">
                          <div>
                            <span className="text-[#555555] font-bold text-xs uppercase tracking-wider">Email</span>
                            <p className="text-[#222222]">{farmer.email}</p>
                          </div>
                          <div>
                            <span className="text-[#555555] font-bold text-xs uppercase tracking-wider">Mobile</span>
                            <p className="text-[#222222] font-mono">{farmer.mobile}</p>
                          </div>
                          <div>
                            <span className="text-[#555555] font-bold text-xs uppercase tracking-wider">District</span>
                            <p className="text-[#222222]">{farmer.district}</p>
                          </div>
                          <div>
                            <span className="text-[#555555] font-bold text-xs uppercase tracking-wider">Registered On</span>
                            <p className="text-[#222222]">{new Date(farmer.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-[#E0E0E0] md:pl-6 pt-4 md:pt-0">
                    <h4 className="text-sm font-bold text-[#555555] uppercase tracking-wider mb-3">Submitted Documents</h4>
                    <div className="flex gap-3">
                      {farmer.aadhaarUrl ? (
                        <button
                          onClick={() => setViewingDoc({ url: farmer.aadhaarUrl, type: 'Aadhaar Card' })}
                          className="flex items-center gap-2 px-3 py-2 bg-[#F4F6F9] hover:bg-gray-200 rounded-lg text-sm font-bold text-[#0B3D91] transition-colors border border-[#E0E0E0]"
                        >
                          <span>📄</span> Aadhaar
                        </button>
                      ) : <span className="text-[#D32F2F] text-sm">Missing Aadhaar</span>}

                      {farmer.selfieUrl ? (
                        <button
                          onClick={() => setViewingDoc({ url: farmer.selfieUrl, type: 'Selfie Photo' })}
                          className="flex items-center gap-2 px-3 py-2 bg-[#F4F6F9] hover:bg-gray-200 rounded-lg text-sm font-bold text-[#0B3D91] transition-colors border border-[#E0E0E0]"
                        >
                          <span>📸</span> Selfie
                        </button>
                      ) : <span className="text-[#D32F2F] text-sm">Missing Selfie</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[140px]">
                    <button
                      onClick={() => handleVerification(farmer._id, 'FARMER_VERIFIED')}
                      className="flex-1 px-4 py-2 bg-[#2E8B57] hover:bg-[#236B42] text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(farmer._id, 'FARMER_REJECTED')}
                      className="flex-1 px-4 py-2 bg-white border border-red-200 text-[#D32F2F] hover:bg-red-50 font-bold rounded-xl transition-colors text-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewingDoc(null)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F9FAFB]">
                <h3 className="font-bold text-lg text-[#222222]">{viewingDoc.type} Preview</h3>
                <button onClick={() => setViewingDoc(null)} className="text-[#555555] hover:text-[#222222] text-2xl">×</button>
              </div>
              <div className="flex-1 p-4 bg-[#F4F6F9] overflow-auto flex items-center justify-center">
                {viewingDoc.url.endsWith('.pdf') ? (
                  <iframe src={viewingDoc.url} className="w-full h-full min-h-[500px] rounded" title="doc"></iframe>
                ) : (
                  <img src={viewingDoc.url} alt="Doc" className="max-w-full max-h-[70vh] object-contain rounded shadow-lg" />
                )}
              </div>
              <div className="p-4 bg-white border-t border-[#E0E0E0] flex justify-end gap-3">
                <a href={viewingDoc.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#0B3D91] text-white font-bold rounded-lg hover:bg-[#092C6B]">Download</a>
                <button onClick={() => setViewingDoc(null)} className="px-4 py-2 bg-[#F4F6F9] text-[#555555] font-bold rounded-lg hover:bg-[#E0E0E0]">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
