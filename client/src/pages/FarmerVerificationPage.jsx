import React, { useState, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const FarmerVerificationPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'sV uccess' or 'error'

  // Previews
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      setMessageType('error');
      return;
    }
    if (file) {
      setFile(file);
      setMessage('');

      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && !aadhaarFile) {
      setMessage('Please upload your Aadhaar card to proceed.');
      setMessageType('error');
      return;
    }
    if (step === 2 && !selfieFile) {
      setMessage('Please upload your photo to proceed.');
      setMessageType('error');
      return;
    }
    setMessage('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!aadhaarFile || !selfieFile) {
      setMessage('Please upload both Aadhaar and Selfie files.');
      setMessageType('error');
      return;
    }

    const formData = new FormData();
    formData.append('aadhaar', aadhaarFile);
    formData.append('selfie', selfieFile);

    try {
      setLoading(true);
      const response = await apiClient.post('/farmer/submit-verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Documents uploaded successfully! Redirecting...');
      setMessageType('success');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading files.');
      setMessageType('error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFDF5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="gov-h1 mb-2">Verify Your Identity</h1>
          <p className="text-[#5C6642]">Complete these simple steps to unlock full portal access.</p>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Progress Header */}
          <div className="bg-[#FFFBB1]/30 border-b border-[#AEB877]/20 px-6 py-4">
            <div className="flex items-center justify-between relative max-w-sm mx-auto">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#AEB877]/20 -z-10"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#AEB877] transition-all duration-300 -z-10"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>

              {/* Steps */}
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center bg-white/0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step === s ? 'border-[#AEB877] bg-[#AEB877] text-white' :
                    step > s ? 'border-[#A5C89E] bg-[#A5C89E] text-white' : 'border-[#AEB877]/30 bg-white text-[#9CA385]'
                    }`}>
                    {step > s ? '✓' : s}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-sm mx-auto mt-2 text-xs font-bold text-[#5C6642]">
              <span>Upload ID</span>
              <span>Selfie</span>
              <span>Review</span>
            </div>
          </div>

          <div className="p-8">
            {/* Status Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fadeIn ${messageType === 'success' ? 'bg-[#A5C89E]/20 border-[#A5C89E] text-[#2C3318]' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                <span className="text-xl">{messageType === 'success' ? '✅' : '⚠️'}</span>
                <p className="font-bold">{message}</p>
              </div>
            )}

            {/* Step 1: Aadhaar */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#AEB877]/20 text-[#4A5532] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🎫</div>
                  <h2 className="text-xl font-bold text-[#2C3318]">Upload Aadhaar Card</h2>
                  <p className="text-[#5C6642] text-sm mt-1">Make sure the document is clear and readable.</p>
                </div>

                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    id="aadhaar-upload"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, setAadhaarFile, setAadhaarPreview)}
                  />
                  <label htmlFor="aadhaar-upload" className="block w-full h-64 border-2 border-dashed border-[#AEB877]/40 rounded-2xl bg-[#FFFBB1]/20 hover:bg-[#FFFBB1]/50 hover:border-[#AEB877] transition-all flex flex-col items-center justify-center">
                    {aadhaarPreview ? (
                      <div className="relative h-full w-full p-4 flex items-center justify-center group-hover:opacity-50 transition-opacity">
                        <img src={aadhaarPreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white text-[#2C3318] px-4 py-2 rounded-lg font-bold shadow-lg">Change File</span>
                        </div>
                      </div>
                    ) : aadhaarFile ? (
                      <div className="text-center p-6">
                        <div className="text-5xl mb-4">📄</div>
                        <p className="font-bold text-[#4A5532]">{aadhaarFile.name}</p>
                        <p className="text-[#A5C89E] text-sm mt-2 font-bold">Ready to upload</p>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-[#AEB877]/20 text-[#4A5532] rounded-full flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform">☁️</div>
                        <p className="text-lg font-bold text-[#4A5532]">Click to upload document</p>
                        <p className="text-[#9CA385] text-sm mt-1">SVG, PNG, JPG or PDF (MAX. 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Selfie */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#AEB877]/20 text-[#4A5532] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📸</div>
                  <h2 className="text-xl font-bold text-[#2C3318]">Take a Photo</h2>
                  <p className="text-[#5C6642] text-sm mt-1">We need to match your face with your ID.</p>
                </div>

                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    id="selfie-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setSelfieFile, setSelfiePreview)}
                  />
                  <label htmlFor="selfie-upload" className="block w-full h-64 border-2 border-dashed border-[#AEB877]/40 rounded-2xl bg-[#FFFBB1]/20 hover:bg-[#FFFBB1]/50 hover:border-[#AEB877] transition-all flex flex-col items-center justify-center">
                    {selfiePreview ? (
                      <div className="relative h-full w-full p-4 flex items-center justify-center group-hover:opacity-50 transition-opacity">
                        <img src={selfiePreview} alt="Preview" className="h-48 w-48 object-cover rounded-full shadow-md border-4 border-white" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white text-[#2C3318] px-4 py-2 rounded-lg font-bold shadow-lg">Change Photo</span>
                        </div>
                      </div>
                    ) : selfieFile ? (
                      <div className="text-center p-6">
                        <div className="text-5xl mb-4">🖼️</div>
                        <p className="font-bold text-[#4A5532]">{selfieFile.name}</p>
                        <p className="text-[#A5C89E] text-sm mt-2 font-bold">Ready to upload</p>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-[#AEB877]/20 text-[#4A5532] rounded-full flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform">🤳</div>
                        <p className="text-lg font-bold text-[#4A5532]">Click to upload selfie</p>
                        <p className="text-[#9CA385] text-sm mt-1">JPG or PNG only</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-[#2C3318]">Confirm Submission</h2>
                  <p className="text-[#5C6642] text-sm">Please verify the details below.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#AEB877]/20 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FFFBB1] rounded-full flex items-center justify-center text-xl">📄</div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#9CA385] uppercase">Aadhaar Card</p>
                      <p className="text-sm font-bold text-[#4A5532] truncate">{aadhaarFile?.name}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#AEB877]/20 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FFFBB1] rounded-full flex items-center justify-center text-xl">📸</div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#9CA385] uppercase">Selfie / Photo</p>
                      <p className="text-sm font-bold text-[#4A5532] truncate">{selfieFile?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#AEB877]/10 p-4 rounded-xl border border-[#AEB877]/30 flex gap-3 text-sm text-[#4A5532]">
                  <span className="text-xl">ℹ️</span>
                  <p className="pt-0.5 font-medium">
                    By clicking submit, you confirm that the uploaded documents are valid and belong to you.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="bg-[#FFFBB1]/20 p-6 border-t border-[#AEB877]/20 flex justify-between items-center">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
              className="btn-outline px-6 py-2.5 text-sm"
            >
              {step > 1 ? 'Back' : 'Cancel'}
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                {loading ? 'Submitting...' : 'Confirm Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};