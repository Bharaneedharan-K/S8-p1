import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    // Fetch user details to get district for officers
    const user = await User.findById(decoded.userId);
    if (user) {
      req.userDistrict = user.district;
    }
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

// Middleware to check specific role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route',
        requiredRole: roles,
        userRole: req.userRole,
      });
    }
    next();
  };
};
