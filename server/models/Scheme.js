import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
    {
        schemeCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        schemeName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        eligibilityText: {
            type: String,
            required: true // Human readable criteria
        },
        minLandArea: {
            type: Number,
            default: 0 // In Acres
        },
        maxLandArea: {
            type: Number,
            default: null // Optional max limit
        },
        allowedLandTypes: {
            type: [String],
            default: [] // e.g., ["Agricultural", "Wetland"]
        },
        allowedDistricts: {
            type: [String],
            default: [] // Empty means ALL districts allowed
        },
        benefitAmount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Scheme', schemeSchema);
