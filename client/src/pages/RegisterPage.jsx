import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DISTRICTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

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
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ... (validation logic remains same)
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

  const handleNext = () => {
    if (validateStep(step)) {
      setLocalError('');
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const result = await register({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      district: formData.district,
    });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-[#FFFBB1]/60 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#A5C89E]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#4A5532] tracking-tight">Create Account</h1>
          <p className="text-[#5C6642] mt-2">Join the Digital Land Registry Portal</p>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-[#FCFDF5] border-b border-[#AEB877]/20 px-6 py-4">
            <div className="flex justify-between mb-2">
              {['Basic Info', 'Location', 'Security'].map((label, index) => (
                <span key={index} className={`text-xs font-bold uppercase tracking-wider ${step > index ? 'text-[#AEB877]' : step === index + 1 ? 'text-[#8B9850]' : 'text-slate-300'}`}>
                  {label}
                </span>
              ))}
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D8E983] to-[#AEB877] transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {(error || localError) && (
              <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-fadeIn">
                <span>⚠️</span> {error || localError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-[#4A5532] mb-1.5 ml-1">Full Name</label>
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
                    <label className="block text-sm font-bold text-[#4A5532] mb-1.5 ml-1">Email Address</label>
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

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-[#4A5532] mb-1.5 ml-1">District</label>
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
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#5C6642]">▼</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#4A5532] mb-1.5 ml-1">Mobile Number</label>
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

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-[#4A5532] mb-1.5 ml-1">Password</label>
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
                    <label className="block text-sm font-bold text-[#4A5532] mb-1.5 ml-1">Confirm Password</label>
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
                    <button type="button" onClick={() => setStep(2)} className="btn-outline">Back</button>
                    <button type="submit" disabled={loading} className="btn-secondary shadow-[#A5C89E]/20">
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[#5C6642] mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#AEB877] hover:text-[#8B9850] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
