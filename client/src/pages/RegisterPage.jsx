import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';

import { TN_DISTRICTS } from '../utils/constants';

const DISTRICTS = TN_DISTRICTS;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    district: '',
  });
  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarCard: null,
  });
  const [localError, setLocalError] = useState('');

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!formData.name || !formData.email) {
        setLocalError('Please fill in name and email');
        return false;
      }
      if (!formData.email.includes('@')) {
        setLocalError('Please enter a valid email');
        return false;
      }
    } else if (stepNum === 2) {
      if (!formData.mobile || !formData.district) {
        setLocalError('Please select district and enter mobile number');
        return false;
      }
      if (formData.mobile.length !== 10 || !/^\d+$/.test(formData.mobile)) {
        setLocalError('Please enter a valid 10-digit mobile number');
        return false;
      }
    } else if (stepNum === 3) {
      if (!files.profilePhoto || !files.aadhaarCard) {
        setLocalError('Please upload both Profile Photo and Aadhaar Card');
        return false;
      }
    } else if (stepNum === 4) {
      if (!formData.password || !formData.confirmPassword) {
        setLocalError('Please enter password');
        return false;
      }
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setLocalError('File size must be less than 5MB');
        return;
      }
      setFiles((prev) => ({ ...prev, [field]: file }));
      setLocalError('');
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setLocalError('');
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => formDataObj.append(key, formData[key]));
      if (files.profilePhoto) formDataObj.append('profilePhoto', files.profilePhoto);
      if (files.aadhaarCard) formDataObj.append('aadhaarCard', files.aadhaarCard);

      const result = await register(formDataObj); // register function in context handles FormData

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setLocalError('Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative bg-[#F4F6F9]">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-[#0B3D91]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#0B3D91]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#222222] tracking-tight">Create Account</h1>
          <p className="text-[#555555] mt-2">Join the Digital Land Registry Portal</p>
        </div>

        <div className="glass-card overflow-hidden border border-[#E0E0E0] shadow-lg">
          {/* Progress Bar */}
          <div className="bg-gray-50 border-b border-[#E0E0E0] px-6 py-4">
            <div className="flex justify-between mb-2">
              {['Basic Info', 'Location', 'Identity', 'Security'].map((label, index) => (
                <span key={index} className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step > index ? 'text-[#0B3D91]' : step === index + 1 ? 'text-[#0B3D91]' : 'text-gray-400'}`}>
                  {label}
                </span>
              ))}
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B3D91] transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white">
            {(error || localError) && (
              <div className="mb-6 bg-red-50 text-[#D32F2F] px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-fadeIn">
                <span>⚠️</span> {error || localError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="e.g. Rajesh Kumar"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="rajesh@example.com"
                    />
                  </div>
                  <button type="button" onClick={handleNext} className="w-full btn-primary mt-4">
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">District</label>
                    <div className="relative">
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="input-modern appearance-none bg-white hover:bg-white"
                      >
                        <option value="">Select District</option>
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#555555]">▼</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Mobile Number</label>
                    <input
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength="10"
                      className="input-modern"
                      placeholder="10-digit number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline">Back</button>
                    <button type="button" onClick={handleNext} className="btn-primary">Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Identity Verification (NEW) */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Profile Photo Upload */}
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-2 ml-1">Profile Photo (Selfie)</label>
                    <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 bg-gray-50 hover:bg-[#F4F6F9] transition-colors text-center cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profilePhoto')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {files.profilePhoto ? (
                          <>
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-[#0B3D91]">
                              <img src={URL.createObjectURL(files.profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-semibold text-[#222222] flex items-center gap-1">
                              <FiCheck className="text-green-600" /> {files.profilePhoto.name}
                            </span>
                            <span className="text-xs text-[#999999]">Click to change</span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0B3D91] group-hover:scale-110 transition-transform">
                              <FiUpload size={24} />
                            </div>
                            <span className="text-sm font-medium text-[#555555]">Click to upload photo</span>
                            <span className="text-xs text-[#999999]">JPG, PNG max 5MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Aadhaar Card Upload */}
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-2 ml-1">Aadhaar Card (ID Proof)</label>
                    <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 bg-gray-50 hover:bg-[#F4F6F9] transition-colors text-center cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'aadhaarCard')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {files.aadhaarCard ? (
                          <>
                            <FiCheck className="text-green-600 text-3xl mb-1" />
                            <span className="text-sm font-semibold text-[#222222]">{files.aadhaarCard.name}</span>
                            <span className="text-xs text-[#999999]">Click to change</span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0B3D91] group-hover:scale-110 transition-transform">
                              <FiUpload size={24} />
                            </div>
                            <span className="text-sm font-medium text-[#555555]">Click to upload Aadhaar</span>
                            <span className="text-xs text-[#999999]">JPG, PDF max 5MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button type="button" onClick={() => setStep(2)} className="btn-outline">Back</button>
                    <button type="button" onClick={handleNext} className="btn-primary">Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 4: Security (Password) */}
              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="Re-enter password"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button type="button" onClick={() => setStep(3)} className="btn-outline">Back</button>
                    <button type="submit" disabled={loading} className="btn-secondary shadow-sm">
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[#555555] mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#0B3D91] hover:text-[#092C6B] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
