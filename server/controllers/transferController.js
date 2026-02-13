import TransferRequest from '../models/TransferRequest.js';
import Land from '../models/Land.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// 1. Initiate Transfer (Seller)
export const initiateTransfer = async (req, res) => {
    try {
        const { landId, buyerEmail } = req.body;
        const sellerId = req.userId;

        // Verify Land Ownership
        const land = await Land.findOne({ _id: landId, farmerId: sellerId, status: 'LAND_APPROVED' });
        if (!land) {
            return res.status(403).json({ success: false, message: 'You can only transfer your own approved lands.' });
        }

        // Find Buyer
        const buyer = await User.findOne({ email: buyerEmail, role: 'FARMER' });
        if (!buyer) {
            return res.status(404).json({ success: false, message: 'Buyer email not found or not a Farmer.' });
        }

        if (buyer._id.toString() === sellerId) {
            return res.status(400).json({ success: false, message: 'You cannot transfer land to yourself.' });
        }

        // Check for existing pending transfer
        const existingTx = await TransferRequest.findOne({
            landId,
            status: { $in: ['TRANSFER_INITIATED', 'TRANSFER_ACCEPTED', 'TRANSFER_VERIFIED'] }
        });
        if (existingTx) {
            return res.status(400).json({ success: false, message: 'A transfer request is already pending for this land.' });
        }

        // Upload Sale Deed
        let saleDeedUrl = '';
        if (req.files && req.files.saleDeed) {
            const result = await uploadToCloudinary(req.files.saleDeed[0].buffer, req.files.saleDeed[0].originalname);
            saleDeedUrl = result.secure_url;
        } else {
            return res.status(400).json({ success: false, message: 'Sale Deed document is required.' });
        }

        // Create Request
        const finalOfficerId = req.body.officerId || land.officerId;
        console.log(`[Transfer] Initiating. Selected Officer: ${req.body.officerId}, Original Land Officer: ${land.officerId}, Final: ${finalOfficerId}`);

        const newTransfer = new TransferRequest({
            landId,
            sellerId,
            buyerId: buyer._id,
            officerId: finalOfficerId, // Use selected or default
            saleDeedUrl,
            status: 'TRANSFER_INITIATED'
        });

        await newTransfer.save();

        res.status(201).json({ success: true, message: 'Transfer Initiated! Waiting for Buyer Acceptance.', transfer: newTransfer });

    } catch (error) {
        console.error('Initiate Transfer Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate transfer', error: error.message });
    }
};

// 2. Accept Transfer (Buyer)
export const acceptTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const buyerId = req.userId;

        const transfer = await TransferRequest.findOne({ _id: id, buyerId, status: 'TRANSFER_INITIATED' });
        if (!transfer) {
            return res.status(404).json({ success: false, message: 'Transfer request not found or not valid for you.' });
        }

        transfer.status = 'TRANSFER_ACCEPTED';
        await transfer.save();

        res.status(200).json({ success: true, message: 'Transfer Accepted! Sent to Officer for Verification.', transfer });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to accept transfer', error: error.message });
    }
};

// 3. Verify Transfer (Officer)
export const verifyTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const officerId = req.userId;

        const transfer = await TransferRequest.findOne({ _id: id, officerId, status: 'TRANSFER_ACCEPTED' });
        if (!transfer) {
            return res.status(404).json({ success: false, message: 'Transfer request not found or not assigned to you.' });
        }

        // Upload Verification Report
        if (req.files && req.files.verificationDocument) {
            const result = await uploadToCloudinary(req.files.verificationDocument[0].buffer, req.files.verificationDocument[0].originalname);
            transfer.verificationDocument = result.secure_url;
        } else {
            return res.status(400).json({ success: false, message: 'Verification Report is required.' });
        }

        transfer.status = 'TRANSFER_VERIFIED';
        await transfer.save();

        res.status(200).json({ success: true, message: 'Transfer Verified! Sent to Admin for Approval.', transfer });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify transfer', error: error.message });
    }
};

// 4. Approve Transfer (Admin) - Requires Blockchain Hash also 
// 4. Approve Transfer (Admin) - Requires Blockchain Hash also 
export const approveTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason, transferHash, txHash } = req.body;

        const transfer = await TransferRequest.findById(id).populate('landId');
        if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

        if (status === 'TRANSFER_COMPLETED') {
            if (!transferHash || !txHash) {
                return res.status(400).json({ success: false, message: 'Blockchain Hashes are required.' });
            }

            transfer.status = 'TRANSFER_COMPLETED';
            transfer.transferHash = transferHash;
            transfer.txHash = txHash;

            // Update Land Ownership & Hash
            const land = await Land.findById(transfer.landId);
            land.farmerId = transfer.buyerId;

            const buyer = await User.findById(transfer.buyerId);
            land.ownerName = buyer.name;

            // CRITICAL FIX: Update the landHash to match the new Transfer Hash
            // The transferHash is essentially the new landHash
            land.landHash = transferHash;

            await land.save();
            await transfer.save();

            res.status(200).json({ success: true, message: 'Transfer Approved & Executed!', transfer });

        } else {
            res.status(400).json({ success: false, message: 'Invalid Status for Approval endpoint.' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve transfer', error: error.message });
    }
};

// 6. Universal Reject (Buyer, Officer, Admin)
export const rejectTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.userId;
        const role = req.userRole;

        const transfer = await TransferRequest.findById(id);
        if (!transfer) return res.status(404).json({ success: false, message: 'Transfer request not found.' });

        // Authorization & Stage Check
        let authorized = false;

        if (role === 'FARMER' && transfer.buyerId.toString() === userId && transfer.status === 'TRANSFER_INITIATED') {
            authorized = true; // Buyer rejecting invitation
        } else if (role === 'OFFICER' && transfer.officerId.toString() === userId && transfer.status === 'TRANSFER_ACCEPTED') {
            authorized = true; // Officer rejecting verification
        } else if (role === 'ADMIN' && transfer.status === 'TRANSFER_VERIFIED') {
            authorized = true; // Admin rejecting final approval
        }

        if (!authorized) {
            return res.status(403).json({ success: false, message: 'You are not authorized to reject this transfer at this stage.' });
        }

        transfer.status = 'TRANSFER_REJECTED';
        transfer.rejectionReason = reason || 'Rejected';
        await transfer.save();

        res.status(200).json({ success: true, message: 'Transfer Rejected.', transfer });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject transfer', error: error.message });
    }
};

// 5. Get Transfer Requests (Based on Role)
// 5. Get Transfer Requests (Based on Role)
export const getTransferRequests = async (req, res) => {
    try {
        const { userRole, userId } = req; // FIXED: Using userRole
        let query = {}; // Base query for TransferRequest

        if (userRole === 'FARMER') {
            // Show requests where user is Seller OR Buyer
            query = { $or: [{ sellerId: userId }, { buyerId: userId }] };
        } else if (userRole === 'OFFICER') {
            // OFFICER FILTERING: Strict Assignment & Status Check
            // Officer only sees request AFTER Buyer accepts (TRANSFER_ACCEPTED or later)
            query = {
                officerId: userId,
                status: { $ne: 'TRANSFER_INITIATED' }
            };
        } else if (userRole === 'ADMIN') {
            // ADMIN FILTERING: Show only requests verified by Officer (Pending Admin) OR Completed
            // Hiding Rejected/Initiated/Accepted
            query = {
                status: { $in: ['TRANSFER_VERIFIED', 'TRANSFER_COMPLETED'] }
            };
        }

        // For Admin (Show All) or Specific filtering can be added later

        const requests = await TransferRequest.find(query)
            .populate('landId', 'surveyNumber district area')
            .populate('sellerId', 'name email mobile')
            .populate('buyerId', 'name email mobile')
            .populate('officerId', 'name')
            .sort({ createdAt: -1 });

        // Removed manual filtering since it's now in the query

        res.status(200).json({ success: true, requests });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
    }
};


