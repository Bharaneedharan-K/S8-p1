import Land from '../models/Land.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Add new Land Record (Farmer or Officer)
export const addLandRecord = async (req, res) => {
    try {
        const { farmerId, ownerName, surveyNumber, area, district, landType, address, officerId, verificationDate } = req.body;

        // Check if files uploaded (Optional now)
        let documentUrl = null;
        if (req.files && req.files.document) {
            // Upload to Cloudinary
            const cloudinaryResponse = await uploadToCloudinary(req.files.document[0].buffer, req.files.document[0].originalname);
            documentUrl = cloudinaryResponse.secure_url;
        }

        // Check if survey number exists
        const existingLand = await Land.findOne({ surveyNumber });
        if (existingLand) {
            return res.status(409).json({ success: false, message: 'Land with this Survey Number already exists' });
        }

        // Determine Farmer and Officer IDs based on who is submitting
        let finalFarmerId, finalOfficerId;

        if (req.userRole === 'FARMER') {
            finalFarmerId = req.userId;
            finalOfficerId = officerId; // Must be selected by Farmer
            if (!finalOfficerId) return res.status(400).json({ success: false, message: 'Please select an Officer' });

            // Validate Date for Farmer
            if (!verificationDate) return res.status(400).json({ success: false, message: 'Please select a Verification Slot' });

            // Check Slot Availability (Double Check)
            const dateStart = new Date(verificationDate);
            dateStart.setHours(0, 0, 0, 0);
            const dateEnd = new Date(verificationDate);
            dateEnd.setHours(23, 59, 59, 999);

            const count = await Land.countDocuments({
                officerId: finalOfficerId,
                verificationDate: { $gte: dateStart, $lte: dateEnd }
            });

            if (count >= 5) {
                return res.status(400).json({ success: false, message: 'Selected slot is full. Please choose another date.' });
            }

        } else if (req.userRole === 'OFFICER') {
            // Legacy/Admin flow support
            finalOfficerId = req.userId;
            finalFarmerId = farmerId;
            if (!finalFarmerId) return res.status(400).json({ success: false, message: 'Farmer ID is required' });
        } else {
            return res.status(403).json({ success: false, message: 'Unauthorized role' });
        }

        const newLand = new Land({
            farmerId: finalFarmerId,
            officerId: finalOfficerId,
            ownerName,
            surveyNumber,
            area,
            district,
            landType,
            address,
            documentUrl,
            verificationDate: verificationDate || null,
            status: 'LAND_PENDING_ADMIN_APPROVAL'
        });

        await newLand.save();

        res.status(201).json({
            success: true,
            message: 'Land record application submitted successfully!',
            land: newLand
        });

    } catch (error) {
        console.error('Add Land Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add land record', error: error.message });
    }
};

// Get Available Slots (Public or Protected)
export const getAvailableSlots = async (req, res) => {
    try {
        const { officerId } = req.params;
        if (!officerId) return res.status(400).json({ success: false, message: 'Officer ID is required' });

        const slots = [];
        const today = new Date();
        let currentDay = new Date(today);
        currentDay.setDate(today.getDate()); // Start from TODAY

        // Find next 3 business days
        while (slots.length < 3) {
            // Skip Weekend (0=Sun, 6=Sat) - simplified
            const day = currentDay.getDay();
            if (day !== 0 && day !== 6) {
                // Check database count
                const dateStart = new Date(currentDay);
                dateStart.setHours(0, 0, 0, 0);
                const dateEnd = new Date(currentDay);
                dateEnd.setHours(23, 59, 59, 999);

                const count = await Land.countDocuments({
                    officerId,
                    verificationDate: { $gte: dateStart, $lte: dateEnd }
                });

                if (count < 5) {
                    slots.push({
                        date: dateStart.toISOString(),
                        available: 5 - count
                    });
                }
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }

        res.status(200).json({ success: true, slots });

    } catch (error) {
        console.error('Get Slots Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch slots', error: error.message });
    }
};

// Get Pending Lands (Admin/Officer Only)
export const getPendingLands = async (req, res) => {
    try {
        let filter = { status: 'LAND_PENDING_ADMIN_APPROVAL' };

        // If Officer, only show assigned lands
        if (req.userRole === 'OFFICER') {
            filter.officerId = req.userId;
            filter.verificationDocument = null; // Only show where Officer HASN'T uploaded doc yet
        } else if (req.userRole === 'ADMIN') {
            // Admin only sees lands that have been verified by Officer (Document Uploaded)
            filter.verificationDocument = { $ne: null };
        }

        const lands = await Land.find(filter)
            .populate('farmerId', 'name email mobile')
            .populate('officerId', 'name email district');

        res.status(200).json({
            success: true,
            count: lands.length,
            lands
        });
    } catch (error) {
        console.error('Get Pending Lands Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending lands', error: error.message });
    }
};

// Verify/Approve Land (Admin/Officer) -> Updates Status & Hash
export const verifyLandRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, landHash, txHash, rejectionReason } = req.body;

        // Security Check: Verify User has permission for THIS specific land
        const existingLand = await Land.findById(id);
        if (!existingLand) return res.status(404).json({ success: false, message: 'Land record not found' });

        if (req.userRole === 'OFFICER') {
            if (existingLand.officerId.toString() !== req.userId) {
                return res.status(403).json({ success: false, message: 'You are not authorized to verify this land record.' });
            }
        }

        const updateData = { status };

        // Handle Verification Report Upload
        if (req.files && req.files.verificationDocument) {
            const result = await uploadToCloudinary(req.files.verificationDocument[0].buffer, req.files.verificationDocument[0].originalname);
            updateData.verificationDocument = result.secure_url;
        }

        if (status === 'LAND_APPROVED') {
            if (!landHash || !txHash) {
                return res.status(400).json({ success: false, message: 'Land Hash and Transaction Hash are required for approval' });
            }
            updateData.landHash = landHash;
            updateData.txHash = txHash;
            updateData.blockchainTimestamp = new Date();
        } else if (status === 'LAND_REJECTED') {
            updateData.rejectionReason = rejectionReason || 'Rejected by Officer';
        }

        const land = await Land.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!land) {
            return res.status(404).json({ success: false, message: 'Land record not found' });
        }

        res.status(200).json({
            success: true,
            message: `Land record ${status === 'LAND_APPROVED' ? 'approved & minted' : 'rejected'} successfully`,
            land
        });

    } catch (error) {
        console.error('Verify Land Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update land status', error: error.message });
    }
};

// Get All Lands (Public/Admin/Officer)
export const getAllLands = async (req, res) => {
    try {
        const { status, farmerId } = req.query;
        let filter = {};

        if (status) filter.status = status;
        if (farmerId) filter.farmerId = farmerId;

        // Farmer can only see their own lands
        if (req.userRole === 'FARMER') {
            filter.farmerId = req.userId;
        } else if (req.userRole === 'OFFICER') {
            filter.officerId = req.userId;
        }

        const lands = await Land.find(filter)
            .populate('farmerId', 'name mobile')
            .populate('officerId', 'name mobile district') // Added officer population
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: lands.length, lands });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch lands', error: error.message });
    }
};

// Public: Verify Land by Hash
export const getLandByHash = async (req, res) => {
    try {
        const { hash } = req.params;
        const land = await Land.findOne({ landHash: hash })
            .populate('farmerId', 'name')
            .select('ownerName surveyNumber area district status landHash txHash createdAt address');

        if (!land) {
            return res.status(404).json({ success: false, message: 'Invalid Hash: Record not found in registry.' });
        }

        res.status(200).json({
            success: true,
            message: 'Land Record Verified Successfully',
            land
        });
    } catch (error) {
        console.error('Verify Hash Error:', error);
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
};

// Public: Get Land by Survey Number (For recalculation check)
export const getLandBySurveyNumber = async (req, res) => {
    try {
        const { surveyNumber } = req.params;
        const land = await Land.findOne({ surveyNumber, status: 'LAND_APPROVED' })
            .select('ownerName surveyNumber area district address status landHash txHash createdAt _id');

        if (!land) {
            return res.status(404).json({ success: false, message: 'Survey Number not found or not yet approved.' });
        }

        res.status(200).json({
            success: true,
            land
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
    }
};
// Dev: Reset Land Status (To fix Blockchain Reset issues)
export const resetLandStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const land = await Land.findByIdAndUpdate(
            id,
            {
                status: 'LAND_PENDING_ADMIN_APPROVAL',
                landHash: null,
                txHash: null,
                verificationDocument: null // Optional: keep or clear based on pref. Clearing to force re-verify.
            },
            { new: true }
        );

        if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

        res.status(200).json({ success: true, message: 'Land status reset successfully. You can now re-verify it.', land });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Reset failed', error: error.message });
    }
};
