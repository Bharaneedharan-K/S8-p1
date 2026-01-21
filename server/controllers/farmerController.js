import User from '../models/User.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

// Farmer submits Aadhaar and selfie for verification
export const submitVerification = async (req, res) => {
  try {
    console.log('📝 Farmer verification request received');
    
    const userId = req.userId; // From auth middleware
    console.log('User ID:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No user ID found' 
      });
    }

    const aadhaarFile = req.files?.aadhaar?.[0];
    const selfieFile = req.files?.selfie?.[0];

    console.log('Files received:', {
      aadhaar: aadhaarFile ? `${aadhaarFile.originalname} (${aadhaarFile.size} bytes)` : 'missing',
      selfie: selfieFile ? `${selfieFile.originalname} (${selfieFile.size} bytes)` : 'missing'
    });

    if (!aadhaarFile || !selfieFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both Aadhaar and selfie are required.' 
      });
    }

    console.log('📤 Uploading Aadhaar to Cloudinary...');
    
    // Upload Aadhaar to Cloudinary using upload_stream with buffer
    const aadhaarResult = await new Promise((resolve, reject) => {
      try {
        const stream = Readable.from(aadhaarFile.buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'aadhaar', 
            resource_type: 'auto'
          }, 
          (error, result) => {
            if (error) {
              console.error('❌ Aadhaar upload error:', error.message);
              reject(error);
            } else {
              console.log('✅ Aadhaar uploaded:', result.secure_url);
              resolve(result);
            }
          }
        );
        
        uploadStream.on('error', (err) => {
          console.error('❌ Stream error during Aadhaar upload:', err.message);
          reject(err);
        });
        
        stream.pipe(uploadStream);
      } catch (e) {
        console.error('❌ Aadhaar upload setup error:', e.message);
        reject(e);
      }
    });

    console.log('📤 Uploading Selfie to Cloudinary...');
    
    // Upload selfie to Cloudinary using upload_stream with buffer
    const selfieResult = await new Promise((resolve, reject) => {
      try {
        const stream = Readable.from(selfieFile.buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'selfie', 
            resource_type: 'auto'
          }, 
          (error, result) => {
            if (error) {
              console.error('❌ Selfie upload error:', error.message);
              reject(error);
            } else {
              console.log('✅ Selfie uploaded:', result.secure_url);
              resolve(result);
            }
          }
        );
        
        uploadStream.on('error', (err) => {
          console.error('❌ Stream error during Selfie upload:', err.message);
          reject(err);
        });
        
        stream.pipe(uploadStream);
      } catch (e) {
        console.error('❌ Selfie upload setup error:', e.message);
        reject(e);
      }
    });

    console.log('💾 Updating user record in MongoDB...');
    
    // Update user record
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          aadhaarUrl: aadhaarResult.secure_url,
          selfieUrl: selfieResult.secure_url,
          status: 'FARMER_PENDING_VERIFICATION',
        },
      },
      { new: true }
    );

    console.log('✅ Farmer verification submitted successfully');
    
    res.status(200).json({ 
      success: true, 
      message: '✅ Documents submitted successfully for verification', 
      user: user.toJSON() 
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Farmer verification error:', errorMsg);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit verification', 
      error: errorMsg
    });
  }
};
