# Backend - Environment Configuration

## Setup Instructions

### 1. Install MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `username:password` with your credentials

### 2. Environment Variables

Create `.env` file in backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/land-verification?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

# Admin Account
ADMIN_EMAIL=admin@government.in
ADMIN_PASSWORD=Admin@12345

# Cloudinary (for Phase 2)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Ethereum (for Phase 5)
ETHEREUM_RPC_URL=http://127.0.0.1:8545
ETHEREUM_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
SMART_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

## What Happens on Startup

1. Connects to MongoDB Atlas
2. Creates admin user if doesn't exist
3. Logs connection status
4. Ready for API requests

## Testing API

Use Postman or cURL:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Register farmer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "Password@123",
    "district": "Maharashtra"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password@123"
  }'
```

## Database Connection Issues

### Error: "MongoDB connection failed"

- Check MONGODB_URI is correct
- Verify IP whitelist in MongoDB Atlas
- Check username/password

### Error: "Invalid connection string"

- Ensure proper format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- Check special characters are URL encoded

## Ports

- Backend: 5000
- MongoDB Atlas: Remote (cloud)
