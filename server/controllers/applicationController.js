import SchemeApplication from '../models/SchemeApplication.js';
import Scheme from '../models/Scheme.js';
import Land from '../models/Land.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Farmer: Apply for Scheme
export const applyForScheme = async (req, res) => {
    try {
        const { schemeId, landId } = req.body;

        // 1. Verify Scheme exists and is active
        const scheme = await Scheme.findById(schemeId);
        if (!scheme || scheme.status !== 'ACTIVE') {
            return res.status(404).json({ success: false, message: 'Scheme not active or not found' });
        }

        // 2. Verify Land exists, belongs to farmer, and is approved
        const land = await Land.findOne({ _id: landId, farmerId: req.userId, status: 'LAND_APPROVED' });
        if (!land) {
            return res.status(400).json({ success: false, message: 'Invalid Land: Must be your Approved Land.' });
        }

        // 3. Validation: Land Area
        if (scheme.minLandArea && land.area < scheme.minLandArea) {
            return res.status(400).json({ success: false, message: `Land area ${land.area} is less than required ${scheme.minLandArea}` });
        }
        if (scheme.maxLandArea && land.area > scheme.maxLandArea) {
            return res.status(400).json({ success: false, message: `Land area ${land.area} exceeds limit ${scheme.maxLandArea}` });
        }

        // 4. Validation: Land Type
        if (scheme.allowedLandTypes && scheme.allowedLandTypes.length > 0) {
            // Case insensitive check could be better, but strict for now
            if (!scheme.allowedLandTypes.includes(land.landType)) {
                return res.status(400).json({ success: false, message: `Land Type '${land.landType}' not eligible for this scheme.` });
            }
        }

        // 5. Validation: District
        if (scheme.allowedDistricts && scheme.allowedDistricts.length > 0) {
            if (!scheme.allowedDistricts.includes(land.district)) {
                return res.status(400).json({ success: false, message: `District '${land.district}' not eligible for this scheme.` });
            }
        }

        // 6. Handle Documents Upload
        let documentUrls = [];
        if (req.files && req.files.documents) {
            const uploadPromises = req.files.documents.map(file =>
                uploadToCloudinary(file.buffer, file.originalname).then(res => res.secure_url)
            );
            documentUrls = await Promise.all(uploadPromises);
        }

        // 7. Check for duplicate application
        const existingApp = await SchemeApplication.findOne({ schemeId, landId });
        if (existingApp) {
            return res.status(409).json({ success: false, message: 'Application already submitted for this land and scheme.' });
        }

        // Create Application
        const application = new SchemeApplication({
            farmerId: req.userId,
            schemeId,
            landId,
            district: land.district,
            documents: documentUrls,
            status: 'PENDING'
        });

        await application.save();
        res.status(201).json({ success: true, message: 'Application submitted successfully!', application });

    } catch (error) {
        console.error("Apply Error", error);
        res.status(500).json({ success: false, message: 'Application failed', error: error.message });
    }
};

// Farmer: Get My Applications
export const getMyApplications = async (req, res) => {
    try {
        const applications = await SchemeApplication.find({ farmerId: req.userId })
            .populate('schemeId', 'schemeName benefitAmount schemeCode schemeType fundingPattern')
            .populate('landId', 'surveyNumber area district landType')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: applications.length, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetching applications failed', error: error.message });
    }
};

// Admin: Get All Applications (with filtering)
export const getAllApplications = async (req, res) => {
    try {
        const { status, schemeId, district } = req.query;
        let filter = {};
        if (status && status !== 'ALL') filter.status = status;
        if (schemeId) filter.schemeId = schemeId;
        if (district) filter.district = district;

        const applications = await SchemeApplication.find(filter)
            .populate('farmerId', 'name mobile')
            .populate('schemeId', 'schemeName')
            .populate('landId', 'surveyNumber area district')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: applications.length, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetching applications failed', error: error.message });
    }
};

// Admin: Review Application
export const reviewApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminRemarks } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid Status' });
        }
        if (status === 'REJECTED' && !adminRemarks) {
            return res.status(400).json({ success: false, message: 'Remarks required for rejection' });
        }

        const application = await SchemeApplication.findByIdAndUpdate(
            id,
            {
                status,
                adminRemarks,
                reviewedBy: req.userId,
                reviewedAt: new Date()
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({ success: true, message: `Application ${status}`, application });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Review failed', error: error.message });
    }
};
