# Project Structure

```
MaanjuFarmsBackend/
│
├── index.js                          # Application entry point
│                                     #   - Loads env, connects DB
│                                     #   - Configures middleware (CORS, static, JSON)
│                                     #   - Mounts all routes
│                                     #   - Global error handler
│                                     #   - Starts server
│
├── package.json                      # Dependencies & scripts
├── package-lock.json                 # Locked dependency tree
├── .env                              # Environment variables (gitignored)
├── .gitignore                        # Git ignore rules
├── readme                            # Dev notes (Stripe command — outdated)
│
├── trimmedProducts.json              # Seed data for products
├── seedProducts.js                   # BROKEN — empty MONGO_URI
├── seedVillas.js                     # BROKEN — empty MONGO_URI
│
├── config/
│   └── db.js                         # MongoDB connection via Mongoose
│
├── controllers/                      # Request handlers (business logic)
│   ├── authController.js             # signup, login, getMe
│   ├── productController.js          # CRUD products
│   ├── roomController.js             # CRUD rooms + availability check
│   ├── cartController.js             # addToCart, getCart, removeFromCart
│   ├── orderController.js            # getUserOrders, getAllOrders, updateOrder
│   ├── bookingController.js          # bookRoom, getUserBookings, getAllBookings, cancelBooking
│   ├── paymentController.js          # createProductOrder, createBookingOrder, verifyPayment, markPaymentFailed
│   ├── webhookController.js          # razorpayWebhook (payment.captured + payment.failed)
│   ├── galleryController.js          # CRUD gallery items
│   ├── contactController.js          # sendContactMail
│   └── pincodeController.js          # checkPincode, addBlockedPincode, getBlockedPincodes, deleteBlockedPincode
│
├── models/                           # Mongoose schemas
│   ├── User.js                       # name, email, password, role, cart
│   ├── Product.js                    # name, description, price, stock, image, category
│   ├── Room.js                       # name, category, type, price, status, image, isBlocked, blockedUntil
│   ├── Order.js                      # user, products, totalAmount, status, payment, address, tracking
│   ├── Booking.js                    # user, room, checkIn/Out, guests, totalAmount, status, payment, expiresAt(TTL)
│   ├── Gallery.js                    # title, imageUrl, createdBy
│   └── BlockedPincode.js             # pincode, district, state, reason
│
├── routers/                          # Route definitions
│   ├── auth.js                       # POST /signup, POST /login, GET /me
│   ├── product.js                    # CRUD /products (admin) + public GET
│   ├── room.js                       # CRUD /rooms (admin) + public GET + availability
│   ├── cart.js                       # GET /cart, POST /add, POST /remove
│   ├── order.js                      # GET /my-orders, GET /all, PUT /update/:id
│   ├── booking.js                    # POST /, GET /my-bookings, GET / (admin)
│   ├── payment.js                    # POST /product-order, /booking-order, /verify-payment, /payment-failed
│   ├── gallery.js                    # CRUD /gallery (admin) + public GET
│   ├── contactRoutes.js              # POST /contact
│   └── pincodeRoutes.js              # GET /check/:pin, CRUD /blocked (admin)
│
├── middleware/
│   ├── authMiddleware.js             # JWT verification + admin role check
│   └── multerMiddleware.js           # Multer config (disk storage, image filter, 5MB limit)
│
├── services/
│   └── mailService.js                # EMPTY — DEAD FILE (0 lines)
│
├── mails/
│   ├── sendMail.js                   # Nodemailer Gmail transporter
│   ├── mailTypes.js                  # Email dispatcher (PRODUCT_ORDER, VILLA_BOOKING, CONTACT)
│   └── templates/
│       ├── contactMail.js            # Admin notification for contact form
│       ├── contactAutoReply.js       # Auto-reply to contact form submitter
│       ├── productOrder.js           # UNUSED — old template
│       ├── productOrderAdmin.js      # Admin notification for new order
│       ├── productOrderCustomer.js   # Customer order confirmation
│       ├── villaBooking.js           # UNUSED — old template
│       ├── villaBookingAdmin.js      # Admin notification for new booking
│       └── villaBookingCustomer.js   # Customer booking confirmation
│
├── utils/
│   └── generateInvoice.js            # UNUSED — PDF invoice generator (PDFKit)
│
└── uploads/                          # Uploaded files (gitignored)
    ├── (root images)                 # 8 uploaded images
    ├── gallery/                      # 1 gallery image
    └── products/                     # 14 product images
```

## File Status Summary

| Status | Files | Action |
|---|---|---|
| ✅ Used | 39 files | Core application files |
| 🗑️ Dead/Unused | 4 files | Delete: `services/mailService.js`, `mails/templates/productOrder.js`, `mails/templates/villaBooking.js`, `utils/generateInvoice.js` |
| ⚠️ Outdated | 1 file | Update: `readme` (contains Stripe command, app uses Razorpay) |
| 🐛 Broken | 2 files | Fix: `seedProducts.js`, `seedVillas.js` (empty MONGO_URI) |
