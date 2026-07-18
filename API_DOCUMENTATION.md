# API Documentation

**Base URL:** `http://localhost:5000/api`

**Content-Type:** `application/json`

**Authentication:** `Authorization: Bearer <JWT_TOKEN>`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Products](#2-products)
3. [Rooms / Villas](#3-rooms--villas)
4. [Cart](#4-cart)
5. [Orders](#5-orders)
6. [Bookings](#6-bookings)
7. [Payments](#7-payments)
8. [Gallery](#8-gallery)
9. [Contact](#9-contact)
10. [Pincode](#10-pincode)
11. [Health Check](#11-health-check)

---

## 1. Authentication

### POST /api/auth/signup

Register a new user.

**Auth:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
| Field | Required | Type | Notes |
|---|---|---|---|
| name | ✅ | string | |
| email | ✅ | string | Must be unique |
| password | ✅ | string | No minimum length enforced |

**Success Response (201):**
```json
{
  "msg": "User created successfully",
  "role": "user"
}
```
*Role returns `"admin"` if email matches `ADMIN_EMAIL` env var.*

**Error Responses:**
- `400` — `{ "msg": "User already exists" }`
- `500` — `{ "msg": "Server error", "error": "..." }`

**Database Ops:** Create user in `users` collection

**Frontend Page:** Signup/Register page

---

### POST /api/auth/login

Authenticate user and return JWT.

**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` — `{ "msg": "Invalid credentials" }` (wrong email or password)
- `500` — `{ "msg": "Server error", "error": "..." }`

**Token Payload:** `{ id, role }`
**Token Expiry:** 1 day

**Database Ops:** Find user by email

**Frontend Page:** Login page

**Security Notes:**
- No rate limiting on login attempts (brute force possible)
- Returns same error for wrong email vs wrong password (good)
- No refresh token mechanism

---

### GET /api/auth/me

Get current authenticated user profile.

**Auth:** Required (Bearer token)

**Success Response (200):**
```json
{
  "user": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "cart": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```
*Password field excluded via `.select("-password")`*

**Error Responses:**
- `401` — `{ "msg": "No token, authorization denied" }`
- `401` — `{ "msg": "Token is not valid" }`
- `500` — `{ "msg": "Server error" }`

**Frontend Page:** User profile / dashboard

---

## 2. Products

### GET /api/products

Get all products.

**Auth:** None

**Query Parameters:** None (no pagination, no search, no filtering supported)

**Success Response (200):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "name": "A2 Cow Ghee",
    "description": "Pure homemade A2 Cow Ghee...",
    "price": 2200,
    "stock": 120,
    "image": "https://5.imimg.com/data5/.../buffalo-desi-ghee.jpg",
    "category": "Dairy",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Performance Notes:** Returns ALL products — no pagination. Will become slow as inventory grows.

**Frontend Page:** Shop / Products listing page

---

### GET /api/products/:id

Get single product by ID.

**Auth:** None

**Path Parameters:**
- `id` — MongoDB ObjectId

**Success Response (200):**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
  "name": "A2 Cow Ghee",
  "description": "Pure homemade A2 Cow Ghee...",
  "price": 2200,
  "stock": 120,
  "image": "https://...",
  "category": "Dairy",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404` — `{ "msg": "Product not found" }`

**Frontend Page:** Product detail page

---

### POST /api/products

Create a new product (admin only).

**Auth:** Required (admin)

**Headers:** `Content-Type: multipart/form-data`

**Request Body (FormData):**
| Field | Type | Required |
|---|---|---|
| name | string | ✅ |
| description | string | ❌ |
| price | number | ✅ |
| stock | number | ✅ |
| category | string | ✅ |
| image | file | ❌ (or use `image` field as URL string) |

**Success Response (201):**
```json
{
  "msg": "Product added",
  "product": { "name": "...", ... }
}
```

**Frontend Page:** Admin product management / add product form

---

### PUT /api/products/:id

Update a product (admin only).

**Auth:** Required (admin)

**Headers:** `Content-Type: multipart/form-data`

**Path Parameters:** `id` — MongoDB ObjectId

**Request Body (FormData):** Any subset of: name, description, price, stock, category, image (file)

**Success Response (200):**
```json
{
  "msg": "Product updated",
  "product": { "...updated fields..." }
}
```

**Frontend Page:** Admin product edit form

---

### DELETE /api/products/:id

Delete a product (admin only).

**Auth:** Required (admin)

**Success Response (200):**
```json
{ "msg": "Product deleted" }
```

**Error Responses:**
- `404` — `{ "msg": "Product not found" }`

**Frontend Page:** Admin product management

---

## 3. Rooms / Villas

### GET /api/rooms

Get all rooms with filtering, search, and pagination.

**Auth:** None

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| category | string | — | Filter by category (room/villa) |
| type | string | — | Filter by type (single/double/suite/villa/cottage) |
| minPrice | number | — | Minimum price filter |
| maxPrice | number | — | Maximum price filter |
| search | string | — | Search by name (case-insensitive regex) |

**Success Response (200):**
```json
{
  "total": 25,
  "page": 1,
  "pages": 3,
  "rooms": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
      "name": "Thar Olive Cottage",
      "category": "villa",
      "type": "cottage",
      "price": 2500,
      "status": "available",
      "description": "A cozy cottage...",
      "image": "https://...",
      "isBlocked": false,
      "blockedUntil": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Frontend Page:** Villas listing page, search results

---

### GET /api/rooms/:id

Get single room by ID.

**Auth:** None

**Success Response (200):**
```json
{
  "_id": "...",
  "name": "Thar Olive Cottage",
  "category": "villa",
  "type": "cottage",
  "price": 2500,
  "status": "available",
  "description": "...",
  "image": "...",
  "isBlocked": false,
  "blockedUntil": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Frontend Page:** Villa detail page

---

### GET /api/rooms/:id/availability

Check if room is available for given dates.

**Auth:** None

**Path Parameters:** `id` — Room ObjectId

**Query Parameters:**
| Param | Required | Format | Example |
|---|---|---|---|
| checkIn | ✅ | YYYY-MM-DD | 2024-12-25 |
| checkOut | ✅ | YYYY-MM-DD | 2024-12-27 |

**Success Response (200):**
```json
{
  "available": true
}
```

**Error Responses:**
- `400` — `{ "msg": "Dates required" }`

**Business Logic:** Checks for overlapping bookings with status "pending" or "confirmed".

**Frontend Page:** Villa booking widget / date picker

---

### POST /api/rooms

Create a new room (admin only).

**Auth:** Required (admin)

**Request Body:**
```json
{
  "name": "New Room",
  "category": "villa",
  "type": "cottage",
  "price": 3000,
  "status": "available",
  "description": "A beautiful villa",
  "image": "https://..."
}
```

**Success Response (201):**
```json
{
  "msg": "Room added",
  "room": { "...room data..." }
}
```

**Frontend Page:** Admin villa management

---

### PUT /api/rooms/:id

Update a room (admin only).

**Auth:** Required (admin)

**Success Response (200):**
```json
{
  "msg": "Room updated",
  "room": { "...updated room..." }
}
```

**Frontend Page:** Admin villa edit

---

### DELETE /api/rooms/:id

Delete a room (admin only).

**Auth:** Required (admin)

**Notes:** Cannot delete if room has active (pending/confirmed) bookings.

**Error Responses:**
- `400` — `{ "msg": "Cannot delete room with active bookings" }`

**Frontend Page:** Admin villa management

---

## 4. Cart

### GET /api/cart

Get authenticated user's cart with populated product details.

**Auth:** Required (user)

**Success Response (200):**
```json
{
  "cart": [
    {
      "product": {
        "_id": "64a1b2c3...",
        "name": "A2 Cow Ghee",
        "price": 2200,
        "image": "https://...",
        "stock": 120
      },
      "quantity": 2
    }
  ]
}
```

**Frontend Page:** Cart page / checkout

---

### POST /api/cart/add

Add product to cart.

**Auth:** Required (user)

**Request Body:**
```json
{
  "productId": "64a1b2c3d4e5f6a7b8c9d0e2",
  "quantity": 1
}
```

**Validation Rules:**
| Field | Required | Type |
|---|---|---|
| productId | ✅ | string (MongoDB ObjectId) |
| quantity | ❌ (defaults to undefined) | number |

**Business Logic:** If product already in cart, increments quantity. Otherwise adds new entry.

**Success Response (200):**
```json
{
  "msg": "Product added to cart",
  "cart": [ { "product": "...", "quantity": 1 } ]
}
```

**Frontend Page:** Product detail page "Add to Cart" button

---

### POST /api/cart/remove

Remove product from cart.

**Auth:** Required (user)

**Request Body:**
```json
{
  "productId": "64a1b2c3d4e5f6a7b8c9d0e2"
}
```

**Success Response (200):**
```json
{
  "msg": "Product removed from cart",
  "cart": []
}
```

**Frontend Page:** Cart page remove button

---

## 5. Orders

### GET /api/orders/my-orders

Get authenticated user's orders.

**Auth:** Required (user)

**Success Response (200):**
```json
[
  {
    "_id": "64a1b2c3...",
    "user": "64a1b2c3...",
    "products": [
      {
        "product": {
          "_id": "...",
          "name": "A2 Cow Ghee",
          "price": 2200,
          "image": "https://..."
        },
        "quantity": 2,
        "_id": "..."
      }
    ],
    "totalAmount": 4400,
    "status": "confirmed",
    "paymentStatus": "paid",
    "razorpayOrderId": "order_xxxxxxxx",
    "razorpayPaymentId": "pay_xxxxxxxx",
    "deliveryAddress": {
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "street": "123 Main St",
      "apartment": "",
      "city": "Jaipur",
      "district": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302001"
    },
    "trackingId": "",
    "courierName": "",
    "emailSent": true,
    "webhookProcessed": true,
    "createdAt": "...",
    "updatedAt": "...",
    "formattedAddress": "123 Main St, Jaipur, Jaipur, Rajasthan - 302001"
  }
]
```

**Frontend Page:** User order history / my orders page

---

### GET /api/orders/all

Get all orders (admin only).

**Auth:** Required (admin)

**Success Response:**
Same structure as `/my-orders` but all users' orders, sorted by newest first.

**Frontend Page:** Admin order management dashboard

---

### PUT /api/orders/update/:id

Update order status, tracking, and payment status (admin only).

**Auth:** Required (admin)

**Path Parameters:** `id` — Order ObjectId

**Request Body:**
```json
{
  "status": "shipped",
  "trackingId": "TRACK123456",
  "courierName": "Delhivery",
  "paymentStatus": "paid"
}
```

**All fields are optional.** Only provided fields are updated.

**Statuses:** pending, confirmed, payment_failed, shipped, delivered, cancelled

**Payment Statuses:** pending, paid, failed

**Auto Behavior:** If status = "shipped", `shippedAt` is auto-set to current date.

**Success Response (200):**
```json
{
  "msg": "Order updated successfully",
  "order": { "...updated order..." }
}
```

**Frontend Page:** Admin order detail / edit page

---

## 6. Bookings

### POST /api/bookings

Create a new booking (authenticated user).

**Auth:** Required (user)

**Request Body:**
```json
{
  "roomId": "64a1b2c3d4e5f6a7b8c9d0e3",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27"
}
```

**Validation Rules:**
| Field | Required | Notes |
|---|---|---|
| roomId | ✅ | Must be valid ObjectId |
| checkIn | ✅ | YYYY-MM-DD format |
| checkOut | ✅ | Must be after checkIn |

**Business Logic:**
1. Checks room exists and is not under maintenance
2. Validates checkOut > checkIn
3. Checks for overlapping bookings using MongoDB transaction
4. Creates booking with status "pending"
5. Booking auto-expires after 15 minutes via TTL index

**Success Response (201):**
```json
{
  "msg": "Booking created",
  "booking": {
    "_id": "...",
    "user": "...",
    "room": "...",
    "checkIn": "2024-12-25T00:00:00.000Z",
    "checkOut": "2024-12-27T23:59:59.000Z",
    "status": "pending",
    "paymentStatus": "pending",
    "expiresAt": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**
- `400` — `{ "msg": "Missing booking details" }`
- `404` — `{ "msg": "Room not found" }`
- `400` — `{ "msg": "Room under maintenance" }`
- `400` — `{ "msg": "Invalid date range" }`
- `400` — `{ "msg": "Room already booked for selected dates" }`

**Frontend Page:** Villa booking form

---

### GET /api/bookings/my-bookings

Get authenticated user's bookings.

**Auth:** Required (user)

**Success Response (200):**
```json
[
  {
    "_id": "...",
    "user": "...",
    "room": { "...populated room data..." },
    "checkIn": "...",
    "checkOut": "...",
    "guests": 1,
    "guestDetails": [],
    "totalAmount": 5000,
    "status": "confirmed",
    "paymentStatus": "paid",
    "createdAt": "..."
  }
]
```

**Frontend Page:** User my bookings page

---

### GET /api/bookings

Get all bookings (admin only).

**Auth:** Required (admin)

**Success Response:** Same as above but all users' bookings, with user data populated.

**Frontend Page:** Admin bookings dashboard

---

### POST /api/bookings/cancel/:id

Cancel a booking (owner only).

**Auth:** Required (user — must own the booking)

**Path Parameters:** `id` — Booking ObjectId

**Business Logic:**
1. Finds booking by ID
2. Verifies `booking.user === req.user.id` (owner check)
3. Sets status = "cancelled", paymentStatus = "failed"
4. **Does NOT unblock the room** (room remains blocked if it was blocked during payment order)

**Success Response (200):**
```json
{
  "msg": "Booking cancelled"
}
```

**⚠️ Bug:** Room is NOT unblocked when booking is cancelled.

**Frontend Page:** User my bookings → cancel button

---

## 7. Payments

### POST /api/payment/product-order

Create Razorpay order for product purchase.

**Auth:** Required (user)

**Request Body:**
```json
{
  "address": {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "Jaipur",
    "district": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "key": "rzp_test_xxxxxxxxxxxx",
  "orderId": "order_xxxxxxxxx",
  "amount": 440000,
  "currency": "INR"
}
```
*Amount is in paise (multiply by 100)*

**Frontend Flow:**
1. Call this endpoint
2. Use returned `key`, `orderId`, `amount` to open Razorpay checkout
3. On payment success, call `/verify-payment`

**Frontend Page:** Checkout page

---

### POST /api/payment/booking-order

Create Razorpay order for villa booking.

**Auth:** Required (user)

**Request Body:**
```json
{
  "villaId": "64a1b2c3d4e5f6a7b8c9d0e3",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "guests": 2,
  "guestDetails": [
    { "name": "John Doe", "age": 30, "gender": "male" },
    { "name": "Jane Doe", "age": 28, "gender": "female" }
  ]
}
```

**Business Logic:**
1. Validates room exists and is not blocked
2. Calculates total = nights × room price
3. Temporarily blocks room for 1 minute (sets `isBlocked = true`, `blockedUntil = Date.now() + 60s`)
4. Creates booking with status "pending"
5. Creates Razorpay order

**Success Response (200):**
```json
{
  "success": true,
  "key": "rzp_test_xxxxxxxxxxxx",
  "orderId": "order_xxxxxxxxx",
  "amount": 500000,
  "currency": "INR"
}
```

**Frontend Page:** Villa booking checkout

---

### POST /api/payment/verify-payment

Verify payment signature after successful Razorpay payment.

**Auth:** None (public — signature is the auth)

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxx",
  "razorpay_signature": "signature_string"
}
```

**Business Logic:**
1. Generates HMAC SHA256 signature from `order_id|payment_id` using `RAZORPAY_KEY_SECRET`
2. Compares with provided signature
3. Finds Order or Booking by `razorpayOrderId`
4. Updates payment status, reduces stock (for products), clears cart
5. Sends confirmation emails

**Success Response (200):**
```json
{
  "success": true,
  "type": "product"
}
```
*Type is either "product" or "booking"*

**⚠️ Security Note:** Anyone who knows a valid `razorpay_order_id` and `razorpay_payment_id` could call this endpoint. However, signature verification protects against forgery.

**Frontend Page:** Payment success callback page

---

### POST /api/payment/payment-failed

Mark payment as failed.

**Auth:** Required (user)

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxxxxxxxx"
}
```

**Business Logic:**
1. Finds Order or Booking by `razorpayOrderId`
2. If paymentStatus is not "paid", marks as "failed"
3. For bookings: unblocks the room

**Success Response (200):**
```json
{
  "success": true,
  "type": "product"
}
```

**Frontend Page:** Payment failure callback page

---

### POST /api/payment/webhook

Razorpay webhook endpoint (server-to-server).

**Auth:** Razorpay HMAC signature (x-razorpay-signature header)

**Body:** Raw JSON from Razorpay

**Events Handled:**
- `payment.captured` — Processes order/booking, reduces stock, clears cart, unblocks room
- `payment.failed` — Marks payment as failed, unblocks room for bookings

**Business Logic:**
1. Validates HMAC signature using `RAZORPAY_WEBHOOK_SECRET`
2. For `payment.captured`:
   - Uses MongoDB transaction for atomicity
   - Updates Order/Booking payment status
   - Reduces product stock (with insufficient stock check)
   - Clears user cart
   - Unblocks room for bookings
   - Does NOT send emails (email sending is incomplete in webhook path)
3. For `payment.failed`:
   - Updates Order/Booking status
   - Unblocks room for bookings

**⚠️ Bug:** Webhook handler for `payment.captured` does NOT send email notifications. Only the `/verify-payment` endpoint sends emails.

**⚠️ Bug:** Booking findOneAndUpdate returns null (not assigned to variable) — the `booking` variable on line 302 is always `null` because `findOneAndUpdate` result is not captured properly.

---

## 8. Gallery

### GET /api/gallery

Get all gallery items.

**Auth:** None

**Success Response (200):**
```json
[
  {
    "_id": "...",
    "title": "Farm View",
    "imageUrl": "/uploads/gallery/1777895631323-664693720.jpeg",
    "createdBy": "64a1b2c3...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

**Frontend Page:** Gallery page

---

### POST /api/gallery

Add gallery item (admin only).

**Auth:** Required (admin)

**Headers:** `Content-Type: multipart/form-data`

**Request Body (FormData):**
- `title` (string, required)
- `image` (file) OR `imageUrl` (string)

**Success Response (201):** The created gallery item object

**Frontend Page:** Admin gallery management

---

### PUT /api/gallery/:id

Update gallery item (admin only).

**Auth:** Required (admin)

**Headers:** `Content-Type: multipart/form-data`

**Request Body (FormData):** Any of: title (string), image (file), imageUrl (string)

**Success Response (200):** Updated gallery item

**Frontend Page:** Admin gallery edit

---

### DELETE /api/gallery/:id

Delete gallery item (admin only).

**Auth:** Required (admin)

**Success Response (200):** `{ "message": "Gallery item deleted" }`

**Frontend Page:** Admin gallery management

---

## 9. Contact

### POST /api/contact

Submit contact form.

**Auth:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "subject": "Product Inquiry",
  "message": "I would like to know more about your products."
}
```

**Validation Rules:** All 5 fields required.

**Business Logic:**
1. Sends email to admin with contact details
2. Sends auto-reply to user

**Success Response (200):**
```json
{
  "message": "Message sent successfully"
}
```

**Frontend Page:** Contact Us page

---

## 10. Pincode

### GET /api/pincode/check/:pin

Validate a pincode using India Post API.

**Auth:** None

**Path Parameters:** `pin` — 6-digit pincode

**Success Response (200):**
```json
{
  "success": true,
  "blocked": false,
  "data": {
    "pincode": "302001",
    "district": "Jaipur",
    "state": "Rajasthan",
    "city": "Jaipur"
  }
}
```

**If blocked:**
```json
{
  "success": false,
  "blocked": true,
  "message": "Delivery not available in your area",
  "data": { "pincode": "302001", ... }
}
```

**Error Responses:**
- `400` — `{ "success": false, "message": "Invalid pincode format" }`
- `404` — `{ "success": false, "message": "Invalid pincode" }`

**External API:** India Post API (api.postalpincode.in)

**Frontend Page:** Checkout page address form (pincode validation on blur)

---

### GET /api/pincode/blocked

Get all blocked pincodes (admin only).

**Auth:** Required (admin)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "pincode": "123456", "district": "...", "state": "...", "reason": "Delivery not available" }
  ]
}
```

**Frontend Page:** Admin pincode management

---

### POST /api/pincode/blocked

Block a pincode (admin only).

**Auth:** Required (admin)

**Request Body:**
```json
{
  "pincode": "123456",
  "district": "Some District",
  "state": "Some State",
  "reason": "Delivery not available"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Pincode blocked successfully",
  "data": { "pincode": "123456", ... }
}
```

**Frontend Page:** Admin pincode management

---

### DELETE /api/pincode/blocked/:id

Remove a blocked pincode (admin only).

**Auth:** Required (admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pincode removed successfully"
}
```

**Frontend Page:** Admin pincode management

---

## 11. Health Check

### GET /api/test-pincode

Simple health check / test endpoint.

**Auth:** None

**Success Response (200):**
```json
{
  "success": true
}
```

**Frontend Page:** Not intended for frontend use
