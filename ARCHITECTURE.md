# Architecture Document

## Project Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser/Frontend)                    │
│                        http://localhost:5173                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP/JSON
                           │ Authorization: Bearer <JWT>
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Express Application (index.js)                    │
│                                                                      │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐    │
│  │  CORS   │  │  Static  │  │ Raw Body  │  │   JSON Parser    │    │
│  │ (wild)  │  │ /uploads │  │ (webhook) │  │                  │    │
│  └─────────┘  └──────────┘  └───────────┘  └──────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                        Routes                                │    │
│  │  /api/auth → auth.js                                         │    │
│  │  /api/products → product.js                                  │    │
│  │  /api/rooms → room.js                                        │    │
│  │  /api/cart → cart.js                                         │    │
│  │  /api/orders → order.js                                      │    │
│  │  /api/bookings → booking.js                                  │    │
│  │  /api/gallery → gallery.js                                   │    │
│  │  /api/payment → payment.js                                   │    │
│  │  /api/contact → contactRoutes.js                             │    │
│  │  /api/pincode → pincodeRoutes.js                             │    │
│  │  /api/payment/webhook → webhookController                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Error Handler (global)                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Controllers Layer                           │
│                                                                      │
│  authController → JWT + bcrypt                                       │
│  productController → MongoDB CRUD                                    │
│  roomController → MongoDB CRUD + Booking overlap check               │
│  cartController → User.cart array operations                         │
│  orderController → Order queries + updates                           │
│  bookingController → Booking with transactions + overlap prevention  │
│  paymentController → Razorpay API + order creation + verification    │
│  webhookController → Razorpay webhook + inventory management        │
│  galleryController → Gallery CRUD                                    │
│  contactController → Send emails via nodemailer                      │
│  pincodeController → India Post API + blocked pincode CRUD           │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Services / Utilities Layer                      │
│                                                                      │
│  mailTypes.js → Email dispatcher by type                             │
│  sendMail.js → Nodemailer transporter                                │
│  generateInvoice.js → PDFKit invoice (UNUSED)                        │
│  mailService.js → EMPTY (DEAD FILE)                                  │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Data Layer (Mongoose)                        │
│                                                                      │
│  User, Product, Room, Order, Booking, Gallery, BlockedPincode        │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         External Services                            │
│                                                                      │
│  ┌─────────────┐  ┌────────────────┐  ┌────────────────────────┐    │
│  │  MongoDB    │  │   Razorpay     │  │   Gmail SMTP           │    │
│  │  Atlas      │  │   Payments     │  │   (Nodemailer)         │    │
│  └─────────────┘  └────────────────┘  └────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │   India Post API (api.postalpincode.in)                      │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow

```
Client Request
    │
    ▼
Express receives request
    │
    ├─ 1. CORS middleware (all origins allowed)
    ├─ 2. Static file middleware (serves /uploads)
    ├─ 3. Webhook route (if POST /api/payment/webhook → raw body parser)
    ├─ 4. JSON body parser (express.json())
    │
    ▼
Route matched (e.g. POST /api/products)
    │
    ├─ 5. authMiddleware (if protected) → verify JWT → req.user
    ├─ 6. adminMiddleware (if admin-only) → check role
    ├─ 7. multer middleware (if file upload) → parse multipart → req.file
    │
    ▼
Controller function
    │
    ├─ 8. Validate request body (inline, no validation library)
    ├─ 9. Business logic (DB queries, external API calls)
    ├─10. Send response (JSON)
    │
    ▼
Error Handler (if error thrown/next(err))
    │
    ▼
500 { message: "Something went wrong" }
```

---

## Authentication Flow

```
┌─────────┐         ┌──────────┐         ┌──────────────────┐
│  Client │         │  Server  │         │    MongoDB       │
└────┬────┘         └────┬─────┘         └────────┬─────────┘
     │                   │                        │
     │  POST /auth/signup│                        │
     │  {name,email,pass}│                        │
     ├──────────────────►│                        │
     │                   │  Check existing        │
     │                   │───────────────────────►│
     │                   │◄───────────────────────│
     │                   │  Hash password(bcrypt) │
     │                   │  Create user           │
     │                   │───────────────────────►│
     │  {msg, role}      │                        │
     │◄──────────────────┤                        │
     │                   │                        │
     │  POST /auth/login │                        │
     │  {email,password} │                        │
     ├──────────────────►│                        │
     │                   │  Find user             │
     │                   │───────────────────────►│
     │                   │◄───────────────────────│
     │                   │  Compare password      │
     │                   │  Sign JWT {id,role}    │
     │  {token, user}    │                        │
     │◄──────────────────┤                        │
     │                   │                        │
     │  GET /auth/me     │                        │
     │  Authorization:   │                        │
     │  Bearer <token>   │                        │
     ├──────────────────►│                        │
     │                   │  Verify JWT            │
     │                   │  Find user by id       │
     │                   │───────────────────────►│
     │  {user}           │◄───────────────────────│
     │◄──────────────────┤                        │
```

---

## Middleware Execution Order

```
1. cors() ───────────────── Wide open, no origin restrictions
2. express.static("/uploads") ── Serves uploaded files
3. express.raw() ── Only for webhook route (before JSON parser)
4. express.json() ── Parses JSON bodies for all other routes
5. authMiddleware ── Verifies JWT, sets req.user
6. adminMiddleware ── Checks req.user.role === "admin"
7. multer ── Parses multipart form-data for file uploads
8. Controller logic
9. Global error handler (catch-all)
```

---

## Error Handling Flow

```
Controller throws error
    │
    ▼
try/catch in controller
    │
    ├─ Known error → res.status(400|401|403|404).json()
    └─ Unknown error → res.status(500).json({ msg: "Server error" })
                        OR
                        Error leaks to next(err) in Express
    │
    ▼
Global error handler (index.js line 60)
    │
    ▼
console.error("🔥 ERROR:", err)
res.status(500).json({ message: "Something went wrong" })
```

**Note:** Express 5 has built-in async error handling — rejected promises in async route handlers are automatically forwarded to the error middleware. The global handler does catch these.

---

## Database Flow

```
Controller
    │
    ▼
Mongoose Model.method()
    │
    ├─ Model.find() / findOne() / findById()
    ├─ Model.create() / save()
    ├─ Model.findByIdAndUpdate() / findOneAndUpdate()
    ├─ Model.findByIdAndDelete()
    ├─ Model.countDocuments()
    │
    ▼
MongoDB Atlas (cloud)
    │
    ▼
Response returned
```

Transactions are used in:
- `bookingController.bookRoom()` — prevents race conditions on room booking
- `webhookController.razorpayWebhook()` — ensures atomic payment processing + inventory

---

## File Upload Flow

```
Client sends multipart/form-data
    │
    ▼
multer middleware (multerMiddleware.js)
    │
    ├─ Storage: diskStorage (uploads/<folder>/)
    ├─ Filename: Date.now() + "-" + random(1e9) + extension
    ├─ Filter: only images (by MIME type)
    ├─ Limits: 5MB max file size
    │
    ▼
req.file populated with file metadata
    │
    ▼
Controller constructs path: /uploads/<folder>/<filename>
    │
    ▼
Path saved to MongoDB document
    │
    ▼
Express serves file statically via app.use("/uploads", ...)
```

---

## Email Flow

```
Controller triggers email (e.g. payment success)
    │
    ▼
sendMailByType("PRODUCT_ORDER" | "VILLA_BOOKING" | "CONTACT", data)
    │
    ▼
mailTypes.js determines template and recipients
    │
    ├─ PRODUCT_ORDER → customer confirmation + admin notification
    ├─ VILLA_BOOKING → customer confirmation + admin notification  
    └─ CONTACT → admin notification + customer auto-reply
    │
    ▼
sendMail.js (Nodemailer transporter)
    │
    ├─ service: Gmail
    ├─ auth: EMAIL_USER + EMAIL_PASS from .env
    │
    ▼
Email sent via Gmail SMTP
```

---

## Payment Flow

```
┌─────────┐              ┌──────────┐              ┌──────────┐
│  Client │              │  Server  │              │ Razorpay │
└────┬────┘              └────┬─────┘              └────┬─────┘
     │                        │                        │
     │  POST /payment/        │                        │
     │  product-order         │                        │
     ├───────────────────────►│                        │
     │                        │  Validate cart/room    │
     │                        │  Create Order/Booking  │
     │                        │  Create Razorpay Order │
     │                        ├──────────────────────►│
     │                        │◄───────────────────────│
     │  {key, orderId, amount}│                        │
     │◄───────────────────────┤                        │
     │                        │                        │
     │  Client opens Razorpay │                        │
     │  Payment UI            │                        │
     ├────────────────────────────────────────────────►│
     │◄────────────────────────────────────────────────┤
     │                        │                        │
     │  POST /payment/        │                        │
     │  verify-payment        │                        │
     │  {razorpay_order_id,   │                        │
     │   razorpay_payment_id, │                        │
     │   razorpay_signature}  │                        │
     ├───────────────────────►│                        │
     │                        │  Verify signature      │
     │                        │  Update Order/Booking  │
     │                        │  Reduce stock /        │
     │                        │  Clear cart /          │
     │                        │  Send emails           │
     │  {success: true, type} │                        │
     │◄───────────────────────┤                        │
     │                        │                        │
     │  ── OR ── via Webhook:│                        │
     │                        │                        │
     │                        │  POST /payment/        │
     │                        │  webhook               │
     │                        │◄───────────────────────│
     │                        │  Verify HMAC signature │
     │                        │  Parse event           │
     │                        │  Update DB + inventory │
     │                        │  Send emails           │
```

---

## Background Jobs / Scheduler

- **None implemented.**
- MongoDB TTL index on `Booking.expiresAt` auto-deletes pending bookings after 15 minutes (acts as a primitive scheduler)
- No cron jobs, no queue system, no worker processes
