import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaTractor, FaSeedling, FaFileContract, FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export const SchemesPage = () => {
    const { token, user } = useContext(AuthContext);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [lands, setLands] = useState([]); // User's verified lands for application
    const [selectedLand, setSelectedLand] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [documents, setDocuments] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        fetchSchemes();
        if (user?.role === 'FARMER') {
            fetchUserLands();
        }
    }, [user]);

    const fetchSchemes = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/schemes/active');
            const schemesList = res.data.schemes || [];
            setSchemes(Array.isArray(schemesList) ? schemesList : []);
        } catch (error) {
            console.error('Error fetching schemes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserLands = async () => {
        try {
            const res = await apiClient.get('/land');
            // Only allow applying with VERIFIED lands
            const landsList = res.data.lands || [];
            const verifiedLands = landsList.filter(l => l.status === 'LAND_APPROVED');
            setLands(verifiedLands);
        } catch (error) {
            console.error('Error fetching lands:', error);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!selectedLand) {
            setToast({ message: 'Please select a land record to apply with.', type: 'error' });
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('schemeId', selectedScheme._id);
            formData.append('landId', selectedLand);

            if (documents) {
                for (let i = 0; i < documents.length; i++) {
                    formData.append('documents', documents[i]);
                }
            }

            await apiClient.post('/applications/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setToast({ message: 'Application Submitted Successfully!', type: 'success' });
            setSelectedScheme(null);
            setSelectedLand('');
            setDocuments(null);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to submit application.';
            setToast({ message: msg, type: 'error' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast({ message: '', type: '' }), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#E2E6D5] py-8 px-4 sm:px-6 lg:px-8 relative">
            {/* Toast Notification */}
            {toast.message && (
                <div className={`fixed top-24 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform animate-slideIn ${toast.type === 'success' ? 'bg-[#2C3318] text-[#D8E983]' : 'bg-red-100 text-red-800'
                    }`}>
                    {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2C3318]">Government Schemes</h1>
                    <p className="text-[#5C6642] mt-1">Browse and apply for available agricultural subsidies and benefits.</p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-[#5C6642]">
                        <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-[#AEB877]" />
                        <p>Loading available schemes...</p>
                    </div>
                ) : schemes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#AEB877]/30">
                        <p className="text-4xl mb-4">🌾</p>
                        <p className="text-[#5C6642] font-bold text-lg">No active schemes available at the moment.</p>
                        <p className="text-[#9CA385] text-sm mt-2">Please check back later for new announcements.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemes.map(scheme => (
                            <div key={scheme._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#AEB877]/10 hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                                {/* Decorative bg element */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2F5E6] rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>

                                <div className="mb-4 relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${scheme.schemeType === 'CENTRAL' ? 'bg-orange-100 text-orange-800' :
                                            scheme.schemeType === 'STATE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {scheme.schemeType}
                                        </span>
                                        <span className="text-xs font-mono text-[#9CA385] bg-[#F2F5E6] px-2 py-1 rounded">{scheme.schemeCode}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#2C3318] mb-2 group-hover:text-[#AEB877] transition-colors leading-tight">{scheme.schemeName}</h3>
                                    <p className="text-[#5C6642] text-sm line-clamp-3 leading-relaxed">{scheme.description}</p>
                                </div>

                                <div className="space-y-3 mb-6 flex-1 text-sm text-[#5C6642] relative z-10">
                                    <div className="flex justify-between items-center py-2 border-t border-dashed border-[#AEB877]/20">
                                        <span className="text-xs uppercase tracking-wide font-semibold text-[#9CA385]">Benefit</span>
                                        <span className="font-bold text-[#2C3318] text-lg">₹{scheme.benefitAmount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs uppercase tracking-wide font-semibold text-[#9CA385]">Funding</span>
                                        <span className="font-bold text-[#4A5532] text-xs bg-[#F2F5E6] px-2 py-1 rounded-full">{scheme.fundingPattern}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedScheme(scheme)}
                                    className="w-full py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] transition-all shadow-md hover:shadow-xl active:scale-95"
                                >
                                    View Details & Apply
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detailed Modal */}
                {selectedScheme && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
                            {/* Modal Header */}
                            <div className="p-6 bg-[#2C3318] text-white shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#AEB877] rounded-full -mr-16 -mt-32 opacity-20 blur-3xl"></div>

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 mb-2">
                                            {selectedScheme.schemeType} SCHEME
                                        </span>
                                        <h3 className="text-2xl font-bold leading-tight">{selectedScheme.schemeName}</h3>
                                        <p className="text-[#A5C89E] text-sm mt-1 font-mono">{selectedScheme.schemeCode}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 z-20">
                                        <button onClick={() => setSelectedScheme(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md">
                                            <FaTimes />
                                        </button>
                                        <div className="text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                            <p className="text-3xl font-bold text-[#FFFBB1]">₹{selectedScheme.benefitAmount}</p>
                                            <p className="text-[#A5C89E] text-[10px] uppercase tracking-wider text-center">Benefit Amount</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto customized-scrollbar bg-[#FAFAF5]">
                                <div className="space-y-8">
                                    {/* Description */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-[#AEB877] uppercase tracking-widest mb-3">
                                            <FaFileContract /> Description
                                        </h4>
                                        <p className="text-[#2C3318] leading-relaxed text-sm bg-white p-4 rounded-xl border border-[#AEB877]/10 shadow-sm">
                                            {selectedScheme.description}
                                        </p>
                                    </div>

                                    {/* Criteria Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-[#AEB877]/10 shadow-sm">
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-[#4A5532] uppercase mb-4">
                                                <FaSeedling /> Eligibility Criteria
                                            </h4>
                                            <ul className="text-sm text-[#5C6642] space-y-3">
                                                <li className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                                                    <span>Gender</span>
                                                    <span className="font-bold text-[#2C3318]">{selectedScheme.genderEligibility}</span>
                                                </li>
                                                <li className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                                                    <span>Age Range</span>
                                                    <span className="font-bold text-[#2C3318]">{selectedScheme.ageLimit?.min} - {selectedScheme.ageLimit?.max} Years</span>
                                                </li>
                                                <li className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                                                    <span>Caste</span>
                                                    <span className="font-bold text-[#2C3318]">{selectedScheme.casteEligibility?.join(', ')}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span>Min Land</span>
                                                    <span className="font-bold text-[#2C3318]">{selectedScheme.minLandArea} Acres</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-[#FFFBB1]/20 p-5 rounded-xl border border-[#AEB877]/10 shadow-sm">
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-[#4A5532] uppercase mb-4">
                                                <FaFileContract /> Documents Required
                                            </h4>
                                            <ul className="text-sm text-[#5C6642] space-y-2">
                                                {selectedScheme.documentsRequired?.length > 0 ? (
                                                    selectedScheme.documentsRequired.map((doc, i) => (
                                                        <li key={i} className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-[#AEB877]/10">
                                                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#AEB877] shrink-0"></div>
                                                            <span className="leading-tight">{doc}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="italic text-gray-400">No specific documents listed.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Application Process */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-[#AEB877] uppercase tracking-widest mb-3">
                                            How to Apply
                                        </h4>
                                        <div className="bg-[#F2F5E6] p-4 rounded-xl text-sm text-[#5C6642] whitespace-pre-line border border-[#AEB877]/20">
                                            {selectedScheme.applicationProcess}
                                        </div>
                                    </div>

                                    {/* Application Form */}
                                    <div className="bg-white border border-[#AEB877]/20 rounded-xl p-5 shadow-lg relative overflow-hidden transform transition-all hover:scale-[1.01]">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AEB877]"></div>
                                        <h4 className="text-sm font-bold text-[#2C3318] mb-4 uppercase tracking-wider">Apply Now</h4>

                                        <form onSubmit={handleApply} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#9CA385] uppercase mb-1.5">Select Land Record</label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedLand}
                                                        onChange={(e) => setSelectedLand(e.target.value)}
                                                        required
                                                        className="w-full p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877] focus:border-transparent font-semibold text-[#2C3318] appearance-none"
                                                    >
                                                        <option value="">-- Choose Verified Land --</option>
                                                        {lands.map(land => (
                                                            <option key={land._id} value={land._id}>
                                                                Survey No: {land.surveyNumber} ({land.area} Acres) - {land.district}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#5C6642]">
                                                        <FaTractor />
                                                    </div>
                                                </div>
                                                {lands.length === 0 && (
                                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                                        <FaExclamationCircle /> You need verified land records to apply.
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-[#9CA385] uppercase mb-1.5">Upload Documents (Optional)</label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => setDocuments(e.target.files)}
                                                    className="w-full p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#5C6642] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2C3318] file:text-white hover:file:bg-[#4A5532]"
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedScheme(null)}
                                                    className="flex-1 py-3 border-2 border-[#E2E6D5] text-[#5C6642] font-bold rounded-xl hover:bg-[#F2F5E6] hover:border-[#AEB877] transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting || !selectedLand}
                                                    className="flex-2 w-full py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <FaSpinner className="animate-spin" /> Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Confirm Application <FaCheckCircle />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
