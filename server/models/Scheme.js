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
        // --- Realistic Government Scheme Extensions ---
        schemeType: {
            type: String,
            enum: ['CENTRAL', 'STATE', 'JOINT'],
            default: 'STATE'
        },
        fundingPattern: {
            type: String,
            default: '100% State' // e.g. "60:40", "100% Central"
        },
        documentsRequired: {
            type: [String],
            default: [] // e.g. ["Aadhar", "Bank Passbook", "Land Record"]
        },
        applicationProcess: {
            type: String,
            default: 'Online application via Welfora portal.'
        },
        // Demographics
        casteEligibility: {
            type: [String],
            default: ['ANY'] // e.g. ["SC", "ST", "General"]
        },
        genderEligibility: {
            type: String,
            enum: ['ANY', 'MALE', 'FEMALE'],
            default: 'ANY'
        },
        ageLimit: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 100 }
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
