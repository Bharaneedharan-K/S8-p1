import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LAND_TYPES } from '../utils/constants';

export const ManageSchemesPage = () => {
    const { token } = useContext(AuthContext);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        schemeCode: '', schemeName: '', description: '', eligibilityText: '',
        minLandArea: '', maxLandArea: '', allowedLandTypes: [], allowedDistricts: '',
        benefitAmount: '', startDate: '', endDate: '', status: 'ACTIVE'
    });

    const fetchSchemes = async () => {
        try {
            const res = await apiClient.get('/schemes');
            setSchemes(res.data.schemes);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSchemes(); }, [token]);

    const [editingId, setEditingId] = useState(null);

    const resetForm = () => {
        setFormData({
            schemeCode: '', schemeName: '', description: '', eligibilityText: '',
            minLandArea: '', maxLandArea: '', allowedLandTypes: [], allowedDistricts: '',
            benefitAmount: '', startDate: '', endDate: '', status: 'ACTIVE'
        });
        setEditingId(null);
    };

    const handleCreateClick = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (scheme) => {
        setEditingId(scheme._id);
        const landTypes = Array.isArray(scheme.allowedLandTypes) ? scheme.allowedLandTypes : [];
        const districts = Array.isArray(scheme.allowedDistricts) ? scheme.allowedDistricts : [];

        setFormData({
            schemeCode: scheme.schemeCode,
            schemeName: scheme.schemeName,
            description: scheme.description,
            eligibilityText: scheme.eligibilityText,
            minLandArea: scheme.minLandArea,
            maxLandArea: scheme.maxLandArea || '',
            allowedLandTypes: landTypes,
            allowedDistricts: districts.join(', '), // Convert back to string for input
            benefitAmount: scheme.benefitAmount,
            startDate: scheme.startDate ? new Date(scheme.startDate).toISOString().split('T')[0] : '',
            endDate: scheme.endDate ? new Date(scheme.endDate).toISOString().split('T')[0] : '',
            status: scheme.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert inputs
            const payload = {
                ...formData,
                allowedLandTypes: formData.allowedLandTypes,
                allowedDistricts: typeof formData.allowedDistricts === 'string'
                    ? formData.allowedDistricts.split(',').map(s => s.trim()).filter(s => s)
                    : []
            };

            if (editingId) {
                // Update
                await apiClient.put(`/schemes/${editingId}`, payload);
                alert('Scheme Updated Successfully!');
            } else {
                // Create
                await apiClient.post('/schemes', payload);
                alert('Scheme Created Successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchSchemes();
        } catch (err) {
            console.error(err);
            alert('Failed to save scheme. Check inputs.');
        }
    };

    const handleToggleStatus = async (scheme) => {
        try {
            const newStatus = scheme.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await apiClient.put(`/schemes/${scheme._id}`,
                { status: newStatus }
            );
            fetchSchemes();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="min-h-screen bg-[#F2F5E6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#2C3318]">Manage Schemes</h1>
                    <button
                        onClick={handleCreateClick}
                        className="px-6 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] shadow-lg"
                    >
                        + Create Scheme
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#AEB877]/20 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#FFFBB1]">
                            <tr>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Code</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Name</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Status</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Start Date</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Benefit</th>
                                <th className="px-6 py-4 text-[#4A5532] text-xs font-bold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#AEB877]/10">
                            {schemes.map(s => (
                                <tr key={s._id} className="hover:bg-[#F2F5E6]/30">
                                    <td className="px-6 py-4 font-mono font-bold text-[#2C3318]">{s.schemeCode}</td>
                                    <td className="px-6 py-4">{s.schemeName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#5C6642]">{new Date(s.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-[#2C3318]">₹{s.benefitAmount}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(s)}
                                            className="px-3 py-1 rounded-lg text-xs font-bold border border-[#AEB877] text-[#4A5532] hover:bg-[#FFFBB1]"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(s)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${s.status === 'ACTIVE'
                                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                : 'border-green-200 text-green-700 hover:bg-green-50'
                                                }`}
                                        >
                                            {s.status === 'ACTIVE' ? '🛑 Deactivate' : '✅ Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                            {/* Fixed Header */}
                            <div className="p-6 border-b border-[#AEB877]/10 flex justify-between items-center shrink-0 bg-white rounded-t-2xl z-10">
                                <h3 className="text-xl font-bold text-[#2C3318]">{editingId ? 'Edit Scheme' : 'Create New Scheme'}</h3>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#5C6642] transition-colors">✕</button>
                            </div>

                            {/* Scrollable Form Body */}
                            <div className="overflow-y-auto p-6 customized-scrollbar">
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Scheme Code</label>
                                        <input name="schemeCode" placeholder="e.g. PM-KISAN" required onChange={handleChange} value={formData.schemeCode} className="input-modern" readOnly={!!editingId} // Prevent editing code
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Scheme Name</label>
                                        <input name="schemeName" placeholder="Enter full name" required onChange={handleChange} value={formData.schemeName} className="input-modern" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Description</label>
                                        <textarea name="description" placeholder="Brief description of the scheme..." required onChange={handleChange} value={formData.description} className="input-modern h-24 resize-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Eligibility Criteria</label>
                                        <textarea name="eligibilityText" placeholder="Who can apply?" required onChange={handleChange} value={formData.eligibilityText} className="input-modern h-24 resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Min Land Area (Acres)</label>
                                        <input type="number" name="minLandArea" placeholder="0.00" onChange={handleChange} value={formData.minLandArea} className="input-modern" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Benefit Amount (₹)</label>
                                        <input type="number" name="benefitAmount" placeholder="0.00" onChange={handleChange} value={formData.benefitAmount} className="input-modern" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-bold text-[#2C3318] mb-2">Allowed Land Types</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {LAND_TYPES.map(type => (
                                                <label key={type} className="flex items-center gap-2 p-3 border border-[#AEB877]/20 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        value={type}
                                                        checked={formData.allowedLandTypes?.includes(type)}
                                                        onChange={(e) => {
                                                            const { value, checked } = e.target;
                                                            let current = formData.allowedLandTypes || [];
                                                            if (typeof current === 'string') current = current.split(',').map(s => s.trim());
                                                            if (checked) {
                                                                setFormData(prev => ({ ...prev, allowedLandTypes: [...current, value] }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, allowedLandTypes: current.filter(t => t !== value) }));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-[#2C3318] rounded focus:ring-[#AEB877]"
                                                    />
                                                    <span className="text-sm text-[#5C6642] font-medium">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Allowed Districts</label>
                                        <input name="allowedDistricts" placeholder="Leave empty for all districts" onChange={handleChange} value={formData.allowedDistricts} className="input-modern" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">Start Date</label>
                                        <input type="date" name="startDate" required onChange={handleChange} value={formData.startDate} className="input-modern" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-bold text-[#2C3318] mb-1">End Date (Optional)</label>
                                        <input type="date" name="endDate" onChange={handleChange} value={formData.endDate} className="input-modern" />
                                    </div>

                                    <div className="col-span-2 pt-4 flex gap-4 sticky bottom-0 bg-white pb-2">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#2C3318] text-white font-bold rounded-xl hover:bg-[#4A5532] shadow-lg transition-colors">
                                            {editingId ? 'Update Scheme' : 'Create Scheme'}
                                        </button>
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
