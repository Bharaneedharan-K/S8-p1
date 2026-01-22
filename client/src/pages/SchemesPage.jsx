import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const SchemesPage = () => {
    const { token, user } = useContext(AuthContext);
    const [schemes, setSchemes] = useState([]);
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [selectedLand, setSelectedLand] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Active Schemes
                const schemeRes = await axios.get('/api/schemes/active', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSchemes(schemeRes.data.schemes);

                // Fetch User's Approved Lands (for application)
                const landRes = await axios.get('/api/land?status=LAND_APPROVED', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLands(landRes.data.lands);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleApply = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSubmitting(true);

        // Validation: Check eligibility locally before server
        const land = lands.find(l => l._id === selectedLand);
        if (!land) {
            setSubmitting(false);
            return; // Should not happen
        }

        if (selectedScheme.minLandArea && land.area < selectedScheme.minLandArea) {
            setMessage({ type: 'error', text: `Not Eligible: Your land area (${land.area}) is less than required (${selectedScheme.minLandArea}).` });
            setSubmitting(false);
            return;
        }

        if (selectedScheme.allowedDistricts && selectedScheme.allowedDistricts.length > 0 && !selectedScheme.allowedDistricts.includes(land.district)) {
            setMessage({ type: 'error', text: `Not Eligible: Scheme not available in ${land.district}.` });
            setSubmitting(false);
            return;
        }


        try {
            await axios.post('/api/applications/apply', {
                schemeId: selectedScheme._id,
                landId: selectedLand
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Application Submitted Successfully! Track status in "My Applications".' });
            setSelectedScheme(null);
            setSelectedLand('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Application Failed' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2C3318]">Government Schemes</h1>
                    <p className="text-[#5C6642] mt-1">Browse and apply for available agricultural subsidies and benefits.</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-[#E6F4EA] text-[#2C3318]'}`}>
                        {message.type === 'error' ? '⚠️ ' : '✅ '} {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">Loading schemes...</div>
                ) : schemes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#AEB877]/30">
                        <p className="text-2xl mb-2">🌾</p>
                        <p className="text-[#5C6642] font-bold">No active schemes at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemes.map(scheme => (
                            <div key={scheme._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#AEB877]/10 hover:shadow-md transition-all flex flex-col">
                                <div className="mb-4">
                                    <span className="px-2 py-1 bg-[#FFFBB1] text-[#4A5532] text-xs font-bold rounded border border-[#AEB877]/20 uppercase tracking-widest">
                                        {scheme.schemeCode}
                                    </span>
                                    <h3 className="text-xl font-bold text-[#2C3318] mt-2 mb-2">{scheme.schemeName}</h3>
                                    <p className="text-[#5C6642] text-sm line-clamp-3">{scheme.description}</p>
                                </div>

                                <div className="space-y-2 mb-6 flex-1 text-sm text-[#5C6642]">
                                    <p><strong>Benefit:</strong> ₹{scheme.benefitAmount}</p>
                                    {scheme.minLandArea > 0 && <p><strong>Min Area:</strong> {scheme.minLandArea} Acres</p>}
                                    {scheme.allowedDistricts.length > 0 && <p><strong>Districts:</strong> {scheme.allowedDistricts.join(', ')}</p>}
                                </div>

                                <button
                                    onClick={() => setSelectedScheme(scheme)}
                                    className="w-full py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] transition-colors"
                                >
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Apply Modal */}
                {selectedScheme && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-6 bg-[#2C3318] text-white">
                                <h3 className="text-xl font-bold">Apply for {selectedScheme.schemeCode}</h3>
                                <p className="text-[#D8E983] text-sm mt-1">{selectedScheme.schemeName}</p>
                            </div>

                            <form onSubmit={handleApply} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#2C3318] mb-1">Select Verified Land</label>
                                    <select
                                        value={selectedLand}
                                        onChange={(e) => setSelectedLand(e.target.value)}
                                        required
                                        className="w-full p-3 bg-[#F2F5E6] border border-[#AEB877]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877]"
                                    >
                                        <option value="">-- Select Land Record --</option>
                                        {lands.map(land => (
                                            <option key={land._id} value={land._id}>
                                                {land.surveyNumber} - {land.area} Acres ({land.district})
                                            </option>
                                        ))}
                                    </select>
                                    {lands.length === 0 && <p className="text-xs text-red-600 mt-1">No approved lands found.</p>}
                                </div>

                                <div className="bg-[#FFFBB1]/30 p-3 rounded-xl text-xs text-[#5C6642]">
                                    <strong>Eligibility:</strong> {selectedScheme.eligibilityText}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedScheme(null)}
                                        className="flex-1 py-3 border border-[#E2E6D5] text-[#5C6642] font-bold rounded-xl hover:bg-[#F2F5E6]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !selectedLand}
                                        className="flex-1 py-3 bg-[#AEB877] text-[#2C3318] font-bold rounded-xl hover:bg-[#8B9850] disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Confirm Apply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
