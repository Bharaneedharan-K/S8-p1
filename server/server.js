import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import farmerRoutes from './routes/farmer.js';
import landRoutes from './routes/land.js';
import schemeRoutes from './routes/scheme.js';
import applicationRoutes from './routes/application.js';
import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';
import cloudinary from './utils/cloudinary.js';

// Load environment variables
dotenv.config();

const app = express();

// Database connection
await db();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/land', landRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', applicationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Seed admin user on server start
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      const admin = new User({
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL,
        mobile: '9999999999',
        password: process.env.ADMIN_PASSWORD,
        role: 'ADMIN',
        status: 'ADMIN_ACTIVE',
        district: 'Central',
      });
      await admin.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await seedAdmin();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
