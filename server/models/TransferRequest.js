import mongoose from 'mongoose';

const transferRequestSchema = new mongoose.Schema({
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Land',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Assigned based on Land's district/officer
    },
    saleDeedUrl: {
        type: String, // Uploaded by Seller
        required: true
    },
    verificationDocument: {
        type: String, // Uploaded by Officer
        default: null
    },
    status: {
        type: String,
        enum: [
            'TRANSFER_INITIATED', // Seller created, waiting for Buyer
            'TRANSFER_ACCEPTED',  // Buyer accepted, waiting for Officer
            'TRANSFER_VERIFIED',   // Officer verified, waiting for Admin
            'TRANSFER_COMPLETED',  // Admin approved, Blockchain updated
            'TRANSFER_REJECTED'    // Rejected by anyone
        ],
        default: 'TRANSFER_INITIATED'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    transferHash: {
        type: String, // Blockchain Hash
        default: null
    },
    txHash: {
        type: String, // Blockchain Transaction Hash
        default: null
    }
}, { timestamps: true });

export default mongoose.model('TransferRequest', transferRequestSchema);
