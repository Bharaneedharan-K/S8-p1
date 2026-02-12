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
    <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Toast Notifications (Fixed Side Position) */}
      <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {error && (
          <div className="pointer-events-auto bg-white border-l-4 border-[#D32F2F] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <h4 className="font-bold text-[#D32F2F]">Error</h4>
              <p className="text-[#555555] text-sm">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="pointer-events-auto bg-white border-l-4 border-[#2E8B57] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="font-bold text-[#2E8B57]">Success</h4>
              <p className="text-[#555555] text-sm">{success}</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Manage Officers</h1>
            <p className="text-[#555555] mt-1">Create and monitor land verification officers.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-[#0B3D91] hover:bg-[#092C6B] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <span>{showForm ? '✕ Cancel' : '+ Add New Officer'}</span>
          </button>
        </div>

        {/* Create Officer Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-[#E0E0E0] mb-8 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#222222] mb-6">Create New Officer Account</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#555555] mb-1">Full Name</label>
                <input type="text" name="name" required className="input-modern" onChange={handleChange} value={formData.name} placeholder="Officer Name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#555555] mb-1">Email Address</label>
                <input type="email" name="email" required className="input-modern" onChange={handleChange} value={formData.email} placeholder="officer@gov.in" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#555555] mb-1">District to Assign</label>
                <div className="relative">
                  <select name="district" required className="input-modern appearance-none bg-white" onChange={handleChange} value={formData.district}>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#555555]">▼</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#555555] mb-1">Area (Taluk/Block)</label>
                <input type="text" name="area" className="input-modern" onChange={handleChange} value={formData.area} placeholder="e.g. North Taluk" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#555555] mb-1">Mobile Number</label>
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
                <p className="text-xs text-[#555555] mt-1 text-right">{formData.mobile.length}/10</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#555555] mb-1">Password</label>
                <input type="password" name="password" required className="input-modern" onChange={handleChange} value={formData.password} placeholder="Set secure password" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="px-8 py-3 bg-[#0B3D91] hover:bg-[#092C6B] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-[#E0E0E0]">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#222222]">Filter by District:</span>
            <select
              className="px-4 py-2 bg-[#F9FAFB] border border-[#E0E0E0] rounded-lg text-sm text-[#555555] focus:outline-none focus:border-[#0B3D91]"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="text-sm text-[#555555]">
            Showing <span className="font-bold text-[#222222]">{filteredOfficers.length}</span> officers
          </div>
        </div>

        {/* Edit Modal Overlay */}
        {editingOfficer && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fadeIn">
              <h3 className="text-2xl font-bold text-[#222222] mb-6">Edit Officer Details</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#555555] mb-1">Full Name</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#555555] mb-1">Mobile</label>
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
                  <label className="block text-sm font-bold text-[#555555] mb-1">District</label>
                  <select
                    className="input-modern appearance-none bg-white"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#555555] mb-1">Area (Taluk/Block)</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    placeholder="e.g. North Taluk"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingOfficer(null)}
                    className="flex-1 py-3 border border-[#E0E0E0] text-[#555555] font-bold rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B]"
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
            <p className="col-span-3 text-center text-[#555555] py-8">Loading officer data...</p>
          ) : filteredOfficers.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white/50 rounded-2xl border border-dashed border-[#E0E0E0]">
              <p className="text-[#555555] font-bold">No officers found matching filters.</p>
              <p className="text-sm text-[#555555]">Try clearing the district filter.</p>
            </div>
          ) : (
            filteredOfficers.map(officer => (
              <div key={officer._id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${officer.status?.includes('INACTIVE') ? 'opacity-70 border-gray-200 grayscale-[0.5]' : 'border-[#E0E0E0] hover:shadow-md'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-[#0B3D91] rounded-xl flex items-center justify-center font-bold text-xl">
                    👨‍💼
                  </div>
                  <div>
                    <h3 className="font-bold text-[#222222]">{officer.name}</h3>
                    <p className="text-xs text-[#555555] font-mono">{officer.email}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-[#F4F6F9] pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#555555] font-bold uppercase text-xs">District</span>
                    <span className="font-bold text-[#222222]">{officer.district}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#555555] font-bold uppercase text-xs">Mobile</span>
                    <span className="font-mono text-[#555555]">{officer.mobile}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center mt-2">
                    <span className="text-[#555555] font-bold uppercase text-xs">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]' : 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'}`}>
                      {officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(officer)}
                    className="flex-1 py-2 text-xs font-bold text-[#0B3D91] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(officer)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${officer.status?.includes('ACTIVE') || officer.status === 'ACTIVE' ? 'text-[#D32F2F] border-[#D32F2F] hover:bg-red-50' : 'text-[#2E8B57] border-[#2E8B57] hover:bg-green-50'}`}
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