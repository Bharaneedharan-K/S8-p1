import Land from '../models/Land.js';
import User from '../models/User.js';
import cloudinary from '../utils/cloudinary.js';

// Add new Land Record (Officer Only)
export const addLandRecord = async (req, res) => {
    try {
        const { farmerId, ownerName, surveyNumber, area, district, landType, address } = req.body;

        // Check if files uploaded
        if (!req.files || !req.files.document) {
            return res.status(400).json({ success: false, message: 'Land document is required' });
        }

        // Upload to Cloudinary
        const fileBuffer = req.files.document[0].buffer;
        // Basic base64 conversion for Cloudinary upload (simplified)
        const base64Image = Buffer.from(fileBuffer).toString('base64');
        const dataURI = `data:${req.files.document[0].mimetype};base64,${base64Image}`;

        // Assume cloudinary is imported, need to add import
        // Create upload options
        const uploadOptions = {
            folder: 'land_records',
            resource_type: 'auto'
        };

        // For PDFs, use 'raw' resource type to prevent image conversion issues
        if (req.files.document[0].mimetype === 'application/pdf') {
            uploadOptions.resource_type = 'raw';
        }

        // If cloudinary util exports the v2 instance directly:
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, uploadOptions);

        const documentUrl = cloudinaryResponse.secure_url;

        // Check if survey number exists
        const existingLand = await Land.findOne({ surveyNumber });
        if (existingLand) {
            return res.status(409).json({ success: false, message: 'Land with this Survey Number already exists' });
        }

        // Verify Farmer exists
        const farmer = await User.findById(farmerId);
        if (!farmer || farmer.role !== 'FARMER') {
            return res.status(404).json({ success: false, message: 'Invalid Farmer ID' });
        }

        const newLand = new Land({
            farmerId,
            officerId: req.userId, // From Auth Middleware
            ownerName,
            surveyNumber,
            area,
            district,
            landType,
            address,
            documentUrl,
            status: 'LAND_PENDING_ADMIN_APPROVAL'
        });

        await newLand.save();

        res.status(201).json({
            success: true,
            message: 'Land record added successfully! Sent for Admin Approval.',
            land: newLand
        });

    } catch (error) {
        console.error('Add Land Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add land record', error: error.message });
    }
};

// Get Pending Lands (Admin Only)
export const getPendingLands = async (req, res) => {
    try {
        const lands = await Land.find({ status: 'LAND_PENDING_ADMIN_APPROVAL' })
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

// Verify/Approve Land (Admin Only) -> Updates Status & Hash
export const verifyLandRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, landHash, txHash, rejectionReason } = req.body;

        // If Approving, Hash and TxHash are required
        if (status === 'LAND_APPROVED' && (!landHash || !txHash)) {
            return res.status(400).json({ success: false, message: 'Land Hash and Transaction Hash are required for approval' });
        }

        const updateData = { status };
        if (status === 'LAND_APPROVED') {
            updateData.landHash = landHash;
            updateData.txHash = txHash;
            updateData.blockchainTimestamp = new Date();
        } else if (status === 'LAND_REJECTED') {
            updateData.rejectionReason = rejectionReason || 'Rejected by Admin';
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
        }

        const lands = await Land.find(filter)
            .populate('farmerId', 'name mobile')
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
            .select('ownerName surveyNumber area district status landHash txHash createdAt');

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
