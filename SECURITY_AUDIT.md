# Security Audit Report

---

## Critical Issues

### CRIT-01: Weak JWT Secret
**File:** `.env`
```
JWT_SECRET=superSecretKeyChangeThis
```
**Risk:** Token forgery. Anyone who discovers this secret can forge valid JWTs and impersonate any user (including admin).
**Impact:** Complete account takeover, unauthorized access to all data.
**Fix:** Use a cryptographically random 64-character string: `openssl rand -hex 32`

### CRIT-02: Email Credentials in Plaintext
**File:** `.env`
```
EMAIL_PASS=zqck esbl ucyi cdrt
```
**Risk:** Gmail account compromise if `.env` is leaked.
**Impact:** Attacker can read/send emails, reset passwords for other services.
**Fix:** Use environment-specific secrets (GitHub Secrets, AWS Secrets Manager, etc.)

### CRIT-03: No Rate Limiting on Login
**File:** `controllers/authController.js` — Login endpoint
**Risk:** Brute force password attack is trivial.
**Impact:** Account takeover.
**Fix:** Implement `express-rate-limit` with strict limits on `/api/auth/login`.

### CRIT-04: Missing `axios` in package.json
**File:** `controllers/pincodeController.js` uses `axios`, but `package.json` does not list it.
**Risk:** `npm install` will not install `axios`. App crashes on pincode validation.
**Fix:** `npm install axios` and add to package.json.

---

## High Severity Issues

### HIGH-01: No Security Headers (Helmet)
**Risk:** Vulnerable to XSS, clickjacking, MIME sniffing, and other attacks.
**Fix:** `npm install helmet` and `app.use(helmet())`.

### HIGH-02: CORS Wide Open
**File:** `index.js` — `app.use(cors())`
**Risk:** Any domain can make cross-origin requests. CSRF-style attacks possible if combined with cookie-based auth.
**Fix:** Restrict to `CLIENT_URL`: `app.use(cors({ origin: process.env.CLIENT_URL }))`.

### HIGH-03: Error Messages Leak Internals
**File:** Multiple controllers
```javascript
res.status(500).json({ msg: "Server error", error: err.message });
```
**Risk:** Stack traces and internal details exposed to client.
**Fix:** Log full error server-side, return generic message to client. Only include `error` in development mode.

### HIGH-04: No Request Validation/Sanitization
**Risk:** No validation for password strength, email format, string lengths, price ranges, etc. MongoDB injection through `$where`, `$gt` operators in query strings.
**Fix:** Use express-validator, zod, or joi for all inputs.

### HIGH-05: Admin by Email — Privilege Escalation
**File:** `controllers/authController.js:21`
```javascript
const role = email === ADMIN_EMAIL ? "admin" : "user";
```
**Risk:** Anyone who discovers or guesses `ADMIN_EMAIL` can register as admin.
**Fix:** Admin should be assigned manually via database or separate admin creation endpoint.

### HIGH-06: File Upload — No Content Verification
**File:** `middleware/multerMiddleware.js`
**Risk:** MIME type can be spoofed. Attacker could upload executable files disguised as images.
**Fix:** Validate actual file content using `file-type` package, not just MIME header.

### HIGH-07: No CSRF Protection
**Risk:** If JWT is ever stored in cookies, CSRF attacks could be performed.
**Fix:** Implement CSRF tokens if switching to cookie-based auth.

### HIGH-08: No HTTP Parameter Pollution Protection
**Risk:** Duplicate query parameters could bypass validation.
**Fix:** Use `hpp` middleware.

---

## Medium Severity Issues

### MED-01: No `httpOnly` Cookies
**Risk:** JWT stored in localStorage is vulnerable to XSS theft.
**Fix:** Use httpOnly, secure, sameSite cookies for JWT.

### MED-02: No Account Lockout
**Risk:** Brute force on login is possible even with rate limiting bypass.
**Fix:** Lock account after 5 failed attempts for 15 minutes.

### MED-03: No Password Strength Validation
**Risk:** Users can set weak passwords (e.g., "password123").
**Fix:** Enforce min 8 chars, mixed case, numbers, special chars.

### MED-04: No Input Length Limits
**Risk:** Database DoS via extremely long strings.
**Fix:** Add maxlength validation to all string fields.

### MED-05: Booking Cancel — Room Not Unblocked
**File:** `controllers/bookingController.js:cancelBooking`
**Risk:** Cancelled booking leaves room blocked, preventing new bookings.
**Fix:** Unblock room on cancellation.

### MED-06: Order Cancel — Stock Not Restored
**File:** No order cancel endpoint exists
**Risk:** Cancelled orders don't restore product stock.
**Fix:** Implement order cancellation with stock restoration.

### MED-07: No Token Blacklist
**Risk:** Logged-out tokens remain valid until expiry.
**Fix:** Maintain token blacklist in Redis/Database.

### MED-08: Seed Scripts Have Empty MONGO_URI
**Files:** `seedProducts.js`, `seedVillas.js`
**Risk:** If run unintentionally, will crash or connect to wrong DB.
**Fix:** Read from .env or command-line args.

---

## Low Severity Issues

### LOW-01: `crypto` npm Package Listed
**File:** `package.json` — `"crypto": "^1.0.1"`
**Risk:** Unnecessary dependency. Node.js has built-in `crypto`.
**Fix:** Remove from package.json (built-in crypto is already used).

### LOW-02: Test Pincode Endpoint
**File:** `index.js` — `GET /api/test-pincode`
**Risk:** Unnecessary public endpoint leaking server info.
**Fix:** Remove or restrict to development.

### LOW-03: No `X-Content-Type-Options`
**Risk:** MIME type sniffing possible on uploaded files.
**Fix:** Set header via Helmet or manually.

### LOW-04: No `X-Frame-Options`
**Risk:** Clickjacking possible if frontend is embedded in iframe.
**Fix:** Set via Helmet.

### LOW-05: Email From Address Spoofable
**File:** `mails/sendMail.js`
**Risk:** SPF/DKIM not configured for Gmail domain.
**Fix:** Configure Gmail SPF/DKIM records.

---

## Security Score: **3/10**

This application has multiple critical and high-severity security issues that must be addressed before production deployment.
