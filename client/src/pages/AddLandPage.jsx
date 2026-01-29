import React, { useState, useContext } from 'react';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LAND_TYPES } from '../utils/constants';

export const AddLandPage = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        farmerId: '', // To be searched/verified
        ownerName: '',
        surveyNumber: '',
        area: '',
        district: user?.district || '',
        landType: 'Agricultural',
        address: '',
    });
    const [file, setFile] = useState(null);

    // Farmer Search State
    const [searchEmail, setSearchEmail] = useState('');
    const [verifiedFarmer, setVerifiedFarmer] = useState(null);
    const [searchingFarmer, setSearchingFarmer] = useState(false);

    const handleSearchFarmer = async () => {
        if (!searchEmail) return;
        try {
            setSearchingFarmer(true);
            setError('');
            // Use the generic user search endpoint, filtered by email/role if possible, 
            // or cleaner: backend could have a specialized search endpoint.
            // For now, we'll try to get all and filter, or use an existing endpoint.
            // Better approach: Let's assume the officer gets farmers in their district
            const res = await apiClient.get(`/auth/users?role=FARMER`);

            const foundFarmer = res.data.users.find(u => u.email === searchEmail);

            if (foundFarmer) {
                setVerifiedFarmer(foundFarmer);
                setFormData(prev => ({ ...prev, farmerId: foundFarmer._id, ownerName: foundFarmer.name }));
            } else {
                setError('Farmer not found in this district with that email.');
                setVerifiedFarmer(null);
            }
        } catch (err) {
            setError('Failed to search for farmer.');
        } finally {
            setSearchingFarmer(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!verifiedFarmer) {
            setError('Please verify the Farmer identity first.');
            return;
        }
        if (!file) {
            setError('Please upload the land document.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            data.append('document', file);

            // apiClient automatically handles Auth header
            await apiClient.post('/land/add', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Land record added successfully! Sent for Admin Approval.');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add land record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-[#2C3318] mb-2">Add New Land Record</h1>
                <p className="text-[#5C6642] mb-8">Register land details and documents for admin verification.</p>

                <div className="bg-white rounded-2xl shadow-xl shadow-[#AEB877]/10 p-8 border border-[#AEB877]/20">
                    {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 border border-red-200">⚠️ {error}</div>}
                    {success && <div className="bg-[#E6F4EA] text-[#2C3318] px-4 py-3 rounded-lg mb-6 border border-[#A5C89E]">✅ {success}</div>}

                    {/* Farmer Verification Step */}
                    <div className="mb-8 p-6 bg-[#FCFDF5] rounded-xl border border-[#E2E6D5]">
                        <h3 className="font-bold text-[#2C3318] mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#AEB877] text-white flex items-center justify-center text-sm">1</span>
                            Verify Farmer Logic
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="email"
                                placeholder="Enter Farmer Email"
                                className="input-modern flex-1"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                            />
                            <button
                                onClick={handleSearchFarmer}
                                disabled={searchingFarmer}
                                className="px-6 py-2 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] transition-colors"
                            >
                                {searchingFarmer ? 'Searching...' : 'Verify'}
                            </button>
                        </div>
                        {verifiedFarmer && (
                            <div className="mt-4 p-4 bg-[#E6F4EA] rounded-lg border border-[#A5C89E]/30 flex items-center gap-4 animate-fadeIn">
                                <div className="w-10 h-10 bg-[#AEB877]/20 rounded-full flex items-center justify-center text-[#4A5532] font-bold">
                                    {verifiedFarmer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-[#2C3318]">{verifiedFarmer.name}</p>
                                    <p className="text-xs text-[#5C6642]">ID: {verifiedFarmer._id}</p>
                                </div>
                                <span className="ml-auto text-xs font-bold text-[#4A5532] bg-[#D8E983]/50 px-2 py-1 rounded">
                                    Verified
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Land Detail Form */}
                    <form onSubmit={handleSubmit} className={verifiedFarmer ? 'opacity-100 transition-opacity' : 'opacity-50 pointer-events-none'}>
                        <h3 className="font-bold text-[#2C3318] mb-6 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#AEB877] text-white flex items-center justify-center text-sm">2</span>
                            Land Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-[#5C6642] mb-1">Owner Name</label>
                                <input type="text" name="ownerName" className="input-modern bg-gray-50" value={formData.ownerName} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#5C6642] mb-1">Survey Number</label>
                                <input type="text" name="surveyNumber" required className="input-modern" onChange={handleChange} placeholder="e.g. SR-1024-BLK-A" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#5C6642] mb-1">Area (Acres)</label>
                                <input type="number" name="area" required className="input-modern" onChange={handleChange} placeholder="e.g. 5.5" step="0.01" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#5C6642] mb-1">Land Type</label>
                                <select name="landType" required className="input-modern appearance-none bg-white" onChange={handleChange}>
                                    {LAND_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-[#5C6642] mb-1">Full Address</label>
                            <textarea name="address" required className="input-modern h-24 resize-none" onChange={handleChange} placeholder="Complete physical address of the land..."></textarea>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#5C6642] mb-1">Upload Property Document (PDF/Image)</label>
                            <div className="border-2 border-dashed border-[#AEB877]/40 rounded-xl p-8 text-center hover:bg-[#AEB877]/5 transition-colors cursor-pointer relative">
                                <input type="file" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                                <div className="text-4xl mb-2">📂</div>
                                <p className="font-bold text-[#2C3318]">{file ? file.name : 'Click to Upload Document'}</p>
                                <p className="text-xs text-[#9CA385] mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t border-[#E2E6D5] pt-6">
                            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl border border-[#AEB877]/30 text-[#4A5532] font-bold hover:bg-[#F2F5E6]">Cancel</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-[#AEB877] text-[#2C3318] font-bold rounded-xl shadow-lg hover:bg-[#8B9850] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Record'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
