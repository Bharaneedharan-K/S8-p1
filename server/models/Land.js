import mongoose from 'mongoose';

const landSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        officerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ownerName: {
            type: String,
            required: true,
        },
        surveyNumber: {
            type: String,
            required: true,
            unique: true,
        },
        area: {
            type: Number,
            required: true, // In Acres or Hectares
        },
        district: {
            type: String,
            required: true,
        },
        landType: {
            type: String,
            required: true, // e.g., Agricultural, Commercial
        },
        address: {
            type: String,
            required: true,
        },
        documentUrl: {
            type: String,
            required: false, // Cloudinary URL (Optional for Book Slot)
        },
        verificationDate: {
            type: Date,
            default: null,
        },
        verificationDocument: {
            type: String, // Cloudinary URL for Officer's report
            default: null,
        },
        status: {
            type: String,
            enum: ['LAND_PENDING_ADMIN_APPROVAL', 'LAND_APPROVED', 'LAND_REJECTED'],
            default: 'LAND_PENDING_ADMIN_APPROVAL',
        },
        landHash: {
            type: String, // SHA256 Hash of critical data
            default: null,
        },
        txHash: {
            type: String, // Blockchain Transaction Hash
            default: null,
        },
        blockchainTimestamp: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Land', landSchema);
