import React, { useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';

const DISTRICTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export const ManageFarmersPage = () => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [fetchingFarmers, setFetchingFarmers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewingDocument, setViewingDocument] = useState(null);

  const fetchFarmersFromDB = async () => {
    try {
      setFetchingFarmers(true);
      let url = '/auth/users?role=FARMER';
      if (selectedDistrict) url += `&district=${selectedDistrict}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;

      // apiClient automatically adds Base URL and Auth headers
      const response = await apiClient.get(url);
      const fetchedFarmers = response.data.users || response.data.data || [];
      setFarmers(Array.isArray(fetchedFarmers) ? fetchedFarmers : []);
    } catch (err) {
      setError('Failed to fetch farmers');
      setFarmers([]);
    } finally {
      setFetchingFarmers(false);
    }
  };

  useEffect(() => {
    if (token) fetchFarmersFromDB();
  }, [token, selectedDistrict, selectedStatus]);

  const handleStatusUpdate = async (farmerId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this farmer as ${newStatus}?`)) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await apiClient.patch(`/auth/users/${farmerId}/status`, { status: newStatus });
      setSuccess(`Farmer status updated to ${newStatus}`);
      fetchFarmersFromDB();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FARMER_PENDING_VERIFICATION': return <span className="badge badge-pending">Pending</span>;
      case 'FARMER_VERIFIED': return <span className="badge badge-verified">Verified</span>;
      case 'FARMER_REJECTED': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge bg-gray-100 text-gray-800 border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="gov-container">

        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="gov-h1 mb-1">Manage Farmers</h1>
            <p className="text-[#555555]">Verify identities and manage district registrations.</p>
          </div>
          <button
            onClick={fetchFarmersFromDB}
            className="btn-outline px-4 py-2 text-sm gap-2 mt-4 md:mt-0"
          >
            <span>🔄</span> Refresh List
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xs font-bold text-[#555555] uppercase tracking-wider mb-4">Filter Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="input-modern appearance-none bg-white hover:bg-white"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#555555]">▼</div>
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-modern appearance-none bg-white hover:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="FARMER_PENDING_VERIFICATION">Pending Verification</option>
                <option value="FARMER_VERIFIED">Verified</option>
                <option value="FARMER_REJECTED">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#555555]">▼</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-[#D32F2F] px-4 py-3 rounded-xl mb-6 flex gap-2 items-center animate-fadeIn">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-[#E8F5E9] border border-[#2E8B57] text-[#1B5E20] px-4 py-3 rounded-xl mb-6 flex gap-2 items-center animate-fadeIn">
            <span>✅</span> {success}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block glass-card overflow-hidden">
          <table className="min-w-full divide-y divide-[#E0E0E0]">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#555555] uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#555555] uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#555555] uppercase tracking-wider">Documents</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#555555] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[#555555] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E0E0E0]">
              {fetchingFarmers ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-[#555555]">Loading records...</td></tr>
              ) : farmers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-[#555555]">No farmers found.</td></tr>
              ) : (
                farmers.map((farmer) => (
                  <tr key={farmer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B3D91] font-bold shrink-0">
                          {farmer.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#222222]">{farmer.name}</div>
                          <div className="text-sm text-[#555555]">{farmer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#222222]">{farmer.district}</div>
                      <div className="text-xs text-[#555555] font-mono">{farmer.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {farmer.aadhaarUrl ? (
                          <button onClick={() => setViewingDocument({ url: farmer.aadhaarUrl, type: 'Aadhaar' })} className="px-2 py-1 text-xs bg-gray-100 text-[#555555] rounded border border-gray-300 hover:bg-gray-200 font-medium">Aadhaar</button>
                        ) : <span className="text-xs text-[#999999]">Missing</span>}
                        {farmer.selfieUrl ? (
                          <button onClick={() => setViewingDocument({ url: farmer.selfieUrl, type: 'Selfie' })} className="px-2 py-1 text-xs bg-gray-100 text-[#555555] rounded border border-gray-300 hover:bg-gray-200 font-medium">Photo</button>
                        ) : <span className="text-xs text-[#999999]">Missing</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(farmer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {farmer.status === 'FARMER_PENDING_VERIFICATION' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(farmer._id, 'FARMER_VERIFIED')}
                            className="bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#C8E6C9] p-2 rounded-lg transition-colors"
                            title="Verify"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(farmer._id, 'FARMER_REJECTED')}
                            className="bg-red-50 text-[#D32F2F] hover:bg-red-100 p-2 rounded-lg transition-colors"
                            title="Reject"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#999999] text-xs italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {fetchingFarmers ? (
            <p className="text-center text-[#555555] py-8">Loading records...</p>
          ) : farmers.length === 0 ? (
            <p className="text-center text-[#555555] py-8">No farmers found.</p>
          ) : (
            farmers.map((farmer) => (
              <div key={farmer._id} className="glass-card p-5 animate-fadeIn">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B3D91] font-bold">
                      {farmer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#222222]">{farmer.name}</h4>
                      <p className="text-xs text-[#555555]">{farmer.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(farmer.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#E0E0E0] mb-4">
                  <div>
                    <p className="text-xs font-bold text-[#555555] uppercase">District</p>
                    <p className="text-sm font-bold text-[#222222]">{farmer.district}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#555555] uppercase">Mobile</p>
                    <p className="text-sm font-bold text-[#222222] font-mono">{farmer.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {farmer.aadhaarUrl && (
                      <button onClick={() => setViewingDocument({ url: farmer.aadhaarUrl, type: 'Aadhaar' })} className="text-xs text-[#222222] bg-gray-100 px-2 py-1 rounded font-medium border border-gray-300">View ID</button>
                    )}
                    {farmer.selfieUrl && (
                      <button onClick={() => setViewingDocument({ url: farmer.selfieUrl, type: 'Selfie' })} className="text-xs text-[#222222] bg-gray-100 px-2 py-1 rounded font-medium border border-gray-300">View Photo</button>
                    )}
                  </div>

                  {farmer.status === 'FARMER_PENDING_VERIFICATION' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(farmer._id, 'FARMER_REJECTED')}
                        className="px-3 py-1.5 bg-red-100 text-[#D32F2F] rounded-lg text-sm font-medium"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(farmer._id, 'FARMER_VERIFIED')}
                        className="px-3 py-1.5 bg-[#2E8B57] text-white rounded-lg text-sm font-medium hover:bg-[#236B42]"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setViewingDocument(null)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-bold text-[#222222]" id="modal-title">
                      {viewingDocument.type} Preview
                    </h3>
                    <button onClick={() => setViewingDocument(null)} className="text-[#999999] hover:text-[#555555] text-2xl">×</button>
                  </div>
                  <div className="bg-[#F4F6F9] rounded-xl border border-[#E0E0E0] p-4 flex justify-center items-center min-h-[300px]">
                    {viewingDocument.url.endsWith('.pdf') ? (
                      <iframe
                        src={`https://docs.google.com/gview?url=${viewingDocument.url}&embedded=true`}
                        className="w-full h-96 rounded-lg"
                        title="doc"
                      ></iframe>
                    ) : (
                      <img src={viewingDocument.url} className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm" alt="doc" />
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <a href={viewingDocument.url} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-[#0B3D91] text-base font-bold text-white hover:bg-[#092C6B] focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    Download Original
                  </a>
                  <button type="button" onClick={() => setViewingDocument(null)} className="mt-3 w-full inline-flex justify-center rounded-xl border border-[#E0E0E0] shadow-sm px-4 py-2 bg-white text-base font-medium text-[#555555] hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
