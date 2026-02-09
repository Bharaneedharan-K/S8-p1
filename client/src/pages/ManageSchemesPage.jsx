import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaChartLine, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaFilter, FaPowerOff } from 'react-icons/fa';

export const ManageSchemesPage = () => {
    const { token } = useContext(AuthContext);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Form State
    const [formData, setFormData] = useState({
        schemeCode: '', schemeName: '', description: '', eligibilityText: '',
        minLandArea: '', maxLandArea: '', allowedLandTypes: [], allowedDistricts: '',
        benefitAmount: '', startDate: '', endDate: '', status: 'ACTIVE',
        schemeType: 'STATE', fundingPattern: '100% State', documentsRequired: [],
        applicationProcess: '', casteEligibility: ['ANY'], genderEligibility: 'ANY',
        ageMin: 18, ageMax: 100
    });

    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/schemes');
            const schemesList = res.data.schemes || [];
            setSchemes(Array.isArray(schemesList) ? schemesList : []);
        } catch (error) {
            console.error('Error fetching schemes:', error);
            setMessage({ text: 'Failed to load schemes.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateClick = () => {
        setEditingId(null);
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            schemeCode: '', schemeName: '', description: '', eligibilityText: '',
            minLandArea: '', maxLandArea: '', allowedLandTypes: [], allowedDistricts: '',
            benefitAmount: '', startDate: '', endDate: '', status: 'ACTIVE',
            schemeType: 'STATE', fundingPattern: '100% State', documentsRequired: [],
            applicationProcess: '', casteEligibility: ['ANY'], genderEligibility: 'ANY',
            ageMin: 18, ageMax: 100
        });
    };

    const handleEdit = (scheme) => {
        setEditingId(scheme._id);
        const districts = Array.isArray(scheme.allowedDistricts) ? scheme.allowedDistricts.join(', ') : '';
        const docs = Array.isArray(scheme.documentsRequired) ? scheme.documentsRequired.join(', ') : '';
        const caste = Array.isArray(scheme.casteEligibility) ? scheme.casteEligibility : ['ANY'];

        setFormData({
            schemeCode: scheme.schemeCode,
            schemeName: scheme.schemeName,
            description: scheme.description,
            eligibilityText: scheme.eligibilityText,
            minLandArea: scheme.minLandArea,
            maxLandArea: scheme.maxLandArea || '',
            allowedLandTypes: scheme.allowedLandTypes || [],
            allowedDistricts: districts,
            benefitAmount: scheme.benefitAmount,
            startDate: scheme.startDate ? new Date(scheme.startDate).toISOString().split('T')[0] : '',
            endDate: scheme.endDate ? new Date(scheme.endDate).toISOString().split('T')[0] : '',
            status: scheme.status,
            schemeType: scheme.schemeType || 'STATE',
            fundingPattern: scheme.fundingPattern || '100% State',
            documentsRequired: docs,
            applicationProcess: scheme.applicationProcess || '',
            casteEligibility: caste,
            genderEligibility: scheme.genderEligibility || 'ANY',
            ageMin: scheme.ageLimit?.min || 18,
            ageMax: scheme.ageLimit?.max || 100
        });
        setShowModal(true);
    };

    const handleToggleStatus = async (scheme) => {
        try {
            const newStatus = scheme.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await apiClient.put(`/schemes/${scheme._id}`, { status: newStatus });
            fetchSchemes();
            setMessage({ text: `Scheme ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ text: 'Failed to update status.', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                allowedDistricts: typeof formData.allowedDistricts === 'string'
                    ? formData.allowedDistricts.split(',').map(s => s.trim()).filter(s => s)
                    : [],
                documentsRequired: typeof formData.documentsRequired === 'string'
                    ? formData.documentsRequired.split(',').map(s => s.trim()).filter(s => s)
                    : formData.documentsRequired,
                ageLimit: { min: Number(formData.ageMin), max: Number(formData.ageMax) },
                benefitAmount: Number(formData.benefitAmount),
                minLandArea: Number(formData.minLandArea),
                maxLandArea: formData.maxLandArea ? Number(formData.maxLandArea) : null
            };

            if (editingId) {
                await apiClient.put(`/schemes/${editingId}`, payload);
                setMessage({ text: 'Scheme updated successfully!', type: 'success' });
            } else {
                await apiClient.post('/schemes', payload);
                setMessage({ text: 'Scheme created successfully!', type: 'success' });
            }
            setShowModal(false);
            fetchSchemes();
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Failed to save scheme.';
            setMessage({ text: errorMsg, type: 'error' });
        }
    };

    // Filter logic
    const filteredSchemes = schemes.filter(s => statusFilter === 'ALL' || s.status === statusFilter);

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8 relative">
            {/* Toast */}
            {message.text && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all ${message.type === 'success' ? 'bg-[#2C3318] text-[#D8E983]' : 'bg-red-100 text-red-800'
                    }`}>
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3318]">Manage Schemes</h1>
                        <p className="text-[#5C6642]">Create and manage government subsidy schemes.</p>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-[#AEB877]/30 text-[#2C3318] font-bold rounded-xl px-4 py-3 focus:outline-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="INACTIVE">Inactive Only</option>
                        </select>
                        <button onClick={handleCreateClick} className="px-6 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] shadow-lg flex items-center gap-2">
                            <FaPlus /> Create Scheme
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#AEB877]/20 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#FFFBB1]">
                            <tr>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Code</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Name</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Type</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Status</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Benefit</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#AEB877]/10">
                            {filteredSchemes.map(s => (
                                <tr key={s._id} className="hover:bg-[#F2F5E6]/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-[#2C3318]">{s.schemeCode}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-[#2C3318]">{s.schemeName}</div>
                                        <div className="text-xs text-[#5C6642]">{(s.description || '').substring(0, 40)}...</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${s.schemeType === 'CENTRAL' ? 'bg-orange-100 text-orange-800' :
                                            s.schemeType === 'STATE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {s.schemeType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {s.status === 'ACTIVE' ? <FaCheck size={10} /> : <FaTimes size={10} />} {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#2C3318]">₹{s.benefitAmount}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleEdit(s)} className="px-4 py-2 text-xs font-bold text-[#5C6642] bg-[#F2F5E6] rounded-lg hover:bg-[#AEB877] hover:text-[#2C3318] transition-colors">
                                            Edit
                                        </button>
                                        <button onClick={() => handleToggleStatus(s)} className={`px-4 py-2 rounded-lg border text-xs font-bold transition-colors ${s.status === 'ACTIVE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                                            {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSchemes.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-[#9CA385] italic">No schemes found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-[#AEB877]/10 flex justify-between items-center bg-[#2C3318] text-white rounded-t-2xl">
                                <h3 className="text-xl font-bold">{editingId ? 'Edit Scheme Details' : 'Create New Government Scheme'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-2xl hover:text-[#AEB877] transition-colors">×</button>
                            </div>

                            <div className="overflow-y-auto p-8 customized-scrollbar bg-[#FAFAF5]">
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Core Details */}
                                    <div className="col-span-1 md:col-span-2 border-b border-[#AEB877]/20 pb-2 mb-2">
                                        <h4 className="text-[#AEB877] font-bold uppercase tracking-widest text-xs">Core Information</h4>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Scheme Code</label>
                                        <input name="schemeCode" placeholder="PM-KISAN" required onChange={handleChange} value={formData.schemeCode} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877] font-mono" readOnly={!!editingId} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Scheme Name</label>
                                        <input name="schemeName" placeholder="Scheme Name" required onChange={handleChange} value={formData.schemeName} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877]" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Scheme Type</label>
                                        <select name="schemeType" onChange={handleChange} value={formData.schemeType} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877]">
                                            <option value="STATE">State Scheme</option>
                                            <option value="CENTRAL">Central Scheme</option>
                                            <option value="JOINT">Joint (State + Central)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Benefit Amount (₹)</label>
                                        <input type="number" name="benefitAmount" placeholder="6000" onChange={handleChange} value={formData.benefitAmount} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877]" />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Description</label>
                                        <textarea name="description" placeholder="Scheme description..." required onChange={handleChange} value={formData.description} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877] h-24" />
                                    </div>

                                    {/* Criteria */}
                                    <div className="col-span-1 md:col-span-2 border-b border-[#AEB877]/20 pb-2 mb-2 mt-4">
                                        <h4 className="text-[#AEB877] font-bold uppercase tracking-widest text-xs">Eligibility & Requirements</h4>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Gender Eligibility</label>
                                        <select name="genderEligibility" onChange={handleChange} value={formData.genderEligibility} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877]">
                                            <option value="ANY">Any Gender</option>
                                            <option value="MALE">Male Only</option>
                                            <option value="FEMALE">Female Only</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Min Age</label>
                                            <input type="number" name="ageMin" onChange={handleChange} value={formData.ageMin} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Max Age</label>
                                            <input type="number" name="ageMax" onChange={handleChange} value={formData.ageMax} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Human Readable Eligibility Criteria (Required)</label>
                                        <textarea name="eligibilityText" placeholder="e.g. Small and marginal farmers with land up to 2 hectares..." required onChange={handleChange} value={formData.eligibilityText} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877] h-24" />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Caste Eligibility</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {['ANY', 'SC', 'ST', 'OBC', 'General'].map(caste => (
                                                <label key={caste} className={`cursor-pointer px-3 py-2 rounded-lg border text-sm font-bold transition-all ${formData.casteEligibility.includes(caste)
                                                    ? 'bg-[#AEB877] text-white border-[#AEB877]'
                                                    : 'bg-white text-[#5C6642] border-[#AEB877]/30 hover:bg-[#F2F5E6]'
                                                    }`}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.casteEligibility.includes(caste)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setFormData(prev => {
                                                                let current = [...prev.casteEligibility];
                                                                if (checked) current.push(caste);
                                                                else current = current.filter(c => c !== caste);
                                                                return { ...prev, casteEligibility: current };
                                                            });
                                                        }}
                                                    />
                                                    {caste}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Docs & Process */}
                                    <div className="col-span-1 md:col-span-2 border-b border-[#AEB877]/20 pb-2 mb-2 mt-4">
                                        <h4 className="text-[#AEB877] font-bold uppercase tracking-widest text-xs">Process & Details</h4>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Documents Required (Comma Separated)</label>
                                        <input name="documentsRequired" placeholder="e.g. Aadhar Card, Land Record" onChange={handleChange} value={formData.documentsRequired} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877]" />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Application Process</label>
                                        <textarea name="applicationProcess" placeholder="Step-by-step instructions..." onChange={handleChange} value={formData.applicationProcess} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AEB877] h-20" />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">Start Date</label>
                                            <input type="date" name="startDate" required onChange={handleChange} value={formData.startDate} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-[#4A5532] uppercase mb-1">End Date</label>
                                            <input type="date" name="endDate" onChange={handleChange} value={formData.endDate} className="w-full p-3 bg-white border border-[#E2E6D5] rounded-xl" />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 md:col-span-2 flex gap-4 pt-6 mt-4 border-t border-[#AEB877]/10">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] transition-colors shadow-lg">Save Scheme</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
