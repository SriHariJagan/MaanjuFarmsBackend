# Maanjoo Farms Backend

**Farm-to-Table E-Commerce & Villa Booking Platform**

A Node.js/Express backend powering an organic farm product marketplace and luxury villa reservation system with Razorpay payment integration.

---

## Features

- **Product E-Commerce** — Browse, cart, order organic farm products
- **Villa Booking** — Search, availability check, book rooms/villas
- **Razorpay Payments** — Secure payment processing with webhooks
- **Authentication & Authorization** — JWT-based auth with admin/user roles
- **Email Notifications** — Order confirmations, booking confirmations, contact auto-reply
- **Pincode Validation** — India Post API integration with blocked pincode management
- **Image Uploads** — Multer-based file uploads for products, gallery
- **Invoice Generation** — PDF invoice generation (utility, not integrated)
- **Gallery Management** — Admin-managed image gallery

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB (Mongoose 8) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Payments | Razorpay API + Webhooks |
| File Uploads | Multer |
| Emails | Nodemailer (Gmail SMTP) |
| PDF Generation | PDFKit |
| External APIs | India Post Pincode API |
| Dev Server | Nodemon |

---

## Folder Structure

```
MaanjuFarmsBackend/
├── index.js                  # Entry point
├── package.json
├── .env                      # Environment variables (gitignored)
├── .gitignore
├── readme                    # Dev notes (not README.md)
├── seedProducts.js           # Seed script (broken - empty MONGO_URI)
├── seedVillas.js             # Seed script (broken - empty MONGO_URI)
├── trimmedProducts.json      # Seed data
│
├── config/
│   └── db.js                 # MongoDB connection
│
├── controllers/
│   ├── authController.js     # Signup, login, getMe
│   ├── productController.js  # CRUD products
│   ├── roomController.js     # CRUD rooms + availability
│   ├── cartController.js     # Cart management
│   ├── orderController.js    # Order listing + admin updates
│   ├── bookingController.js  # Room booking + cancellation
│   ├── paymentController.js  # Order creation, verify, mark failed
│   ├── webhookController.js  # Razorpay webhook handler
│   ├── galleryController.js  # Gallery CRUD
│   ├── contactController.js  # Contact form
│   └── pincodeController.js  # Pincode validation + blocked management
│
├── models/
│   ├── User.js               # User model (name, email, password, role, cart)
│   ├── Product.js            # Product model (name, price, stock, category, image)
│   ├── Room.js               # Room/Villa model (name, category, type, price, status)
│   ├── Order.js              # Order model (products, payment, shipping, tracking)
│   ├── Booking.js            # Booking model (room, dates, guests, payment, TTL)
│   ├── Gallery.js            # Gallery model (title, imageUrl, createdBy)
│   └── BlockedPincode.js     # Blocked pincode model
│
├── routers/
│   ├── auth.js               # /api/auth/*
│   ├── product.js            # /api/products/*
│   ├── room.js               # /api/rooms/*
│   ├── cart.js               # /api/cart/*
│   ├── order.js              # /api/orders/*
│   ├── booking.js            # /api/bookings/*
│   ├── gallery.js            # /api/gallery/*
│   ├── payment.js            # /api/payment/*
│   ├── contactRoutes.js      # /api/contact
│   └── pincodeRoutes.js      # /api/pincode/*
│
├── middleware/
│   ├── authMiddleware.js     # JWT verification + admin check
│   └── multerMiddleware.js   # File upload config
│
├── mails/
│   ├── mailTypes.js          # Mail dispatcher by type
│   ├── sendMail.js           # Nodemailer transporter
│   └── templates/
│       ├── contactMail.js
│       ├── contactAutoReply.js
│       ├── productOrder.js        # UNUSED (old template)
│       ├── productOrderAdmin.js
│       ├── productOrderCustomer.js
│       ├── villaBooking.js        # UNUSED (old template)
│       ├── villaBookingAdmin.js
│       └── villaBookingCustomer.js
│
├── services/
│   └── mailService.js        # EMPTY - DEAD FILE
│
├── utils/
│   └── generateInvoice.js    # UNUSED - PDF invoice generator
│
└── uploads/
    ├── gallery/
    ├── products/
    └── ... (uploaded images)
```

---

## Installation

```bash
git clone <repo-url>
cd MaanjuFarmsBackend
npm install
```

**Note:** The app requires `axios` at runtime but it is missing from `package.json`. Install it manually:

```bash
npm install axios
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

# MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT secret key
JWT_SECRET=your-strong-secret-key-here

# Gmail SMTP credentials
EMAIL_USER=maanjoofarms@gmail.com
EMAIL_PASS=your-app-password

# Admin email for notifications
ADMIN_EMAIL=admin@maanjufarms.com

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## Running Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with nodemon |
| `npm test` | Not implemented — returns error |

---

## Authentication

- **Signup** — `POST /api/auth/signup` — Creates user (role = "admin" if email matches `ADMIN_EMAIL`, else "user")
- **Login** — `POST /api/auth/login` — Returns JWT token (expires: 1 day)
- **Get Profile** — `GET /api/auth/me` — Protected, returns user data

JWT format: `Authorization: Bearer <token>`

Token payload: `{ id, role }` — role is either `"user"` or `"admin"`.

---

## Authorization

Two roles:

| Role | Capabilities |
|---|---|
| `user` | Browse products/rooms, manage cart, place orders, book villas, view own orders/bookings |
| `admin` | All user capabilities + CRUD products, rooms, gallery; manage blocked pincodes; view all orders/bookings; update order status |

---

## API Base URL

**Development:** `http://localhost:5000/api`

**Production:** `https://your-domain.com/api`

---

## Error Responses

Standard error shape:

```json
{
  "success": false,
  "msg": "Error description"
}
```

Or for 500 errors:

```json
{
  "msg": "Server error",
  "error": "Detailed error message (leaked in dev)"
}
```

**HTTP Status Codes Used:**
- `200` — Success
- `201` — Created
- `400` — Bad Request / Validation Error
- `401` — Unauthorized (no token)
- `403` — Forbidden (not admin)
- `404` — Not Found
- `500` — Internal Server Error

---

## Database

- **MongoDB Atlas** (cloud)
- **Mongoose 8** ODM
- **Collections:** users, products, rooms, orders, bookings, galleries, blockedpincodes
- **Indexes:** Proper indexes on user references, status fields, payment status, created timestamps
- **TTL Index:** Booking `expiresAt` field auto-deletes pending bookings after 15 minutes

---

## File Uploads

- **Library:** Multer
- **Storage:** Local disk (`uploads/` folder)
- **Allowed:** Images only (by MIME type)
- **Max Size:** 5 MB
- **Folders:** `/uploads/products`, `/uploads/gallery`
- **Access:** Served statically at `/uploads/*`

---

## Security

⚠️ **Critical security issues exist.** See SECURITY_AUDIT.md for details.

Key risks:
- JWT secret is weak (`superSecretKeyChangeThis`)
- No rate limiting
- No helmet/security headers
- CORS is wide open
- Error messages leak internal details
- Email credentials stored in plaintext
- Missing CSRF protection
- No input sanitization/validation library
- Uploaded files not scanned for malware

---

## Logging

- **Method:** `console.log` / `console.error` — No structured logging
- **No:** Log levels, log files, log rotation, external logging service

---

## Monitoring

- **None implemented.** No health check endpoint, no metrics, no APM integration.

---

## Known Limitations

1. `axios` is used in pincode controller but missing from `package.json`
2. `services/mailService.js` is empty and unused
3. `mails/templates/productOrder.js` and `villaBooking.js` are old/unused
4. `utils/generateInvoice.js` is never called
5. Seed scripts have empty `MONGO_URI` strings — broken
6. No forgot password / reset password flow
7. No email verification on signup
8. No refresh token mechanism
9. Booking cancellation does not unblock room
10. Order cancellation does not restore product stock
11. `crypto` npm package in dependencies — should use Node.js built-in `crypto`
12. Villa booking email dispatcher references `data.address.email` which doesn't exist for bookings
13. No pagination on products listing
14. No search/filter on products (implemented only for rooms)

---

## Future Improvements

- Add rate limiting (express-rate-limit)
- Add security headers (helmet)
- Add request validation (zod, joi, express-validator)
- Add centralized error handling with custom error classes
- Add logger (winston/pino)
- Add health check endpoint
- Add graceful shutdown
- Add Docker support
- Add CI/CD pipeline
- Implement forgot/reset password
- Add refresh tokens
- Switch to httpOnly cookies for JWT storage
- Implement email verification
- Add product search & filtering
- Add pagination to all listing endpoints
- Add image optimization/resizing
- Migrate to cloud storage (S3/Cloudinary)
- Add unit and integration tests
- Add API documentation (Swagger/OpenAPI)
- Implement order cancellation with stock restoration
- Add booking cancellation room unblock
