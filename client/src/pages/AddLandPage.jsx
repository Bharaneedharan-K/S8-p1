import React, { useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LAND_TYPES, TN_DISTRICTS } from '../utils/constants';

export const AddLandPage = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
    const [myBookings, setMyBookings] = useState([]);

    const [formData, setFormData] = useState({
        ownerName: '',
        surveyNumber: '',
        area: '',
        district: '',
        landType: 'Agricultural', // Default land type
        address: '',
        officerId: '', // For Farmer
        verificationDate: '' // For Farmer
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // Submit loading
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Farmer Specific State
    const [officers, setOfficers] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Officer Specific State
    const [searchEmail, setSearchEmail] = useState('');
    const [searchingFarmer, setSearchingFarmer] = useState(false);
    const [verifiedFarmer, setVerifiedFarmer] = useState(null);
    const [selectedLandId, setSelectedLandId] = useState(null); // ID of land being verified

    const isFarmer = user?.role === 'FARMER';
    const isOfficer = user?.role === 'OFFICER';

    const [pendingAppointments, setPendingAppointments] = useState([]);

    useEffect(() => {
        // Pre-fill district for both roles if available
        if (user?.district) {
            setFormData(prev => ({ ...prev, district: user.district }));
            if (isFarmer) {
                fetchOfficersInDistrict(user.district);
            }
        }
        if (isFarmer && user?.name) {
            setFormData(prev => ({ ...prev, ownerName: user.name, farmerId: user._id }));
        }

        if (isFarmer) {
            fetchMyBookings();
        } else if (isOfficer) {
            fetchPendingAppointments();
        }
    }, [user, isFarmer, isOfficer]);

    const fetchPendingAppointments = async () => {
        try {
            // Reusing the getPendingLands endpoint which filters by officerId
            const res = await apiClient.get('/land/pending');
            setPendingAppointments(res.data.lands || []);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const res = await apiClient.get('/land');
            setMyBookings(res.data.lands || []);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const fetchOfficersInDistrict = async (district) => {
        try {
            // Fetch Officers for the District
            const res = await apiClient.get(`/auth/users?role=OFFICER&district=${district}&status=OFFICER_ACTIVE`);
            setOfficers(res.data.users || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSlots = async (officerId) => {
        if (!officerId) return;
        try {
            setSlotsLoading(true);
            const res = await apiClient.get(`/land/slots/${officerId}`);
            setAvailableSlots(res.data.slots || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleOfficerChange = (e) => {
        const officerId = e.target.value;
        setFormData({ ...formData, officerId, verificationDate: '' });
        setAvailableSlots([]);
        fetchSlots(officerId);
    };

    // Officer: Search Farmer
    const handleSearchFarmer = async () => {
        if (!searchEmail) return;
        setSearchingFarmer(true);
        setError('');
        setVerifiedFarmer(null);

        try {
            // Officer can only search farmers in their district
            const res = await apiClient.get(`/auth/users?role=FARMER&district=${user?.district}`);
            const farmers = res.data.users || [];
            const foundFarmer = farmers.find(u => u.email === searchEmail);

            if (foundFarmer) {
                setVerifiedFarmer(foundFarmer);
                setFormData(prev => ({ ...prev, farmerId: foundFarmer._id, ownerName: foundFarmer.name }));
            } else {
                setError('Farmer not found in this district with that email.');
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
        setError('');
        setSuccess('');

        if (isOfficer && !verifiedFarmer && !selectedLandId) {
            setError('Please verify a farmer first.');
            return;
        }

        /* Document Upload Removed
        if (!file) {
            setError('Please upload the land document (PDF/Image).');
            return;
        } 
        */

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // If updating (Officer verifying), add status and check for existing hash if verifying
        if (selectedLandId) {
            data.append('status', 'LAND_PENDING_ADMIN_APPROVAL'); // Keep existing status or update to 'VERIFIED_BY_OFFICER' if we had that state
            // For now, we are just uploading the document, so status remains pending admin approval or we can assume this is the 'Verification' step.
            data.append('verificationDocument', file); // Field name expected by verifyLandRecord
        } else if (file) {
            data.append('document', file);
        }

        try {
            setLoading(true);

            if (selectedLandId) {
                // UPDATE / VERIFY Existing Record
                await apiClient.patch(`/land/verify/${selectedLandId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Verification Report Uploaded Successfully!');
            } else {
                // CREATE New Record
                await apiClient.post('/land/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess(isFarmer
                    ? 'Application Submitted! Officer will visit on scheduled date.'
                    : 'Land record added successfully! Sent for Admin Approval.'
                );
            }

            if (isFarmer) {
                await fetchMyBookings();
                setTimeout(() => {
                    setViewMode('list');
                    setSuccess('');
                    // Reset Form
                    resetForm();
                }, 2000);
            } else {
                await fetchPendingAppointments(); // Refresh officer list
                setTimeout(() => {
                    setSuccess('');
                    setViewMode('list'); // Close modal
                    resetForm();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            ownerName: user?.name || '',
            surveyNumber: '',
            area: '',
            district: user?.district || '',
            landType: 'Agricultural',
            address: '',
            officerId: '',
            verificationDate: ''
        });
        setFile(null);
        setSelectedLandId(null);
        setVerifiedFarmer(null);
    };

    return (
        <div className="min-h-screen bg-[#E2E6D5] pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Toast Notifications */}
            <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {error && (
                    <div className="pointer-events-auto bg-white border-l-4 border-red-500 shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight">
                        <h4 className="font-bold text-red-600">Error</h4>
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="pointer-events-auto bg-white border-l-4 border-[#AEB877] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight">
                        <h4 className="font-bold text-[#4A5532]">Success</h4>
                        <p className="text-[#5C6642] text-sm">{success}</p>
                    </div>
                )}
            </div>

            {/* FARMER LANDING VIEW: MY BOOKINGS LIST */}
            {isFarmer && (
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#2C3318]">My Booked Slots</h1>
                            <p className="text-[#5C6642]">Track your land verification appointments.</p>
                        </div>
                        <button
                            onClick={() => setViewMode('form')}
                            className="px-6 py-3 bg-[#AEB877] hover:bg-[#8B9850] text-[#2C3318] font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                        >
                            <span>+ Book New Slot</span>
                        </button>
                    </div>

                    {myBookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#AEB877]/20">
                            <div className="text-6xl mb-4">🗓️</div>
                            <h3 className="text-xl font-bold text-[#2C3318] mb-2">No Slots Booked Yet</h3>
                            <p className="text-[#5C6642] mb-6">Schedule your first land verification appointment now.</p>
                            <button
                                onClick={() => setViewMode('form')}
                                className="px-8 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532]"
                            >
                                Book Verification Slot
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myBookings.map(landing => (
                                <div key={landing._id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#AEB877]/20 hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold rounded-bl-xl ${landing.status === 'LAND_APPROVED' ? 'bg-[#E6F4EA] text-green-800' :
                                        landing.status === 'LAND_REJECTED' ? 'bg-red-50 text-red-800' :
                                            'bg-[#FFFBB1] text-[#705A06]'
                                        }`}>
                                        {landing.status === 'LAND_APPROVED' ? 'VERIFIED' : landing.status === 'LAND_REJECTED' ? 'REJECTED' : 'PENDING'}
                                    </div>

                                    <h3 className="text-xl font-bold text-[#2C3318] mt-2 mb-1">{landing.surveyNumber}</h3>
                                    <p className="text-sm text-[#5C6642] mb-4">{landing.address.substring(0, 40)}...</p>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-[#4A5532]">
                                            <span>👮‍♂️</span>
                                            <span className="font-bold">{landing.officerId?.name || 'Officer'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#4A5532]">
                                            <span>🗓️</span>
                                            <span className="font-mono bg-[#F2F5E6] px-2 py-0.5 rounded">
                                                {landing.verificationDate ? new Date(landing.verificationDate).toLocaleDateString() : 'Date Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* OFFICER VIEW: PENDING APPOINTMENTS LIST */}
            {isOfficer && viewMode === 'list' && (
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#2C3318]">Scheduled Verifications</h1>
                            <p className="text-[#5C6642]">Pending farmers assigned to you.</p>
                        </div>
                    </div>

                    {pendingAppointments.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#AEB877]/20">
                            <div className="text-6xl mb-4">🗓️</div>
                            <h3 className="text-xl font-bold text-[#2C3318] mb-2">No Pending Appointments</h3>
                            <p className="text-[#5C6642]">You have no scheduled land verifications.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingAppointments.map(land => (
                                <div
                                    key={land._id}
                                    onClick={() => {
                                        setFormData({
                                            ownerName: land.ownerName,
                                            surveyNumber: land.surveyNumber,
                                            area: land.area,
                                            district: land.district,
                                            landType: land.landType,
                                            address: land.address,
                                            officerId: land.officerId?._id || '',
                                            verificationDate: land.verificationDate || ''
                                        });
                                        setSelectedLandId(land._id);
                                        setViewMode('form');
                                    }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-[#AEB877]/20 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-[#FFFBB1] text-[#705A06] text-xs font-bold rounded-bl-xl">
                                        ACTION REQUIRED
                                    </div>
                                    <h3 className="text-xl font-bold text-[#2C3318] mt-2 mb-1">{land.surveyNumber}</h3>
                                    <p className="text-sm text-[#5C6642] mb-4">{land.ownerName}</p>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-[#4A5532]">
                                            <span>📞</span>
                                            <span className="font-mono">{land.farmerId?.mobile || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#4A5532]">
                                            <span>📍</span>
                                            <span>{land.address.substring(0, 30)}...</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#4A5532] mt-3 pt-3 border-t border-[#F2F5E6]">
                                            <span className="bg-[#AEB877] text-[#2C3318] px-2 py-0.5 rounded text-xs font-bold uppercase">
                                                {land.verificationDate ? new Date(land.verificationDate).toLocaleDateString() : 'No Date'}
                                            </span>
                                            <span className="text-xs text-[#9CA385] ml-auto group-hover:text-[#AEB877]">Click to Verify →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* FORM VIEW (Farmer or Officer) - MODAL OVERLAY */}
            {viewMode === 'form' && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3318]/60 backdrop-blur-sm ${!isFarmer ? 'relative bg-transparent backdrop-blur-0' : ''}`}>
                    <div className={`bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 border border-[#AEB877]/20 max-h-[90vh] overflow-y-auto animate-fadeIn ${!isFarmer ? 'shadow-none border-0' : ''}`}>
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-[#E2E6D5]">
                            <h2 className="text-2xl font-bold text-[#2C3318]">
                                {isFarmer ? 'Book Verification Slot' : (selectedLandId ? 'Verify Land Record' : 'Add New Land Record')}
                            </h2>
                            <button
                                onClick={() => setViewMode('list')}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2F5E6] text-[#5C6642] hover:bg-[#E2E6D5] hover:text-[#2C3318] transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Officer: Search NOT shown if editing existing appointment */}
                            {isOfficer && !selectedLandId && (
                                <div className="p-5 bg-[#F2F5E6] rounded-2xl border border-[#AEB877]/30">
                                    <label className="block text-sm font-bold text-[#5C6642] mb-2">Find Farmer (Email)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={searchEmail}
                                            onChange={(e) => setSearchEmail(e.target.value)}
                                            className="input-modern flex-1 bg-white"
                                            placeholder="farmer@example.com"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSearchFarmer}
                                            disabled={searchingFarmer}
                                            className="px-6 py-2 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] disabled:opacity-50"
                                        >
                                            {searchingFarmer ? '...' : 'Verify'}
                                        </button>
                                    </div>
                                    {verifiedFarmer && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                            <span className="text-2xl">👨‍🌾</span>
                                            <div>
                                                <p className="font-bold text-green-800">{verifiedFarmer.name}</p>
                                                <p className="text-xs text-green-600">{verifiedFarmer.mobile} | {verifiedFarmer.district}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Farmer: Officer Selection & Slot Booking */}
                            {isFarmer && (
                                <div className="p-5 bg-[#F2F5E6] rounded-2xl border border-[#AEB877]/30">
                                    <h3 className="font-bold text-[#2C3318] mb-4 flex items-center gap-2">
                                        <span className="bg-[#AEB877] text-[#2C3318] p-1 rounded text-xs">STEP 1</span> Select Officer
                                    </h3>

                                    <div className="mb-6">
                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-2">Select District</label>
                                        <select
                                            value={formData.district}
                                            onChange={(e) => {
                                                const newDistrict = e.target.value;
                                                setFormData(prev => ({ ...prev, district: newDistrict, officerId: '' }));
                                                setAvailableSlots([]);
                                                fetchOfficersInDistrict(newDistrict);
                                            }}
                                            className="input-modern mb-4 bg-white"
                                        >
                                            <option value="">-- Choose District --</option>
                                            {TN_DISTRICTS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>

                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-2">Available Officers in {formData.district || '...'}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {officers.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic col-span-2 text-center py-4">No active officers found in this district.</p>
                                            ) : (
                                                officers.map(off => (
                                                    <div
                                                        key={off._id}
                                                        onClick={() => handleOfficerChange({ target: { value: off._id } })}
                                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 relative ${formData.officerId === off._id
                                                            ? 'bg-[#2C3318] border-[#2C3318] text-white shadow-md'
                                                            : 'bg-white border-[#E2E6D5] text-[#2C3318] hover:border-[#AEB877] hover:bg-[#FFFBB1]/30'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${formData.officerId === off._id ? 'bg-[#AEB877] text-[#2C3318]' : 'bg-[#AEB877]/20 text-[#4A5532]'
                                                            }`}>
                                                            {off.name.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-sm truncate">{off.name}</p>
                                                            <p className={`text-xs font-bold truncate flex items-center gap-1 ${formData.officerId === off._id ? 'text-[#AEB877]' : 'text-[#5C6642]'
                                                                }`}>
                                                                📍 {off.area ? off.area : 'General'}
                                                            </p>
                                                        </div>
                                                        {formData.officerId === off._id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#AEB877]"></div>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {formData.officerId && (
                                        <div className="animate-fadeIn">
                                            <h3 className="font-bold text-[#2C3318] mb-3 flex items-center gap-2 border-t border-[#AEB877]/20 pt-4">
                                                <span className="bg-[#AEB877] text-[#2C3318] p-1 rounded text-xs">STEP 2</span> Select Date
                                            </h3>
                                            {slotsLoading ? (
                                                <div className="flex justify-center py-4">
                                                    <div className="animate-spin h-6 w-6 border-2 border-[#AEB877] border-t-transparent rounded-full"></div>
                                                </div>
                                            ) : availableSlots.length === 0 ? (
                                                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center">No slots available for this officer.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {availableSlots.map(slot => (
                                                        <button
                                                            key={slot.date}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, verificationDate: slot.date })}
                                                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all flex flex-col items-center min-w-[80px] ${formData.verificationDate === slot.date
                                                                ? 'bg-[#2C3318] text-white border-[#2C3318] ring-2 ring-[#AEB877] ring-offset-1'
                                                                : 'bg-white text-[#5C6642] border-[#AEB877]/30 hover:bg-[#FFFBB1] hover:border-[#AEB877]'
                                                                }`}
                                                        >
                                                            <span>{new Date(slot.date).getDate()}</span>
                                                            <span className="text-[10px] uppercase opacity-80">{new Date(slot.date).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className={`text-[9px] mt-1 px-1.5 rounded-full ${formData.verificationDate === slot.date ? 'bg-[#AEB877] text-[#2C3318]' : 'bg-[#F2F5E6] text-[#5C6642]'
                                                                }`}>{slot.available} Left</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Common Land Details */}
                            <div>
                                <h3 className="font-bold text-[#2C3318] mb-4 flex items-center gap-2">
                                    <span className="bg-[#AEB877] text-[#2C3318] p-1 rounded text-xs">DETAILS</span> Land Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-1">Owner Name</label>
                                        <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="input-modern bg-gray-50" readOnly={isFarmer || (isOfficer && verifiedFarmer && !selectedLandId)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-1">Survey Number</label>
                                        <input type="text" name="surveyNumber" value={formData.surveyNumber} onChange={handleChange} className="input-modern" placeholder="e.g. 123/4A" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-1">Area (Acres)</label>
                                        <input type="number" name="area" value={formData.area} onChange={handleChange} className="input-modern" placeholder="e.g. 2.5" step="0.01" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-1">Land Type</label>
                                        <select name="landType" value={formData.landType} onChange={handleChange} className="input-modern">
                                            {LAND_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-[#5C6642] uppercase mb-1">Full Address</label>
                                        <textarea name="address" required className="input-modern h-20 resize-none" onChange={handleChange} placeholder="Complete physical address of the land..." value={formData.address}></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Officer Verification Upload */}
                            {isOfficer && selectedLandId && (
                                <div className="mb-6 p-4 bg-[#F2F5E6] rounded-xl border border-dashed border-[#AEB877]">
                                    <label className="block text-sm font-bold text-[#2C3318] mb-2 flex items-center gap-2">
                                        <span>📄</span> Upload Land Document
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-[#5C6642]
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-[#2C3318] file:text-white
                                        file:cursor-pointer hover:file:bg-[#4A5532]"
                                        required
                                    />
                                    <p className="text-xs text-[#9CA385] mt-2">Upload the signed field inspection report (PDF/Image).</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E6D5]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        isFarmer ? setViewMode('list') : (selectedLandId ? setViewMode('list') : navigate('/dashboard'));
                                        if (selectedLandId) resetForm();
                                    }}
                                    className="px-6 py-3 rounded-xl border border-[#AEB877]/30 text-[#4A5532] font-bold hover:bg-[#F2F5E6] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || (isFarmer && !formData.verificationDate)}
                                    className="px-8 py-3 bg-[#AEB877] text-[#2C3318] font-bold rounded-xl shadow-lg hover:bg-[#8B9850] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-[#2C3318] border-t-transparent rounded-full"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        selectedLandId ? 'Submit Report' : 'Confirm Appointment'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div >
                </div>
            )}
        </div >
    );
};
