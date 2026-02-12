import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in using valid credentials');
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#F4F6F9]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#0B3D91]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#0B3D91]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 z-10 glass-card p-2 md:p-4 border border-[#E0E0E0] shadow-lg">
        {/* Left Side - Brand/Welcome (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-center items-start p-8 md:p-12 bg-[#0B3D91] rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner border border-white/20">
              🌾
            </div>
            <h2 className="text-3xl font-extrabold mb-4 leading-tight text-white">
              Welcome to the <br />Farmer & Land Portal
            </h2>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">
              Secure access to your land records, government schemes, and digital verification services.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-white">
              <span className="flex items-center gap-1">🔒 Secure</span>
              <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
              <span className="flex items-center gap-1">🚀 Fast</span>
              <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
              <span className="flex items-center gap-1">🏛️ Government</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-bold text-[#222222]">Sign In</h2>
            <p className="text-sm text-[#555555] mt-1">Please enter your credentials to continue</p>
          </div>

          {/* Demo Credentials Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-xs text-[#0B3D91]">
            <p className="font-bold text-[#0B3D91] mb-1">🔧 Demo Admin Credentials:</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
              <span>Email:</span> <span className="font-mono text-[#222222]">admin@government.in</span>
              <span>Pass:</span> <span className="font-mono text-[#222222]">Admin@12345</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {(error || localError) && (
              <div className="bg-red-50 text-[#D32F2F] px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-fadeIn">
                <span>⚠️</span> {error || localError}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="input-modern"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#222222] mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-modern pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#222222] text-sm font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg"
              >
                {loading ? 'Verifying...' : 'Access Portal'}
              </button>
            </div>

            <p className="text-center text-sm text-[#555555] mt-6">
              New to the portal?{' '}
              <Link to="/register" className="font-bold text-[#0B3D91] hover:text-[#092C6B] hover:underline">
                Register as Farmer
              </Link>
            </p>
          </form>

          {/* Mobile Only Branding */}
          <div className="md:hidden mt-8 pt-6 border-t border-[#E0E0E0] text-center">
            <p className="text-xs text-[#999999]">Government of India • Secure Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
