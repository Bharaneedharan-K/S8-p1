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

  // Form State
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/create-officer', formData);
      setSuccess('Officer account created successfully!');
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', district: '', mobile: '' });
      fetchOfficers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create officer');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2E6D5] py-8 px-4 sm:px-6 lg:px-8">
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

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 border border-red-200 animate-fadeIn">⚠️ {error}</div>
        )}
        {success && (
          <div className="bg-[#E6F4EA] text-[#2C3318] px-4 py-3 rounded-xl mb-6 border border-[#A5C89E] animate-fadeIn">✅ {success}</div>
        )}

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
                <input type="tel" name="mobile" required className="input-modern" onChange={handleChange} value={formData.mobile} placeholder="10-digit number" />
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

        {/* Officers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 text-center text-[#5C6642] py-8">Loading officer data...</p>
          ) : officers.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white/50 rounded-2xl border border-dashed border-[#AEB877]/30">
              <p className="text-[#5C6642] font-bold">No officers found.</p>
              <p className="text-sm text-[#9CA385]">Create a new officer to get started.</p>
            </div>
          ) : (
            officers.map(officer => (
              <div key={officer._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#AEB877]/10 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#AEB877]/20 text-[#4A5532] rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-[#AEB877] group-hover:text-white transition-colors">
                    👨‍💼
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C3318]">{officer.name}</h3>
                    <p className="text-xs text-[#5C6642] font-mono">{officer.email}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-[#F2F5E6] pt-4">
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
                    <span className="px-2 py-1 bg-[#E6F4EA] text-[#2C3318] rounded border border-[#A5C89E] text-xs font-bold">Active</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};