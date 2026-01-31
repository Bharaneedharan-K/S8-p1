import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { TN_DISTRICTS } from '../utils/constants';

export const ManageOfficersPage = () => {
  const { token } = useContext(AuthContext);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* New State for Features */
  const [filterDistrict, setFilterDistrict] = useState('');
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', mobile: '', district: '', status: '' });

  // Create Officer Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    district: '',
    mobile: ''
  });

  const DISTRICTS = TN_DISTRICTS;

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      // apiClient handles baseURL and headers automatically
      const res = await apiClient.get('/auth/users?role=OFFICER');
      setOfficers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch officers list');
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* Validation Helpers */
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict Validation
    if (!validateMobile(formData.mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await apiClient.post('/auth/create-officer', formData);
      const msg = 'Officer account created successfully!';
      setSuccess(msg);
      // Removed window.alert as requested
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', district: '', mobile: '' });
      fetchOfficers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create officer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (officer) => {
    setEditingOfficer(officer);
    setEditForm({
      name: officer.name,
      mobile: officer.mobile,
      district: officer.district,
      status: officer.status
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateMobile(editForm.mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await apiClient.put(`/auth/users/${editingOfficer._id}`, editForm);
      setSuccess('Officer details updated successfully!');
      setEditingOfficer(null);
      fetchOfficers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update officer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleStatus = async (officer) => {
    const newStatus = officer.status === 'OFFICER_ACTIVE' ? 'OFFICER_INACTIVE' : 'OFFICER_ACTIVE';
    try {
      await apiClient.patch(`/auth/users/${officer._id}/status`, { status: newStatus });
      setSuccess(`Officer marked as ${newStatus === 'OFFICER_ACTIVE' ? 'Active' : 'Inactive'}`);
      fetchOfficers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter Logic
  const filteredOfficers = officers.filter(officer => {
    if (filterDistrict && officer.district !== filterDistrict) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#E2E6D5] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Toast Notifications (Fixed Side Position) */}
      <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {error && (
          <div className="pointer-events-auto bg-white border-l-4 border-red-500 shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <h4 className="font-bold text-red-600">Error</h4>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="pointer-events-auto bg-white border-l-4 border-[#AEB877] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="font-bold text-[#4A5532]">Success</h4>
              <p className="text-[#5C6642] text-sm">{success}</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3318]">Manage Officers</h1>
            <p className="text-[#5C6642] mt-1">Create and monitor land verification officers.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-[#AEB877] hover:bg-[#8B9850] text-[#2C3318] font-bold rounded-xl shadow-lg shadow-[#AEB877]/20 transition-all flex items-center gap-2"
          >
            <span>{showForm ? '✕ Cancel' : '+ Add New Officer'}</span>
          </button>
        </div>

        {/* Create Officer Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-[#AEB877]/30 mb-8 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#2C3318] mb-6">Create New Officer Account</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#5C6642] mb-1">Full Name</label>
                <input type="text" name="name" required className="input-modern" onChange={handleChange} value={formData.name} placeholder="Officer Name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5C6642] mb-1">Email Address</label>
                <input type="email" name="email" required className="input-modern" onChange={handleChange} value={formData.email} placeholder="officer@gov.in" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5C6642] mb-1">District to Assign</label>
                <div className="relative">
                  <select name="district" required className="input-modern appearance-none bg-white" onChange={handleChange} value={formData.district}>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#5C6642]">▼</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5C6642] mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  required
                  className="input-modern"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setFormData({ ...formData, mobile: val });
                  }}
                  value={formData.mobile}
                  placeholder="10-digit number"
                />
                <p className="text-xs text-[#9CA385] mt-1 text-right">{formData.mobile.length}/10</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#5C6642] mb-1">Password</label>
                <input type="password" name="password" required className="input-modern" onChange={handleChange} value={formData.password} placeholder="Set secure password" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="px-8 py-3 bg-[#2C3318] hover:bg-[#4A5532] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-[#AEB877]/20">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#2C3318]">Filter by District:</span>
            <select
              className="px-4 py-2 bg-[#F2F5E6] border border-[#AEB877]/30 rounded-lg text-sm text-[#5C6642] focus:outline-none focus:border-[#AEB877]"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="text-sm text-[#9CA385]">
            Showing <span className="font-bold text-[#2C3318]">{filteredOfficers.length}</span> officers
          </div>
        </div>

        {/* Edit Modal Overlay */}
        {editingOfficer && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fadeIn">
              <h3 className="text-2xl font-bold text-[#2C3318] mb-6">Edit Officer Details</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#5C6642] mb-1">Full Name</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5C6642] mb-1">Mobile</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={editForm.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setEditForm({ ...editForm, mobile: val })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5C6642] mb-1">District</label>
                  <select
                    className="input-modern appearance-none bg-white"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingOfficer(null)}
                    className="flex-1 py-3 border border-[#AEB877] text-[#5C6642] font-bold rounded-xl hover:bg-[#F2F5E6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Officers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 text-center text-[#5C6642] py-8">Loading officer data...</p>
          ) : filteredOfficers.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white/50 rounded-2xl border border-dashed border-[#AEB877]/30">
              <p className="text-[#5C6642] font-bold">No officers found matching filters.</p>
              <p className="text-sm text-[#9CA385]">Try clearing the district filter.</p>
            </div>
          ) : (
            filteredOfficers.map(officer => (
              <div key={officer._id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${officer.status?.includes('INACTIVE') ? 'opacity-70 border-gray-200 grayscale-[0.5]' : 'border-[#AEB877]/10 hover:shadow-md'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#AEB877]/20 text-[#4A5532] rounded-xl flex items-center justify-center font-bold text-xl">
                    👨‍💼
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C3318]">{officer.name}</h3>
                    <p className="text-xs text-[#5C6642] font-mono">{officer.email}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-[#F2F5E6] pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9CA385] font-bold uppercase text-xs">District</span>
                    <span className="font-bold text-[#4A5532]">{officer.district}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9CA385] font-bold uppercase text-xs">Mobile</span>
                    <span className="font-mono text-[#5C6642]">{officer.mobile}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center mt-2">
                    <span className="text-[#9CA385] font-bold uppercase text-xs">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'bg-[#E6F4EA] text-[#2C3318] border-[#A5C89E]' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(officer)}
                    className="flex-1 py-2 text-xs font-bold text-[#5C6642] bg-[#F2F5E6] rounded-lg hover:bg-[#AEB877] hover:text-[#2C3318] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(officer)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-700 border-green-200 hover:bg-green-50'}`}
                  >
                    {officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};