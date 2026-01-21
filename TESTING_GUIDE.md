# Development Checklist & Testing Guide

## ✅ Phase 1 Development Checklist

### Pre-Setup

- [ ] Node.js v16+ installed
- [ ] MongoDB Atlas account created
- [ ] Git installed (optional)
- [ ] Code editor ready (VS Code recommended)
- [ ] Postman or cURL installed for API testing

### Backend Setup

- [ ] Navigate to `backend/` directory
- [ ] Run `npm install`
- [ ] Create `.env` file from `.env.example`
- [ ] Update `MONGODB_URI` with your MongoDB connection
- [ ] Update `JWT_SECRET` to a strong value
- [ ] Update `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- [ ] Run `npm run dev`
- [ ] Verify server starts on port 5000
- [ ] Check health endpoint: `http://localhost:5000/api/health`
- [ ] Verify admin user is seeded

### Frontend Setup

- [ ] Navigate to `frontend/` directory
- [ ] Run `npm install`
- [ ] Verify `.env` has `VITE_API_URL=http://localhost:5000`
- [ ] Run `npm run dev`
- [ ] Verify frontend starts on port 3000
- [ ] Check browser shows landing page

### Initial Testing

- [ ] Backend runs without errors
- [ ] Frontend loads without errors
- [ ] Network tab shows successful API calls
- [ ] Console has no critical errors

---

## 🧪 Phase 1 Testing Scenarios

### 1️⃣ User Registration Test

**Test Case**: Farmer Registration

```
Route: POST /api/auth/register

Test Data:
{
  "name": "Test Farmer",
  "email": "farmer@test.com",
  "mobile": "9876543210",
  "password": "TestPass@123",
  "district": "Karnataka"
}
```

**Expected Results:**

- [ ] Status code 201
- [ ] Response contains `success: true`
- [ ] Response contains `token`
- [ ] User created in MongoDB
- [ ] Password is hashed (not plain text)

**Frontend Test:**

- [ ] Go to `/register`
- [ ] Fill form with test data
- [ ] Click Register
- [ ] Redirect to `/dashboard`
- [ ] Dashboard shows FARMER role
- [ ] Status shows "FARMER_PENDING_VERIFICATION"

---

### 2️⃣ User Login Test

**Test Case 1: Valid Login**

```
Route: POST /api/auth/login

Test Data:
{
  "email": "admin@government.in",
  "password": "Admin@12345"
}
```

**Expected Results:**

- [ ] Status code 200
- [ ] Response contains token
- [ ] Token is JWT format (3 parts, separated by .)
- [ ] Token can be decoded to get userId and role

**Frontend Test:**

- [ ] Go to `/login`
- [ ] Enter admin credentials
- [ ] Click Login
- [ ] Redirect to `/dashboard`
- [ ] Dashboard shows ADMIN role
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage

**Test Case 2: Invalid Password**

```
{
  "email": "admin@government.in",
  "password": "WrongPassword"
}
```

**Expected Results:**

- [ ] Status code 401
- [ ] Response message: "Invalid credentials"
- [ ] No token in response
- [ ] Page stays on login screen

**Test Case 3: Non-existent Email**

```
{
  "email": "nonexistent@example.com",
  "password": "TestPass@123"
}
```

**Expected Results:**

- [ ] Status code 401
- [ ] Response message: "Invalid credentials"
- [ ] No token in response

---

### 3️⃣ Protected Routes Test

**Test Case 1: Access Protected Route Without Token**

- [ ] Go to `/dashboard` (logged out)
- [ ] Should redirect to `/login`
- [ ] URL changes to `/login`

**Test Case 2: Access Protected Route With Invalid Token**

- [ ] Open DevTools Console
- [ ] Run: `localStorage.setItem('token', 'invalid_token')`
- [ ] Refresh page
- [ ] Should redirect to `/login`
- [ ] Token should be removed from localStorage

**Test Case 3: Access Protected Route With Expired Token**

- [ ] Create a token with short expiration
- [ ] Wait for expiration
- [ ] Try to access protected route
- [ ] Should redirect to login

---

### 4️⃣ Role-Based Access Control Test

**Test Case 1: Farmer Accessing Officer Route**

- [ ] Login as farmer
- [ ] Try to access `/officer/farmers`
- [ ] Should show 403 Unauthorized page
- [ ] Should NOT show officer interface

**Test Case 2: Officer Accessing Admin Route**

- [ ] Login as officer
- [ ] Try to access `/admin/officers`
- [ ] Should show 403 Unauthorized page
- [ ] Should NOT show admin interface

**Test Case 3: Admin Accessing All Routes**

- [ ] Login as admin
- [ ] Try to access `/farmer/profile`
- [ ] Should NOT redirect
- [ ] Can access any role's pages (this is configurable)

---

### 5️⃣ Admin Operations Test

**Test Case 1: Create Officer**

```
Route: POST /api/auth/create-officer

Test Data:
{
  "name": "Test Officer",
  "email": "officer@test.com",
  "mobile": "9876543211",
  "password": "OfficerPass@123",
  "district": "Maharashtra"
}

Headers:
Authorization: Bearer <admin_token>
```

**Expected Results:**

- [ ] Status code 201
- [ ] Response contains officer object
- [ ] Officer role is "OFFICER"
- [ ] Officer status is "OFFICER_ACTIVE"
- [ ] Officer created in MongoDB

**Test Case 2: Get All Users (Filtered)**

```
Route: GET /api/auth/users?role=FARMER&status=FARMER_VERIFIED

Headers:
Authorization: Bearer <admin_token>
```

**Expected Results:**

- [ ] Status code 200
- [ ] Response contains array of users
- [ ] All users have role "FARMER"
- [ ] All users have status "FARMER_VERIFIED"

**Test Case 3: Update User Status**

```
Route: PATCH /api/auth/users/<user_id>/status

Test Data:
{
  "status": "FARMER_VERIFIED"
}

Headers:
Authorization: Bearer <admin_token>
```

**Expected Results:**

- [ ] Status code 200
- [ ] User status updated in database
- [ ] Response contains updated user
- [ ] New status appears in MongoDB

---

### 6️⃣ Token Management Test

**Test Case 1: Token Storage**

- [ ] Login as any user
- [ ] Open DevTools → Application → localStorage
- [ ] Check `token` key exists
- [ ] Check `user` key contains JSON

**Test Case 2: Token in API Requests**

- [ ] Login as any user
- [ ] Go to Network tab
- [ ] Make API call to `/api/auth/me`
- [ ] Check request headers contain `Authorization: Bearer <token>`

**Test Case 3: Token Refresh (Manual for Phase 1)**

- [ ] Logout (clear localStorage)
- [ ] Check localStorage is empty
- [ ] Cannot access protected routes

---

### 7️⃣ Form Validation Test

**Test Case 1: Empty Fields**

- [ ] Try to register with empty name
- [ ] Should show error message
- [ ] Should NOT submit

**Test Case 2: Invalid Email**

- [ ] Try: `email: "notanemail"`
- [ ] Should show validation error
- [ ] Should NOT submit

**Test Case 3: Invalid Phone (Registration)**

- [ ] Try: `mobile: "123"` (less than 10 digits)
- [ ] Should show validation error
- [ ] Try: `mobile: "abcdefghij"` (non-numeric)
- [ ] Should show validation error

**Test Case 4: Password Too Short**

- [ ] Try: `password: "short"`
- [ ] Should show validation error
- [ ] Backend should also validate

**Test Case 5: Passwords Don't Match (Registration)**

- [ ] password: "TestPass@123"
- [ ] confirmPassword: "DifferentPass@123"
- [ ] Should show "Passwords do not match"

---

### 8️⃣ Error Handling Test

**Test Case 1: Database Connection Error**

- [ ] Turn off MongoDB connection
- [ ] Try to login
- [ ] Should show server error message
- [ ] Should NOT crash frontend

**Test Case 2: Network Error**

- [ ] Go offline (Disable network)
- [ ] Try to login
- [ ] Should show connection error
- [ ] Should NOT crash frontend

**Test Case 3: Duplicate Email**

- [ ] Register with email: `duplicate@test.com`
- [ ] Try to register again with same email
- [ ] Should show: "User already exists with this email"
- [ ] Should NOT create duplicate user

---

## 📊 Manual Testing Checklist

### Landing Page

- [ ] Page loads without errors
- [ ] All text is visible
- [ ] Images load properly (if any)
- [ ] Login and Register buttons work
- [ ] Links navigate to correct pages
- [ ] Features section displays correctly
- [ ] Tech stack information shows
- [ ] Responsive design (mobile/tablet/desktop)

### Authentication Pages

- [ ] **Login Page**
  - [ ] Form renders correctly
  - [ ] Both fields have placeholders
  - [ ] Submit button works
  - [ ] Demo credentials visible
  - [ ] Link to register works
  - [ ] Loading state shows
  - [ ] Errors display properly

- [ ] **Register Page**
  - [ ] All form fields visible
  - [ ] District dropdown populated
  - [ ] Form validation works
  - [ ] Password confirmation works
  - [ ] Submit button works
  - [ ] Loading state shows
  - [ ] Link to login works

### Dashboards

- [ ] **Farmer Dashboard**
  - [ ] Shows farmer name and email
  - [ ] Shows verification status
  - [ ] Shows district
  - [ ] Quick action buttons visible
  - [ ] Status-specific buttons shown

- [ ] **Officer Dashboard**
  - [ ] Shows officer name and district
  - [ ] Shows status as OFFICER_ACTIVE
  - [ ] Officer task buttons visible

- [ ] **Admin Dashboard**
  - [ ] Shows admin name
  - [ ] Shows admin email
  - [ ] All 6 admin sections visible
  - [ ] All buttons navigable

### Navigation

- [ ] Navbar displays correctly
- [ ] User name shows in navbar
- [ ] User role shows in navbar
- [ ] Logout button works
- [ ] Logout clears data
- [ ] After logout, redirects to login

---

## 🔄 Regression Testing

After making changes, test:

- [ ] Registration still works
- [ ] Login still works
- [ ] Protected routes still protected
- [ ] Admin operations still work
- [ ] Logout still works
- [ ] Error messages still display
- [ ] Frontend still responsive
- [ ] No console errors

---

## 📈 Performance Testing

- [ ] Backend responds within 100ms
- [ ] Frontend page loads within 2s
- [ ] No memory leaks in console
- [ ] No unnecessary re-renders
- [ ] Network requests are efficient

---

## 🔐 Security Testing

- [ ] Passwords are hashed in database
- [ ] Passwords never visible in API responses
- [ ] Token cannot be modified
- [ ] Token expiration works
- [ ] Invalid tokens rejected
- [ ] CORS only allows frontend origin
- [ ] SQL injection attempts blocked (MongoDB)
- [ ] XSS attempts blocked by React

---

## 🐛 Bug Report Template

If you find issues:

```
Title: [Brief description]
Severity: Critical | High | Medium | Low

Environment:
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Backend: Running | Not Running
- Frontend: Running | Not Running

Steps to Reproduce:
1.
2.
3.

Expected Result:
[What should happen]

Actual Result:
[What actually happens]

Error Message:
[Any error in console/backend logs]

Additional Info:
[Screenshots, logs, etc.]
```

---

## ✅ Phase 1 Sign-Off Checklist

Before moving to Phase 2, verify:

- [ ] All 8 test scenarios pass
- [ ] All manual tests pass
- [ ] No console errors
- [ ] No backend errors
- [ ] Database working correctly
- [ ] Authentication secure
- [ ] Documentation updated
- [ ] Code committed to git
- [ ] README updated
- [ ] API documentation complete

---

## 📋 Daily Development Checklist

### Morning Start

- [ ] Pull latest code
- [ ] Install dependencies (if needed)
- [ ] Check for new issues
- [ ] Review changes from others

### During Development

- [ ] Keep terminal windows visible
- [ ] Check console for errors
- [ ] Test changes immediately
- [ ] Document as you go
- [ ] Commit regularly

### Before Push

- [ ] Run all tests
- [ ] Check for console errors
- [ ] Verify all features work
- [ ] Update documentation
- [ ] Check git diff

---

## 🎯 Success Criteria

Phase 1 is complete when:

✅ **Functionality**

- User registration works
- User login works
- JWT tokens generated correctly
- Protected routes enforce authentication
- Role-based access control works
- Admin can manage users
- Error handling works properly

✅ **Code Quality**

- No console errors
- No backend errors
- Input validation working
- Security best practices followed
- Code is readable and documented
- No security vulnerabilities

✅ **Documentation**

- README complete
- API documentation complete
- Setup guides written
- Code comments where needed
- Examples provided

✅ **Testing**

- All test scenarios pass
- Manual testing complete
- No known bugs
- Performance acceptable

---

**Ready to test?** Start with the checklist above!

**Questions?** Check README.md, QUICK_START.md, or API_DOCUMENTATION.md

**Found a bug?** Use the bug report template above

---

**Last Updated:** January 2026
**Phase:** 1 of 5
**Status:** Testing Guide Complete ✅
