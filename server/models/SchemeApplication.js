import mongoose from 'mongoose';

const schemeApplicationSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        schemeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scheme',
            required: true
        },
        landId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Land',
            required: true
        },
        district: {
            type: String,
            required: true
        },
        documents: {
            type: [String],
            default: []
        },
        applicationDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        adminRemarks: {
            type: String,
            default: null
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate applications for the same land and scheme
schemeApplicationSchema.index({ schemeId: 1, landId: 1 }, { unique: true });

export default mongoose.model('SchemeApplication', schemeApplicationSchema);
