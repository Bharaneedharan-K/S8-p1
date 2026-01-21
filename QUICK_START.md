# Quick Start Guide - Phase 1

## ⚡ 5-Minute Setup

### Prerequisites

- Node.js v16+
- MongoDB Atlas account (free)
- Git

---

## 🚀 Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# Copy this content:
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/land-verification
JWT_SECRET=your_super_secret_key_12345
ADMIN_EMAIL=admin@government.in
ADMIN_PASSWORD=Admin@12345
NODE_ENV=development

# Start backend
npm run dev
```

✅ Backend running on `http://localhost:5000`

---

## 🚀 Step 2: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running on `http://localhost:3000`

---

## ✅ Testing Phase 1

### 1. Open Browser

```
http://localhost:3000
```

### 2. Test Registration (Farmer)

1. Click "Register as Farmer"
2. Fill details:
   - Name: John Farmer
   - Email: john@example.com
   - Mobile: 9876543210
   - District: Maharashtra
   - Password: Password@123

3. Click Register
4. ✅ Redirected to Dashboard (FARMER role)
5. Status shows: `FARMER_PENDING_VERIFICATION`

### 3. Test Admin Login

1. Go to `/login`
2. Enter credentials:
   - Email: `admin@government.in`
   - Password: `Admin@12345`
3. ✅ Login successful
4. Dashboard shows Admin panel
5. Can access `/admin/officers` and `/admin/farmers`

### 4. Test Officer Creation (As Admin)

1. Login as admin
2. Go to `/admin/officers` (Coming in Phase 2)
3. Create new officer with:
   - Name: Officer Sharma
   - Email: officer@government.in
   - Mobile: 9876543211
   - District: Karnataka
   - Password: OfficerPass@123

4. ✅ Officer created successfully

### 5. Test Protected Routes

1. Logout
2. Try accessing `/farmer/verify` → Redirected to login
3. Try accessing `/admin/farmers` as farmer → Unauthorized page
4. ✅ Route protection working

---

## 📝 Project Structure

```
S8 p1/
├── backend/
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & error handling
│   ├── config/              # Database config
│   ├── utils/               # JWT utilities
│   ├── server.js            # Entry point
│   ├── package.json
│   ├── .env.example
│   └── SETUP.md
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── SETUP.md
├── README.md                # Full documentation
├── API_DOCUMENTATION.md     # API specs
└── QUICK_START.md          # This file
```

---

## 🔐 Default Credentials

**Admin Account** (Auto-seeded)

```
Email: admin@government.in
Password: Admin@12345
Role: ADMIN
```

---

## 🌐 API Endpoints (Phase 1)

| Method | Endpoint                 | Auth | Role  |
| ------ | ------------------------ | ---- | ----- |
| POST   | `/auth/register`         | No   | -     |
| POST   | `/auth/login`            | No   | -     |
| GET    | `/auth/me`               | Yes  | Any   |
| POST   | `/auth/create-officer`   | Yes  | ADMIN |
| GET    | `/auth/users`            | Yes  | ADMIN |
| GET    | `/auth/users/:id`        | Yes  | ADMIN |
| PATCH  | `/auth/users/:id/status` | Yes  | ADMIN |

---

## 🧪 Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Farmer",
    "email":"john@example.com",
    "mobile":"9876543210",
    "password":"Password@123",
    "district":"Maharashtra"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"Password@123"
  }'

# Get current user (replace TOKEN with your token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔗 Important URLs

| Purpose   | URL                               |
| --------- | --------------------------------- |
| Frontend  | `http://localhost:3000`           |
| Backend   | `http://localhost:5000`           |
| API       | `http://localhost:5000/api`       |
| Landing   | `http://localhost:3000/`          |
| Login     | `http://localhost:3000/login`     |
| Register  | `http://localhost:3000/register`  |
| Dashboard | `http://localhost:3000/dashboard` |

---

## 🐛 Troubleshooting

### Backend won't connect to MongoDB

1. Check connection string in `.env`
2. Add your IP to MongoDB Atlas whitelist
3. Verify credentials are correct

### Frontend can't connect to backend

1. Ensure backend is running on port 5000
2. Check CORS is enabled in backend
3. Verify Vite proxy in `vite.config.js`

### Getting "Invalid token" error

1. Clear localStorage: Open DevTools → Application → Clear All
2. Logout and login again
3. Token expires in 7 days

### Seeing "User already exists"

1. Use a different email for registration
2. Or check if account already created in MongoDB

---

## 📚 Next Steps

After Phase 1, Phase 2 includes:

- Document upload (Aadhaar, Selfie)
- Officer farmer verification
- Cloudinary integration
- Farmer verification status

See README.md for more details.

---

## 💡 Tips

✅ **Development**

- Use Postman for API testing
- Keep backend/frontend terminals visible
- Monitor browser console for errors
- Check backend terminal for server logs

✅ **MongoDB**

- Free tier has enough for development
- 512MB storage is sufficient
- IP whitelist: Add `0.0.0.0/0` for development

✅ **JWT Tokens**

- Stored in localStorage
- Expire in 7 days
- Included in all API requests automatically

---

## 📞 Quick Help

**Start Commands:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Check Status:**

- Backend health: `http://localhost:5000/api/health`
- Frontend: `http://localhost:3000`

**Reset Data:**

1. Delete MongoDB database (phase will restart with no users)
2. Run backend again to seed admin

---

## ✨ Phase 1 Features

- ✅ Farmer registration
- ✅ Secure JWT login
- ✅ Role-based dashboards
- ✅ Admin user management
- ✅ Officer creation
- ✅ Protected routes
- ✅ User status management
- ✅ Error handling
- ✅ Token persistence

---

## 🎯 What's Working

1. **Registration** - Farmers can sign up
2. **Login** - Secure JWT authentication
3. **Admin Dashboard** - Manage users and officers
4. **Officer Dashboard** - View assigned tasks
5. **Farmer Dashboard** - Check verification status
6. **Route Protection** - Role-based access control

---

## 🔜 Coming in Phase 2

- Document verification workflow
- Aadhaar & selfie uploads
- Officer verification interface
- Cloudinary integration
- FarmerVerification model

---

**Ready to start?** 🚀

Follow the steps above and you'll have the system running in 5 minutes!

For detailed documentation, see:

- `README.md` - Full documentation
- `API_DOCUMENTATION.md` - API specifications
- `backend/SETUP.md` - Backend details
- `frontend/SETUP.md` - Frontend details

---

**Last Updated:** January 2026
**Phase:** 1 of 5
**Status:** Ready to Use ✅
