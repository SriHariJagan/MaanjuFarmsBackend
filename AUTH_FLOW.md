# Authentication & Authorization Flow

## Authentication

### Method: JWT (JSON Web Token)

The app uses JWT for authentication. Tokens are generated on login and must be sent in the `Authorization` header as a Bearer token.

### Token Structure

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "id": "<user_id>", "role": "user|admin", "iat": <issued>, "exp": <expiry> }
```

### Token Expiry: 1 day (`expiresIn: "1d"`)

### Token Storage (Frontend Decision)

The API does not enforce a storage mechanism. Current convention:
- Store token in `localStorage` or `sessionStorage`
- Send in every request as: `Authorization: Bearer <token>`

**⚠️ Recommendation:** Use httpOnly cookies instead of localStorage to prevent XSS token theft.

---

## Authentication Flow

```
1. User registers → POST /api/auth/signup
   - Creates user with hashed password
   - Role auto-assigned: "admin" if email == ADMIN_EMAIL, else "user"
   
2. User logs in → POST /api/auth/login
   - Finds user by email
   - Compares password with bcrypt
   - Returns JWT token + user data
   
3. User accesses protected routes
   - Sends token in Authorization header
   - authMiddleware verifies JWT
   - Sets req.user = { id, role }
   - route handler executes
```

### What's Missing
- ❌ No email verification after signup
- ❌ No forgot password / reset password flow
- ❌ No refresh token mechanism
- ❌ No token blacklist / invalidation on logout
- ❌ No account lockout after failed attempts
- ❌ No password strength validation

---

## Authorization

### Role-Based Access Control (RBAC)

Two roles implemented:
1. **`user`** — Default role for all new signups
2. **`admin`** — Only when signup email matches `ADMIN_EMAIL` env var

### Middleware

**authMiddleware.js** provides two middleware functions:

```javascript
// Verifies JWT and sets req.user
authMiddleware(req, res, next) {
  // 1. Check Authorization header exists and starts with "Bearer "
  // 2. Extract token
  // 3. jwt.verify(token, JWT_SECRET)
  // 4. Set req.user = { id: decoded.id, role: decoded.role }
  // 5. next()
}

// Requires admin role
adminMiddleware(req, res, next) {
  // Checks req.user.role === "admin"
}
```

### Route Protection Examples

```javascript
// Public
router.get("/", getAllProducts);

// Authenticated users only
router.get("/cart", authMiddleware, getCart);

// Admin only
router.post("/products", authMiddleware, adminMiddleware, addProduct);
```

---

## Role Permissions Matrix

| Feature | Public | User | Admin |
|---|---|---|---|
| View Products | ✅ | ✅ | ✅ |
| View Rooms/Villas | ✅ | ✅ | ✅ |
| Check Availability | ✅ | ✅ | ✅ |
| View Gallery | ✅ | ✅ | ✅ |
| Check Pincode | ✅ | ✅ | ✅ |
| Submit Contact | ✅ | ✅ | ✅ |
| **Signup** | — | ✅ | ✅ |
| **Login** | — | ✅ | ✅ |
| View Profile | — | ✅ | ✅ |
| Manage Cart | — | ✅ | ✅ |
| Place Order | — | ✅ | ✅ |
| Book Villa | — | ✅ | ✅ |
| View Own Orders | — | ✅ | ✅ |
| Cancel Own Booking | — | ✅ | ✅ |
| **CRUD Products** | — | — | ✅ |
| **CRUD Rooms** | — | — | ✅ |
| **CRUD Gallery** | — | — | ✅ |
| **View All Orders** | — | — | ✅ |
| **Update Orders** | — | — | ✅ |
| **View All Bookings** | — | — | ✅ |
| **Block/Unblock Pincodes** | — | — | ✅ |

---

## Security Considerations

### Current Implementation
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT verification on protected routes
- Admin routes guarded by adminMiddleware
- Booking ownership verification on cancellation

### Weaknesses
1. **Weak JWT Secret:** Currently `"superSecretKeyChangeThis"` — easily guessable
2. **No Rate Limiting:** Login endpoint can be brute-forced
3. **Token in localStorage:** Prone to XSS theft
4. **No Token Revocation:** Logged-out tokens remain valid until expiry
5. **No 2FA/MFA:** Not implemented
6. **Admin by Email:** Anyone who knows ADMIN_EMAIL can register as admin
7. **No Session Management:** No way to list/revoke active sessions
