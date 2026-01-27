import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    mobile: {
      type: String,
      required: [true, 'Please provide a mobile number'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['FARMER', 'OFFICER', 'ADMIN'],
        message: 'Role must be FARMER, OFFICER or ADMIN',
      },
      required: [true, 'Role is required'],
    },
    district: {
      type: String,
      required: function () {
        return this.role === 'FARMER' || this.role === 'OFFICER';
      },
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'FARMER_PENDING_VERIFICATION',
          'FARMER_VERIFIED',
          'FARMER_REJECTED',
          'OFFICER_ACTIVE',
          'OFFICER_INACTIVE',
          'ADMIN_ACTIVE',
        ],
        message: 'Invalid status',
      },
      default: function () {
        if (this.role === 'FARMER') return 'FARMER_PENDING_VERIFICATION';
        if (this.role === 'OFFICER') return 'OFFICER_INACTIVE';
        return 'ADMIN_ACTIVE';
      },
    },
    aadhaarUrl: {
      type: String,
      default: '',
    },
    selfieUrl: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
