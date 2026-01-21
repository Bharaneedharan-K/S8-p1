# Frontend - Environment Configuration

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

Vite automatically proxies `/api` to `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
```

Generates optimized build in `dist/` folder

## Key Features Implemented

### Authentication

- ✅ JWT token management
- ✅ Login/Register pages
- ✅ Protected routes
- ✅ Auto-logout on token expiration
- ✅ Token persistence in localStorage

### Dashboards

- ✅ Farmer Dashboard
- ✅ Officer Dashboard
- ✅ Admin Dashboard
- ✅ Role-based navigation

### Styling

- ✅ Tailwind CSS
- ✅ Responsive design
- ✅ Dark mode ready

## Testing Authentication

### Test User Registration

1. Go to `http://localhost:3000/register`
2. Fill in farmer details
3. Click Register
4. Redirect to dashboard

### Test Login

1. Go to `http://localhost:3000/login`
2. Use credentials:
   - Admin: `admin@government.in` / `Admin@12345`
   - Farmer: Use registered account
3. Login and check dashboard

### Test Protected Routes

1. Try accessing `/farmer/verify` without login → redirects to login
2. Try accessing `/admin/officers` as farmer → shows unauthorized
3. Logout and try accessing protected route → redirects to login

## Folder Structure

```
src/
├── components/
│   ├── Navbar.jsx         # Navigation bar
│   └── ProtectedRoute.jsx # Route guards
├── context/
│   └── AuthContext.jsx    # Auth state management
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── LandingPage.jsx
│   └── UnauthorizedPage.jsx
├── services/
│   ├── api.js            # Axios instance with interceptors
│   └── authService.js    # Auth API calls
├── utils/                 # Helper functions
├── App.jsx               # Main routing
└── main.jsx              # React entry point
```

## Common Issues

### "Cannot GET /api/..."

- Backend not running
- Check backend is on `http://localhost:5000`
- Check VITE_API_URL environment variable

### "Token expired" error

- Session expired (7 days)
- User needs to login again
- Token is auto-removed from localStorage

### CORS errors

- Check backend CORS middleware
- Verify frontend URL in backend CORS config

## Development Tips

### Hot Module Replacement

- Vite supports HMR
- Changes save automatically
- No full page reload needed

### Debugging

- React DevTools browser extension recommended
- Check Console for errors
- Network tab shows API calls

### Performance

- Lazy loading routes in Phase 2
- Code splitting with Vite
- Minified builds for production

## Ports

- Frontend: 3000
- Backend: 5000
- Vite proxies `/api` → `http://localhost:5000`
