# 🌾 Land Verification & Scheme Application System - Phase 1

## 📋 Phase 1: Authentication & User Management

This is a complete implementation of Phase 1 including:

- Farmer registration with email, mobile, and district
- Secure login with JWT authentication
- Role-based access control (FARMER, OFFICER, ADMIN)
- User status management
- Officer creation by Admin
- Admin seeding on server startup

---

## 🏗️ Project Structure

```
├── backend/              # Node.js/Express server
│   ├── config/          # Database and configurations
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth and error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # JWT utilities
│   ├── server.js        # Entry point
│   └── package.json
│
└── frontend/            # React + Vite application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # Auth context
    │   ├── pages/       # Page components
    │   ├── services/    # API client
    │   ├── utils/       # Utilities
    │   ├── App.jsx      # Main app
    │   └── index.css    # Global styles
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Backend Setup

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Keep or change `JWT_SECRET` for production

   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/land-verification
   JWT_SECRET=your_super_secret_key
   ADMIN_EMAIL=admin@government.in
   ADMIN_PASSWORD=Admin@12345
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

---

## 📡 API Endpoints - Phase 1

### Authentication Routes

#### Register (Farmer)

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "Password@123",
  "district": "Maharashtra"
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { /* user object */ }
}
```

#### Create Officer (Admin Only)

```
POST /api/auth/create-officer
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Officer Name",
  "email": "officer@government.in",
  "mobile": "9876543210",
  "password": "OfficerPass@123",
  "district": "Maharashtra"
}

Response:
{
  "success": true,
  "message": "Officer created successfully",
  "officer": { /* officer object */ }
}
```

#### Get All Users (Admin Only)

```
GET /api/auth/users?role=FARMER&district=Maharashtra&status=FARMER_VERIFIED
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "total": 5,
  "users": [ /* array of users */ ]
}
```

#### Get User by ID (Admin Only)

```
GET /api/auth/users/:userId
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "user": { /* user object */ }
}
```

#### Update User Status (Admin Only)

```
PATCH /api/auth/users/:userId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "FARMER_VERIFIED"
}

Response:
{
  "success": true,
  "message": "User status updated",
  "user": { /* updated user object */ }
}
```

---

## 👤 User Roles & Status

### Roles

- **FARMER**: Land owner applying for schemes
- **OFFICER**: Government officer verifying documents and recording land
- **ADMIN**: System administrator managing officers and schemes

### User Status

- **FARMER_PENDING_VERIFICATION**: New farmer awaiting document verification
- **FARMER_VERIFIED**: Farmer cleared by officer, eligible for schemes
- **FARMER_REJECTED**: Farmer documents rejected
- **OFFICER_ACTIVE**: Active officer account
- **OFFICER_INACTIVE**: Inactive officer account
- **ADMIN_ACTIVE**: Active admin account

---

## 🔐 Authentication Flow

### JWT Token Structure

```javascript
{
  userId: "64f1a2b3c4d5e6f7g8h9i0j1",
  role: "FARMER",
  iat: 1693123456,
  exp: 1693728256  // Expires in 7 days
}
```

### Authorization Headers

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

### Token Storage (Frontend)

- Tokens are stored in `localStorage` as `token`
- User data stored in `localStorage` as `user`
- Axios interceptor automatically adds token to requests

---

## 🧪 Testing Phase 1

### Demo Credentials

**Admin Account** (Default seeded)

```
Email: admin@government.in
Password: Admin@12345
Role: ADMIN
Status: ADMIN_ACTIVE
```

### Test Workflow

1. **Register as Farmer**
   - Go to `/register`
   - Fill form with farmer details
   - Auto-redirects to dashboard with `FARMER_PENDING_VERIFICATION` status

2. **Login**
   - Go to `/login`
   - Use admin credentials or registered farmer account
   - Redirects to role-based dashboard

3. **Admin Creates Officer**
   - Login as admin
   - Navigate to `/admin/officers` (Coming in Phase 2)
   - Create new officer with district assignment

4. **Check User Status**
   - Admin can view all users at `/admin/farmers`
   - Update verification status

---

## 🛡️ Security Features

- ✅ **bcrypt Hashing**: Passwords hashed with salt factor 10
- ✅ **JWT Tokens**: Signed with secret key, 7-day expiration
- ✅ **Role-Based Access**: Middleware enforces role authorization
- ✅ **Input Validation**: Express-validator checks all inputs
- ✅ **Secure Cors**: CORS enabled for frontend domain
- ✅ **Error Handling**: Centralized error middleware

---

## 📦 Database Models (Phase 1)

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,              // Required
  email: String,             // Required, Unique
  mobile: String,            // Required, 10-digit
  password: String,          // Hashed
  role: String,              // FARMER, OFFICER, ADMIN
  district: String,          // Required for FARMER/OFFICER
  status: String,            // User status
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Frontend Routes (Phase 1)

| Route              | Component         | Auth Required | Role Required |
| ------------------ | ----------------- | ------------- | ------------- |
| `/`                | LandingPage       | No            | None          |
| `/verify-land`     | Land Verification | No            | None          |
| `/login`           | LoginPage         | No            | None          |
| `/register`        | RegisterPage      | No            | None          |
| `/dashboard`       | DashboardPage     | Yes           | Any           |
| `/officer/profile` | Officer Profile   | Yes           | OFFICER       |
| `/admin/officers`  | Manage Officers   | Yes           | ADMIN         |
| `/admin/farmers`   | Manage Farmers    | Yes           | ADMIN         |

---

## 🚨 Error Handling

### Common Errors

| Status | Message                       | Fix                   |
| ------ | ----------------------------- | --------------------- |
| 400    | Missing required fields       | Check form inputs     |
| 401    | Invalid credentials           | Verify email/password |
| 401    | No token provided             | Login first           |
| 403    | Not authorized for this route | Check your role       |
| 409    | User already exists           | Use different email   |
| 500    | Server error                  | Check backend logs    |

---

## 🔗 Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@government.in
ADMIN_PASSWORD=Admin@12345
NODE_ENV=development
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
```

---

## 📝 Phase 1 Checklist

- ✅ Farmer registration system
- ✅ Secure login with JWT
- ✅ Role-based access control
- ✅ Admin seeding on startup
- ✅ Officer creation by admin
- ✅ User status management
- ✅ Protected routes
- ✅ Error handling and validation
- ✅ Token persistence

---

## 🔜 Next Steps - Phase 2

Phase 2 will implement:

- Farmer verification module (Aadhaar, Selfie upload)
- Officer farmer verification interface
- Cloudinary integration for document storage
- FarmerVerification model

---

## 📖 Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm start            # Start production server
npm run lint         # Run linter

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Last Updated**: January 2026
**Phase**: 1 of 5
**Status**: Complete ✅
