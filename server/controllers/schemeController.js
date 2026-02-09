import Scheme from '../models/Scheme.js';

// Admin: Create Scheme
export const createScheme = async (req, res) => {
    try {
        console.log('📝 Creating Scheme, Body:', req.body);
        console.log('👤 User ID:', req.userId);

        const {
            schemeCode, schemeName, description, eligibilityText,
            minLandArea, maxLandArea, allowedLandTypes, allowedDistricts,
            benefitAmount, startDate, endDate, status,
            schemeType, fundingPattern, documentsRequired, applicationProcess,
            casteEligibility, genderEligibility, ageMin, ageMax
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

            // New Fields
            schemeType: schemeType || 'STATE',
            fundingPattern: fundingPattern || '100% State',
            documentsRequired: Array.isArray(documentsRequired) ? documentsRequired : [],
            applicationProcess: applicationProcess || 'Online',
            casteEligibility: Array.isArray(casteEligibility) ? casteEligibility : ['ANY'],
            genderEligibility: genderEligibility || 'ANY',
            ageLimit: {
                min: Number(ageMin) || 18,
                max: Number(ageMax) || 100
            },
            createdBy: req.userId
        };

        const scheme = new Scheme(schemeData);

        await scheme.save();
        console.log('✅ Scheme Created:', scheme._id);
        res.status(201).json({ success: true, message: 'Scheme created successfully', scheme });

    } catch (error) {
        console.error('❌ Create Scheme Fail:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: 'Validation Error: ' + messages.join(', ') });
        }

        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Scheme Code already exists' });
        }

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
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Scheme Code already exists' });
        }
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// Farmer: Get Active Schemes
export const getActiveSchemes = async (req, res) => {
    try {
        const today = new Date();
        const schemes = await Scheme.find({
            status: 'ACTIVE'
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: schemes.length, schemes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetching active schemes failed', error: error.message });
    }
};
