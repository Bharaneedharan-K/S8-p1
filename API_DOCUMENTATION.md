# API Documentation - Phase 1

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Register (Farmer)

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**

```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "mobile": "9876543210",
  "password": "SecurePass@123",
  "district": "Maharashtra"
}
```

**Validation Rules:**

- `name`: Required, trimmed
- `email`: Required, valid email format, unique
- `mobile`: Required, exactly 10 digits
- `password`: Required, minimum 6 characters
- `district`: Required

**Success Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Please complete verification.",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "mobile": "9876543210",
    "role": "FARMER",
    "district": "Maharashtra",
    "status": "FARMER_PENDING_VERIFICATION",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (409):**

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "rajesh@example.com",
  "password": "SecurePass@123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "mobile": "9876543210",
    "role": "FARMER",
    "district": "Maharashtra",
    "status": "FARMER_PENDING_VERIFICATION"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Access:** Protected (All authenticated users)

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "mobile": "9876543210",
    "role": "FARMER",
    "district": "Maharashtra",
    "status": "FARMER_PENDING_VERIFICATION"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### 4. Create Officer (Admin Only)

**Endpoint:** `POST /auth/create-officer`

**Access:** Protected (Admin only)

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Officer Sharma",
  "email": "sharma@government.in",
  "mobile": "9876543211",
  "password": "OfficerPass@123",
  "district": "Karnataka"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Officer created successfully",
  "officer": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "name": "Officer Sharma",
    "email": "sharma@government.in",
    "mobile": "9876543211",
    "role": "OFFICER",
    "district": "Karnataka",
    "status": "OFFICER_ACTIVE"
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Not authorized to access this route",
  "requiredRole": ["ADMIN"],
  "userRole": "FARMER"
}
```

---

### 5. Get All Users (Admin Only)

**Endpoint:** `GET /auth/users`

**Access:** Protected (Admin only)

**Query Parameters:**

- `role` (optional): Filter by role (FARMER, OFFICER, ADMIN)
- `district` (optional): Filter by district
- `status` (optional): Filter by status

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Examples:**

```
GET /auth/users
GET /auth/users?role=FARMER
GET /auth/users?district=Maharashtra&status=FARMER_VERIFIED
GET /auth/users?role=OFFICER&district=Karnataka
```

**Success Response (200):**

```json
{
  "success": true,
  "total": 5,
  "users": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "mobile": "9876543210",
      "role": "FARMER",
      "district": "Maharashtra",
      "status": "FARMER_PENDING_VERIFICATION"
    },
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Officer Sharma",
      "email": "sharma@government.in",
      "mobile": "9876543211",
      "role": "OFFICER",
      "district": "Maharashtra",
      "status": "OFFICER_ACTIVE"
    }
  ]
}
```

---

### 6. Get User by ID (Admin Only)

**Endpoint:** `GET /auth/users/:id`

**Access:** Protected (Admin only)

**Parameters:**

- `id`: User ID

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Example:**

```
GET /auth/users/64f1a2b3c4d5e6f7g8h9i0j1
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "mobile": "9876543210",
    "role": "FARMER",
    "district": "Maharashtra",
    "status": "FARMER_PENDING_VERIFICATION",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 7. Update User Status (Admin Only)

**Endpoint:** `PATCH /auth/users/:id/status`

**Access:** Protected (Admin only)

**Parameters:**

- `id`: User ID

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "FARMER_VERIFIED"
}
```

**Valid Status Values:**

- For FARMER: `FARMER_PENDING_VERIFICATION`, `FARMER_VERIFIED`, `FARMER_REJECTED`
- For OFFICER: `OFFICER_ACTIVE`, `OFFICER_INACTIVE`
- For ADMIN: `ADMIN_ACTIVE`

**Example:**

```
PATCH /auth/users/64f1a2b3c4d5e6f7g8h9i0j1/status
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User status updated",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "mobile": "9876543210",
    "role": "FARMER",
    "district": "Maharashtra",
    "status": "FARMER_VERIFIED"
  }
}
```

---

## Health Check

**Endpoint:** `GET /health`

**Access:** Public

**Response (200):**

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Error Codes

| Code | Message                                     | Cause                        |
| ---- | ------------------------------------------- | ---------------------------- |
| 400  | Validation failed / Missing required fields | Invalid input data           |
| 401  | Invalid credentials                         | Wrong email/password         |
| 401  | No token provided                           | Missing Authorization header |
| 401  | Invalid or expired token                    | Token is invalid/expired     |
| 403  | Not authorized to access this route         | Insufficient permissions     |
| 404  | User not found                              | User ID doesn't exist        |
| 409  | User already exists with this email         | Email already registered     |
| 500  | Server error                                | Internal server error        |

---

## JWT Token Format

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**

```json
{
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "role": "FARMER",
  "iat": 1705748400,
  "exp": 1706353200
}
```

**Token Expiration:** 7 days

---

## Rate Limiting

Currently no rate limiting. To be added in Phase 2.

---

## CORS Policy

Allows requests from:

- `http://localhost:3000` (frontend)
- Can be configured in `server.js`

---

## Pagination

Not implemented in Phase 1. To be added in Phase 3.

---

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "password": "Password@123",
    "district": "Maharashtra"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password@123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

### Get All Users (Admin)

```bash
curl -X GET "http://localhost:5000/api/auth/users?role=FARMER" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Postman Collection

Import this to Postman:

```json
{
  "info": {
    "name": "Land Verification API - Phase 1",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"mobile\": \"9876543210\",\n  \"password\": \"Password@123\",\n  \"district\": \"Maharashtra\"\n}"
        }
      }
    }
  ]
}
```

---

**Last Updated:** January 2026
**API Version:** 1.0
**Phase:** 1 of 5
