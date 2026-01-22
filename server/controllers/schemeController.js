import Scheme from '../models/Scheme.js';

// Admin: Create Scheme
export const createScheme = async (req, res) => {
    try {
        console.log('📝 Creating Scheme, Body:', req.body);
        console.log('👤 User ID:', req.userId);

        const {
            schemeCode, schemeName, description, eligibilityText,
            minLandArea, maxLandArea, allowedLandTypes, allowedDistricts,
            benefitAmount, startDate, endDate, status
        } = req.body;

        if (!startDate) {
            return res.status(400).json({ success: false, message: 'Start Date is required' });
        }

        const exists = await Scheme.findOne({ schemeCode });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Scheme Code already exists' });
        }

        // Sanitize input
        const schemeData = {
            schemeCode,
            schemeName,
            description,
            eligibilityText,
            minLandArea: Number(minLandArea) || 0,
            maxLandArea: maxLandArea ? Number(maxLandArea) : null,
            allowedLandTypes: Array.isArray(allowedLandTypes) ? allowedLandTypes : [],
            allowedDistricts: Array.isArray(allowedDistricts) ? allowedDistricts : [],
            benefitAmount: Number(benefitAmount) || 0,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            status: status || 'ACTIVE',
            createdBy: req.userId
        };

        const scheme = new Scheme(schemeData);

        await scheme.save();
        console.log('✅ Scheme Created:', scheme._id);
        res.status(201).json({ success: true, message: 'Scheme created successfully', scheme });

    } catch (error) {
        console.error('❌ Create Scheme Fail:', error);
        res.status(500).json({ success: false, message: 'Creating scheme failed', error: error.message });
    }
};

// Admin: Get All Schemes
export const getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: schemes.length, schemes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetching schemes failed', error: error.message });
    }
};

// Admin: Update Scheme
export const updateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const scheme = await Scheme.findByIdAndUpdate(id, req.body, { new: true });

        if (!scheme) {
            return res.status(404).json({ success: false, message: 'Scheme not found' });
        }

        res.status(200).json({ success: true, message: 'Scheme updated', scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// Farmer: Get Active Schemes
export const getActiveSchemes = async (req, res) => {
    try {
        const today = new Date();
        const schemes = await Scheme.find({
            status: 'ACTIVE',
            // Only show schemes that started and haven't expired
            startDate: { $lte: today },
            $or: [{ endDate: null }, { endDate: { $gte: today } }]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: schemes.length, schemes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetching active schemes failed', error: error.message });
    }
};
