import React, { useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LAND_TYPES, TN_DISTRICTS } from '../utils/constants';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaCheckCircle, FaSpinner, FaTimes, FaPlus, FaSearch, FaLeaf } from 'react-icons/fa';

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

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        if (selectedLandId) {
            data.append('status', 'LAND_PENDING_ADMIN_APPROVAL');
            data.append('verificationDocument', file);
        } else if (file) {
            data.append('document', file);
        }

        try {
            setLoading(true);

            if (selectedLandId) {
                await apiClient.patch(`/land/verify/${selectedLandId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Verification Report Uploaded Successfully!');
            } else {
                await apiClient.post('/land/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess(isFarmer
                    ? 'Slot Booked Successfully! Application Submitted.'
                    : 'Land record added successfully! Sent for Admin Approval.'
                );
            }

            if (isFarmer) {
                await fetchMyBookings();
                setTimeout(() => {
                    setViewMode('list');
                    setSuccess('');
                    resetForm();
                }, 2000);
            } else {
                await fetchPendingAppointments();
                setTimeout(() => {
                    setSuccess('');
                    setViewMode('list');
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
        <div className="min-h-screen bg-[#F4F6F9] pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Toast Notifications */}
            <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {error && (
                    <div className="pointer-events-auto bg-white border-l-4 border-[#D32F2F] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
                        <FaTimes className="text-[#D32F2F]" />
                        <div>
                            <h4 className="font-bold text-[#D32F2F] text-sm">Error</h4>
                            <p className="text-[#555555] text-xs">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="pointer-events-auto bg-white border-l-4 border-[#1B5E20] shadow-2xl rounded-r-xl px-6 py-4 animate-slideInRight flex items-center gap-3">
                        <FaCheckCircle className="text-[#1B5E20]" />
                        <div>
                            <h4 className="font-bold text-[#1B5E20] text-sm">Success</h4>
                            <p className="text-[#555555] text-xs">{success}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full max-w-7xl mx-auto">
                {/* FARMER LANDING VIEW: MY BOOKINGS */}
                {isFarmer && viewMode === 'list' && (
                    <div className="animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#222222] tracking-tight">My Booked Slots</h1>
                                <p className="text-[#555555] mt-1">Manage your upcoming land verification appointments.</p>
                            </div>
                            <button
                                onClick={() => setViewMode('form')}
                                className="px-6 py-3 bg-[#0B3D91] hover:bg-[#092C6B] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 group"
                            >
                                <FaPlus className="text-xs group-hover:rotate-90 transition-transform" /> <span>Book New Slot</span>
                            </button>
                        </div>

                        {myBookings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-[#E0E0E0] shadow-sm flex flex-col items-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#0B3D91] text-3xl mb-4">
                                    <FaCalendarAlt />
                                </div>
                                <h3 className="text-xl font-bold text-[#222222] mb-2">No Slots Booked Yet</h3>
                                <p className="text-[#555555] mb-6 max-w-md">You haven't scheduled any verifications. Book a slot to get your land records verified by an officer.</p>
                                <button
                                    onClick={() => setViewMode('form')}
                                    className="px-8 py-3 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] shadow-md transition-all"
                                >
                                    Book Verification Slot
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myBookings.map(landing => (
                                    <div key={landing._id} className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                        <div className="p-5 border-b border-[#F4F6F9] flex justify-between items-center bg-[#F9FAFB]">
                                            <span className="font-bold text-[#222222] flex items-center gap-2">
                                                Survey: {landing.surveyNumber}
                                            </span>
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${landing.status === 'LAND_APPROVED' ? 'bg-green-100 text-green-800' :
                                                landing.status === 'LAND_REJECTED' ? 'bg-red-100 text-red-800' :
                                                    landing.verificationDocument ? 'bg-purple-100 text-purple-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {landing.status === 'LAND_APPROVED' ? 'Verified & Minted' :
                                                    landing.status === 'LAND_REJECTED' ? 'Rejected' :
                                                        landing.verificationDocument ? 'Pending Admin Approval' :
                                                            'Scheduled (Officer Pending)'}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B3D91] flex items-center justify-center shrink-0">
                                                    <FaUserTie />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#999999] uppercase font-bold">Officer</p>
                                                    <p className="font-bold text-[#222222]">{landing.officerId?.name || 'Officer Not Assigned'}</p>
                                                    <p className="text-xs text-[#555555]">{landing.district} District</p>
                                                </div>
                                            </div>

                                            <div className="bg-[#F4F6F9] p-3 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-[#999999] uppercase font-bold">Date</p>
                                                    <p className="font-bold text-[#0B3D91] flex items-center gap-1">
                                                        <FaCalendarAlt />
                                                        {landing.verificationDate ? new Date(landing.verificationDate).toLocaleDateString() : 'Pending'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-[#999999] uppercase font-bold">Area</p>
                                                    <p className="font-bold text-[#222222]">{landing.area} Ac</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* OFFICER VIEW: LIST (Same as previous but polished containers) */}
                {isOfficer && viewMode === 'list' && (
                    <div className="animate-fadeIn">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-[#222222] tracking-tight">Scheduled Verifications</h1>
                            <p className="text-[#555555]">Manage your assigned field verification appointments.</p>
                        </div>

                        {pendingAppointments.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-[#E0E0E0] shadow-sm">
                                <div className="text-4xl mb-4">📋</div>
                                <h3 className="text-xl font-bold text-[#222222]">No Pending Appointments</h3>
                                <p className="text-[#555555]">Your schedule is clear for now.</p>
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
                                        className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#0B3D91] text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                                            Action Required
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold text-[#222222] mb-1">{land.surveyNumber}</h3>
                                            <p className="text-sm text-[#555555] mb-4 font-medium">{land.ownerName}</p>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-[#555555]">
                                                    <span className="w-8 h-8 rounded-full bg-blue-50 text-[#0B3D91] flex items-center justify-center shrink-0"><FaMapMarkerAlt /></span>
                                                    <span className="line-clamp-1">{land.address}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-[#555555]">
                                                    <span className="w-8 h-8 rounded-full bg-blue-50 text-[#0B3D91] flex items-center justify-center shrink-0"><FaCalendarAlt /></span>
                                                    <span className="font-bold text-[#222222]">
                                                        {land.verificationDate ? new Date(land.verificationDate).toLocaleDateString() : 'Date Not Set'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-[#F4F6F9] flex justify-between items-center">
                                                <span className="text-xs font-bold text-[#999999] uppercase">Status: Pending Verification</span>
                                                <span className="text-xs font-bold text-[#0B3D91] group-hover:underline">Process Now →</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* FORM VIEW Modal */}
                {viewMode === 'form' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn flex flex-col">
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-[#F4F6F9] sticky top-0 bg-white z-10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#222222] tracking-tight">
                                        {isFarmer ? 'Book Verification Slot' : (selectedLandId ? 'Verify Land Record' : 'Add New Land Record')}
                                    </h2>
                                    <p className="text-sm text-[#555555]">
                                        {isFarmer ? 'Complete the steps below to schedule.' : 'Fill in the details to proceed.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setViewMode('list');
                                        if (selectedLandId) resetForm();
                                    }}
                                    className="p-2 bg-[#F4F6F9] hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-[#555555]"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                {/* Officer Search Section */}
                                {isOfficer && !selectedLandId && (
                                    <div className="bg-[#F4F6F9] p-6 rounded-2xl border border-[#E0E0E0]">
                                        <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-3">Find Farmer by Email</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="email"
                                                    value={searchEmail}
                                                    onChange={(e) => setSearchEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all"
                                                    placeholder="farmer@example.com"
                                                />
                                                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleSearchFarmer}
                                                disabled={searchingFarmer}
                                                className="px-6 py-3 bg-[#0B3D91] text-white font-bold rounded-xl hover:bg-[#092C6B] disabled:opacity-50 transition-colors"
                                            >
                                                {searchingFarmer ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>
                                        {verifiedFarmer && (
                                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4 animate-fadeIn">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">👨‍🌾</div>
                                                <div>
                                                    <p className="font-bold text-green-900">{verifiedFarmer.name}</p>
                                                    <p className="text-xs text-green-700 font-medium">{verifiedFarmer.mobile} • {verifiedFarmer.district}</p>
                                                </div>
                                                <FaCheckCircle className="ml-auto text-green-600" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Farmer Step 1: Officer Selection */}
                                {isFarmer && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-[#222222] mb-4 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs">1</span>
                                                Select District & Officer
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-2">District</label>
                                                    <select
                                                        value={formData.district}
                                                        onChange={(e) => {
                                                            const newDistrict = e.target.value;
                                                            setFormData(prev => ({ ...prev, district: newDistrict, officerId: '' }));
                                                            setAvailableSlots([]);
                                                            fetchOfficersInDistrict(newDistrict);
                                                        }}
                                                        className="w-full p-3 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] transition-all font-medium"
                                                    >
                                                        <option value="">-- Select District --</option>
                                                        {TN_DISTRICTS.map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-3">Available Officers</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                                                    {officers.length === 0 ? (
                                                        <div className="col-span-2 text-center py-6 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E0E0E0]">
                                                            <p className="text-sm text-[#999999]">No officers found in {formData.district}.</p>
                                                        </div>
                                                    ) : (
                                                        officers.map(off => (
                                                            <div
                                                                key={off._id}
                                                                onClick={() => handleOfficerChange({ target: { value: off._id } })}
                                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 relative ${formData.officerId === off._id
                                                                    ? 'bg-[#0B3D91] border-[#0B3D91] text-white shadow-md transform scale-[1.02]'
                                                                    : 'bg-white border-[#E0E0E0] text-[#222222] hover:border-[#0B3D91]/50 hover:bg-blue-50'
                                                                    }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 border-2 ${formData.officerId === off._id ? 'bg-white text-[#0B3D91] border-transparent' : 'bg-gray-100 text-[#555555] border-white'
                                                                    }`}>
                                                                    {off.name.charAt(0)}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="font-bold text-sm truncate">{off.name}</p>
                                                                    <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${formData.officerId === off._id ? 'text-blue-200' : 'text-[#999999]'
                                                                        }`}>
                                                                        {off.area || 'General Area'}
                                                                    </p>
                                                                </div>
                                                                {formData.officerId === off._id && <FaCheckCircle className="absolute top-2 right-2 text-white text-xs" />}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2: Date Selection */}
                                        {formData.officerId && (
                                            <div className="animate-fadeIn pt-4 border-t border-[#F4F6F9]">
                                                <h3 className="font-bold text-[#222222] mb-4 flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs">2</span>
                                                    Select Verification Date
                                                </h3>
                                                {slotsLoading ? (
                                                    <div className="flex items-center gap-2 text-[#0B3D91] font-bold">
                                                        <FaSpinner className="animate-spin" /> Loading slots...
                                                    </div>
                                                ) : availableSlots.length === 0 ? (
                                                    <p className="text-sm text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                                                        <FaTimes /> No slots available for this officer currently.
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-3">
                                                        {availableSlots.map(slot => (
                                                            <button
                                                                key={slot.date}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, verificationDate: slot.date })}
                                                                className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center min-w-[90px] ${formData.verificationDate === slot.date
                                                                    ? 'bg-[#0B3D91] text-white border-[#0B3D91] ring-4 ring-[#0B3D91]/20 shadow-lg'
                                                                    : 'bg-white text-[#555555] border-[#E0E0E0] hover:border-[#0B3D91] hover:shadow-md'
                                                                    }`}
                                                            >
                                                                <span className="text-xl leading-none mb-1">{new Date(slot.date).getDate()}</span>
                                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{new Date(slot.date).toLocaleString('default', { month: 'short' })}</span>
                                                                <span className={`text-[9px] mt-2 px-2 py-0.5 rounded-full ${formData.verificationDate === slot.date ? 'bg-white/20 text-white' : 'bg-green-50 text-green-700'
                                                                    }`}>
                                                                    {slot.available} Left
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Land Details Section */}
                                <div className="pt-6 border-t border-[#F4F6F9]">
                                    <h3 className="font-bold text-[#222222] mb-6 flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs ${isFarmer ? 'bg-[#0B3D91]' : 'hidden'}`}>{isFarmer ? '3' : ''}</span>
                                        {isFarmer ? 'Land Details' : 'Land Information'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Owner Name</label>
                                            <input
                                                type="text"
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl font-bold text-[#222222] focus:outline-none"
                                                readOnly={isFarmer || (isOfficer && verifiedFarmer && !selectedLandId)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Survey Number</label>
                                            <input
                                                type="text"
                                                name="surveyNumber"
                                                value={formData.surveyNumber}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/30 focus:border-[#0B3D91] transition-all"
                                                placeholder="e.g. 123/4A"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Area (Acres)</label>
                                            <input
                                                type="number"
                                                name="area"
                                                value={formData.area}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/30 focus:border-[#0B3D91] transition-all"
                                                placeholder="e.g. 2.5"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Land Type</label>
                                            <select
                                                name="landType"
                                                value={formData.landType}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] transition-all"
                                            >
                                                {LAND_TYPES.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Full Address</label>
                                            <textarea
                                                name="address"
                                                required
                                                className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/30 focus:border-[#0B3D91] transition-all min-h-[100px] resize-none"
                                                placeholder="Complete physical address of the land..."
                                                value={formData.address}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Officer Verification Upload */}
                                {isOfficer && selectedLandId && (
                                    <div className="p-6 bg-[#F4F6F9] rounded-2xl border border-dashed border-[#E0E0E0]">
                                        <label className="block text-sm font-bold text-[#222222] mb-3">Upload Verification Report</label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-[#555555] file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0B3D91] file:text-white hover:file:bg-[#092C6B] file:cursor-pointer cursor-pointer"
                                            required
                                        />
                                        <p className="text-xs text-[#999999] mt-2">Upload the signed field inspection report (PDF or Image).</p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-[#F4F6F9]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            isFarmer ? setViewMode('list') : (selectedLandId ? setViewMode('list') : navigate('/dashboard'));
                                            if (selectedLandId) resetForm();
                                        }}
                                        className="flex-1 py-3.5 border border-[#E0E0E0] text-[#555555] font-bold rounded-xl hover:bg-[#F4F6F9] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || (isFarmer && !formData.verificationDate)}
                                        className="flex-[2] py-3.5 bg-[#0B3D91] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#092C6B] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                    >
                                        {loading ? <FaSpinner className="animate-spin" /> : (selectedLandId ? 'Submit Report' : 'Confirm & Book')}
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
