import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendOfficerCredentials } from '../utils/email.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { validationResult } from 'express-validator';

// Register - Farmer Only
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, mobile, password, district, address } = req.body; // Added address

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' }); // Modified status and message
    }

    // Handle File Uploads (Cloudinary)
    let profilePhotoUrl = '';
    let aadhaarCardUrl = '';

    if (req.files) {
      if (req.files.profilePhoto) {
        const result = await uploadToCloudinary(req.files.profilePhoto[0].buffer, req.files.profilePhoto[0].originalname);
        profilePhotoUrl = result.secure_url;
      }
      if (req.files.aadhaarCard) {
        console.log('📄 Uploading Aadhaar PDF...');
        const result = await uploadToCloudinary(req.files.aadhaarCard[0].buffer, req.files.aadhaarCard[0].originalname);
        console.log('✅ Aadhaar Upload Result:', result); // DEBUG
        aadhaarCardUrl = result.secure_url;
      }
    }

    // Create new farmer user
    const user = new User({
      name,
      email,
      mobile,
      password, // Will be hashed by pre-save hook
      district,
      address, // Added address
      selfieUrl: profilePhotoUrl, // Mapped to selfieUrl
      aadhaarUrl: aadhaarCardUrl, // Mapped to aadhaarUrl
      role: 'FARMER',
      status: 'FARMER_PENDING_VERIFICATION', // Default status for new farmers
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please complete verification.',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

// Create Officer (Admin Only)
export const createOfficer = async (req, res) => {
  try {
    const { name, email, mobile, district, area, password, sendEmail } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Strict Email Logic: If sendEmail is true, try sending FIRST
    let emailSent = false;
    let emailErrorMsg = '';

    if (sendEmail) {
      try {
        console.log(`📧 Attempting to send credentials to ${email}...`);
        await sendOfficerCredentials(email, name, password);
        console.log(`✅ Email sent successfully to ${email}`);
        emailSent = true;
      } catch (emailError) {
        console.error(`❌ Email failed:`, emailError.message);
        return res.status(500).json({
          success: false,
          message: 'Email connection timed out. Please UNCHECK "Send Credentials via Email" to create the account manually.',
          error: emailError.message
        });
      }
    }

    // If email succeeded (or wasn't requested), create the user
    const officer = new User({
      name,
      email,
      mobile,
      password,
      district,
      area,
      role: 'OFFICER',
      status: 'OFFICER_ACTIVE',
    });

    await officer.save();

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Officer created and credentials emailed successfully!'
        : (sendEmail
          ? `Officer created, but Email failed: ${emailErrorMsg}. Please share credentials manually.`
          : 'Officer created successfully (Email skipped).'),
      officer: officer.toJSON(),
    });
  } catch (error) {
    console.error('Create officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create officer',
      error: error.message,
    });
  }
};

// Get all users (Admin only) or farmers in officer's district (Officer)
export const getAllUsers = async (req, res) => {
  try {
    const { role, district, status } = req.query;
    let filter = {};

    // If user is an OFFICER, they can only see farmers in their own district
    if (req.userRole === 'OFFICER') {
      console.log('🔍 Officer requesting farmers in district:', req.userRole, req.userId);
      filter.role = 'FARMER'; // Officers can only see farmers
      filter.district = req.userDistrict || ''; // Use officer's district from token
      console.log('Filter:', filter);
    } else if (req.userRole === 'ADMIN') {
      // Admin can filter by any criteria
      if (role) filter.role = role;
      if (district) filter.district = district;
      if (status) filter.status = status;
    } else if (req.userRole === 'FARMER') {
      // Farmer can see Officers in their district
      if (role === 'OFFICER') {
        filter.role = 'OFFICER';
        // Optional: Restrict to Farmer's district or allow searching any district
        if (district) filter.district = district;
      } else {
        return res.status(403).json({ success: false, message: 'Farmers can only view Officers.' });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Also apply status filter if provided (for both admin and officers)
    if (status) filter.status = status;

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

// Update user status (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

// Get aggregated profile stats (Farmer)
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Import here to avoid circular dependency issues at top level if any
    const LandModel = (await import('../models/Land.js')).default;
    const ApplicationModel = (await import('../models/SchemeApplication.js')).default;

    const [lands, applications] = await Promise.all([
      LandModel.find({ farmerId: userId }),
      ApplicationModel.find({ farmerId: userId })
    ]);

    // Calculate totals
    const totalLands = lands.length;
    const totalArea = lands.reduce((sum, land) => sum + (Number(land.area) || 0), 0);
    const approvedLands = lands.filter(l => l.status === 'LAND_APPROVED').length;

    const totalApplications = applications.length;
    const approvedApps = applications.filter(a => a.status === 'APPROVED').length;

    res.status(200).json({
      success: true,
      stats: {
        totalLands,
        totalArea,
        approvedLands,
        totalApplications,
        approvedApps
      }
    });

  } catch (error) {
    console.error('Profile Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// Update user details (Admin only for now)
export const updateUser = async (req, res) => {
  try {
    const { name, mobile, district, area, status } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (mobile) updates.mobile = mobile;
    if (mobile) updates.mobile = mobile;
    if (district) updates.district = district;
    if (area) updates.area = area;
    if (status) updates.status = status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};
