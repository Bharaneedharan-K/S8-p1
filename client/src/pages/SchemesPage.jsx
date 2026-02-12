import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaTractor, FaSeedling, FaFileContract, FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes, FaRupeeSign, FaArrowRight, FaFilter } from 'react-icons/fa';

export const SchemesPage = () => {
    const { token, user } = useContext(AuthContext);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [lands, setLands] = useState([]);
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
            setSchemes(Array.isArray(res.data.schemes) ? res.data.schemes : []);
        } catch (error) {
            console.error('Error fetching schemes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserLands = async () => {
        try {
            const res = await apiClient.get('/land');
            const verifiedLands = (res.data.lands || []).filter(l => l.status === 'LAND_APPROVED');
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
        <div className="min-h-screen bg-[#F4F6F9] py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Toast Notification */}
            {toast.message && (
                <div className={`fixed top-24 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform animate-slideIn ${toast.type === 'success' ? 'bg-[#1B5E20] text-white' : 'bg-[#D32F2F] text-white'
                    }`}>
                    {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] tracking-tight">Government Schemes</h1>
                        <p className="text-[#555555] mt-1 text-lg">Browse and apply for agricultural subsidies and benefits.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#0B3D91]/30 border-t-[#0B3D91] rounded-full animate-spin mb-4"></div>
                        <p className="text-[#555555] font-medium">Loading schemes...</p>
                    </div>
                ) : schemes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-[#E0E0E0] shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                            🌾
                        </div>
                        <h3 className="text-xl font-bold text-[#222222] mb-2">No Active Schemes</h3>
                        <p className="text-[#555555]">Check back later for new government announcements.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {schemes.map(scheme => (
                            <div key={scheme._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E0E0E0] flex flex-col overflow-hidden hover:-translate-y-1">
                                <div className="p-6 pb-4 relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${scheme.schemeType === 'CENTRAL'
                                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {scheme.schemeType}
                                        </span>
                                        <span className="font-mono text-xs text-[#999999]">{scheme.schemeCode}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-[#222222] mb-3 leading-tight group-hover:text-[#0B3D91] transition-colors line-clamp-2 min-h-[3.5rem]">
                                        {scheme.schemeName}
                                    </h3>
                                    <p className="text-[#555555] text-sm line-clamp-3 leading-relaxed mb-4">
                                        {scheme.description}
                                    </p>
                                </div>

                                <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#F4F6F9] mt-auto">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-[#999999] uppercase">Benefit Amount</p>
                                            <p className="text-lg font-black text-[#1B5E20] flex items-center">
                                                <FaRupeeSign className="text-sm" /> {scheme.benefitAmount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[#999999] uppercase">Funding</p>
                                            <p className="text-sm font-bold text-[#222222]">{scheme.fundingPattern}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedScheme(scheme)}
                                        className="w-full py-3 bg-white border border-[#0B3D91] text-[#0B3D91] font-bold rounded-xl hover:bg-[#0B3D91] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md"
                                    >
                                        View Details & Apply <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Application Modal */}
                {selectedScheme && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
                            {/* Header */}
                            <div className="bg-[#0B3D91] p-6 text-white shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="pr-8">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 mb-2">
                                            {selectedScheme.schemeType} SCHEME
                                        </span>
                                        <h2 className="text-2xl font-bold leading-tight">{selectedScheme.schemeName}</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedScheme(null)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F4F6F9] p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E0E0E0]">
                                            <h4 className="text-sm font-bold text-[#0B3D91] uppercase mb-4 flex items-center gap-2">
                                                <FaFileContract /> Scheme Description
                                            </h4>
                                            <p className="text-[#555555] leading-relaxed text-sm">
                                                {selectedScheme.description}
                                            </p>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E0E0E0]">
                                            <h4 className="text-sm font-bold text-[#0B3D91] uppercase mb-4 flex items-center gap-2">
                                                <FaSeedling /> Eligibility Criteria
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#F4F6F9]">
                                                    <p className="text-xs text-[#999999] uppercase font-bold mb-1">Gender</p>
                                                    <p className="font-semibold text-[#222222]">{selectedScheme.genderEligibility}</p>
                                                </div>
                                                <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#F4F6F9]">
                                                    <p className="text-xs text-[#999999] uppercase font-bold mb-1">Age Limit</p>
                                                    <p className="font-semibold text-[#222222]">{selectedScheme.ageLimit?.min} - {selectedScheme.ageLimit?.max} Years</p>
                                                </div>
                                                <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#F4F6F9] col-span-2">
                                                    <p className="text-xs text-[#999999] uppercase font-bold mb-1">Min Land Area</p>
                                                    <p className="font-semibold text-[#222222]">{selectedScheme.minLandArea} Acres</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-1 space-y-6">
                                        <div className="bg-[#E8F5E9] p-6 rounded-2xl border border-[#C8E6C9]">
                                            <p className="text-xs font-bold text-[#1B5E20] uppercase mb-1">Benefit Amount</p>
                                            <p className="text-3xl font-black text-[#1B5E20]">₹{selectedScheme.benefitAmount.toLocaleString()}</p>
                                            <p className="text-xs text-[#2E7D32] mt-2 font-medium">Direct Transfer</p>
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E0E0E0]">
                                            <h4 className="text-xs font-bold text-[#555555] uppercase mb-3">Required Documents</h4>
                                            <ul className="space-y-2">
                                                {selectedScheme.documentsRequired?.length > 0 ? (
                                                    selectedScheme.documentsRequired.map((doc, i) => (
                                                        <li key={i} className="text-sm text-[#555555] flex items-start gap-2">
                                                            <FaCheckCircle className="text-[#0B3D91] mt-0.5 text-xs shrink-0" />
                                                            <span className="leading-tight">{doc}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-[#999999] italic">No specific documents.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Form */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E0E0E0] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#0B3D91]"></div>
                                    <h3 className="text-lg font-bold text-[#222222] mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs">1</span>
                                        Select Land & Apply
                                    </h3>

                                    <form onSubmit={handleApply} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#222222] mb-2">Select Verified Land Record <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    value={selectedLand}
                                                    onChange={(e) => setSelectedLand(e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] appearance-none transition-all"
                                                >
                                                    <option value="">-- Choose Land --</option>
                                                    {lands.map(land => (
                                                        <option key={land._id} value={land._id}>
                                                            Survey No: {land.surveyNumber} ({land.area} Ac) - {land.district}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaTractor className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                                            </div>
                                            {lands.length === 0 && (
                                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium bg-red-50 p-2 rounded-lg">
                                                    <FaExclamationCircle /> You have no verified lands to apply with.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#222222] mb-2">Upload Additional Documents (Optional)</label>
                                            <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 text-center hover:bg-[#F9FAFB] transition-colors cursor-pointer group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => setDocuments(e.target.files)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className="w-10 h-10 bg-blue-50 text-[#0B3D91] rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <FaFileContract />
                                                    </div>
                                                    <p className="text-sm font-bold text-[#555555] group-hover:text-[#222222]">Click to Upload Files</p>
                                                    <p className="text-xs text-[#999999] mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                                </div>
                                            </div>
                                            {documents && (
                                                <p className="text-xs text-[#0B3D91] font-bold mt-2 text-center">{documents.length} files selected</p>
                                            )}
                                        </div>

                                        <div className="pt-4 flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedScheme(null)}
                                                className="flex-1 py-3 border border-[#E0E0E0] text-[#555555] font-bold rounded-xl hover:bg-[#F4F6F9] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !selectedLand}
                                                className="flex-[2] py-3 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {submitting ? <FaSpinner className="animate-spin" /> : 'Confirm Application'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
