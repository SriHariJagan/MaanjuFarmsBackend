# Database Schema

**Database:** MongoDB (Atlas)
**ODM:** Mongoose 8
**Connection:** `config/db.js`

---

## Users

**Collection:** `users`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `name` | String | ✅ | — | User's full name |
| `email` | String | ✅ | — | Unique email address |
| `password` | String | ✅ | — | bcrypt-hashed password |
| `role` | String | ❌ | `"user"` | Enum: `"user"`, `"admin"` |
| `cart` | Array | ❌ | `[]` | Cart items array |
| `cart[].product` | ObjectId (ref: Product) | — | — | Product reference |
| `cart[].quantity` | Number | — | `1` | Quantity of product |
| `createdAt` | Date | Auto | — | Timestamp (Mongoose) |
| `updatedAt` | Date | Auto | — | Timestamp (Mongoose) |

**Indexes:**
- `email` — unique index (defined in schema)
- `_id` — default primary key

**Relationships:**
- `cart[].product` → `products` collection (via ObjectId reference)

**Hooks:** None
**Virtuals:** None

---

## Products

**Collection:** `products`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `name` | String | ✅ | — | Product name |
| `description` | String | ❌ | — | Product description |
| `price` | Number | ✅ | — | Price in INR |
| `stock` | Number | ✅ | — | Available quantity |
| `image` | String | ❌ | — | Image URL or path |
| `category` | String | ✅ | — | Product category (e.g., "Dairy", "Spices") |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

**Indexes:**
- `_id` — default

**Relationships:** None (referenced by Orders, Cart)
**Missing:** No index on `category` for filtering

---

## Rooms / Villas

**Collection:** `rooms`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `name` | String | ✅ | — | Room/villa name |
| `category` | String | ❌ | `"room"` | Enum: `"room"`, `"villa"` |
| `type` | String | ❌ | `"single"` | Enum: `"single"`, `"double"`, `"suite"`, `"villa"`, `"cottage"` |
| `price` | Number | ✅ | — | Price per night in INR |
| `status` | String | ❌ | `"available"` | Enum: `"available"`, `"maintenance"` |
| `description` | String | ❌ | — | Room description |
| `image` | String | ❌ | — | Image URL |
| `isBlocked` | Boolean | ❌ | `false` | Temporary block during payment |
| `blockedUntil` | Date | ❌ | `null` | When temporary block expires |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

**Indexes:**
- `_id` — default
- `isBlocked` — defined in schema
- `blockedUntil` — defined in schema

**Relationships:**
- Referenced by `Booking.room`

---

## Orders

**Collection:** `orders`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `user` | ObjectId (ref: User) | ✅ | — | Who placed the order |
| `products` | Array | ✅ | — | Array of ordered products |
| `products[].product` | ObjectId (ref: Product) | ✅ | — | Product reference |
| `products[].quantity` | Number | ✅ | — | Quantity ordered (min: 1) |
| `totalAmount` | Number | ✅ | — | Total order amount (min: 0) |
| `status` | String | ❌ | `"pending"` | Enum: pending, confirmed, payment_failed, shipped, delivered, cancelled |
| `paymentStatus` | String | ❌ | `"pending"` | Enum: pending, paid, failed |
| `razorpayOrderId` | String | ❌ | — | Razorpay order ID (unique, sparse) |
| `razorpayPaymentId` | String | ❌ | — | Razorpay payment ID (unique, sparse) |
| `razorpaySignature` | String | ❌ | `""` | Razorpay signature |
| `paidAt` | Date | ❌ | — | When payment was made |
| `trackingId` | String | ❌ | `""` | Courier tracking number |
| `courierName` | String | ❌ | `""` | Courier service name |
| `shippedAt` | Date | ❌ | — | When order was shipped |
| `deliveryAddress` | Object | ❌ | — | Nested address object |
| `deliveryAddress.name` | String | ❌ | `""` | Recipient name |
| `deliveryAddress.phone` | String | ❌ | `""` | Phone number |
| `deliveryAddress.email` | String | ❌ | `""` | Email |
| `deliveryAddress.street` | String | ❌ | `""` | Street address |
| `deliveryAddress.apartment` | String | ❌ | `""` | Apartment/suite |
| `deliveryAddress.city` | String | ❌ | `""` | City |
| `deliveryAddress.district` | String | ❌ | `""` | District |
| `deliveryAddress.state` | String | ❌ | `""` | State |
| `deliveryAddress.pincode` | String | ❌ | `""` | Pincode |
| `emailSent` | Boolean | ❌ | `false` | Whether confirmation email was sent |
| `webhookProcessed` | Boolean | ❌ | `false` | Whether webhook processed this |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

**Indexes:**
- `{ user: 1, createdAt: -1 }` — Compound index for user order queries
- `{ paymentStatus: 1, status: 1 }` — Compound index for status queries
- `razorpayOrderId` — Unique sparse index

**Virtuals:**
- `formattedAddress` — Concatenates address fields into a single string

**Relationships:**
- `user` → `users` collection
- `products[].product` → `products` collection

---

## Bookings

**Collection:** `bookings`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `user` | ObjectId (ref: User) | ✅ | — | Who booked |
| `room` | ObjectId (ref: Room) | ✅ | — | Room being booked |
| `checkIn` | Date | ✅ | — | Check-in date |
| `checkOut` | Date | ✅ | — | Check-out date |
| `guests` | Number | ❌ | `1` | Number of guests (min: 1) |
| `guestDetails` | Array | ❌ | `[]` | Guest information |
| `guestDetails[].name` | String | ❌ | `""` | Guest name |
| `guestDetails[].age` | Number | ❌ | — | Guest age |
| `guestDetails[].gender` | String | ❌ | `""` | Guest gender |
| `totalAmount` | Number | ✅ | — | Total booking amount (min: 0) |
| `status` | String | ❌ | `"pending"` | Enum: pending, confirmed, payment_failed, cancelled |
| `paymentStatus` | String | ❌ | `"pending"` | Enum: pending, paid, failed |
| `razorpayOrderId` | String | ❌ | — | Razorpay order ID (unique, sparse) |
| `razorpayPaymentId` | String | ❌ | — | Razorpay payment ID (unique, sparse) |
| `razorpaySignature` | String | ❌ | `""` | Razorpay signature |
| `paidAt` | Date | ❌ | `null` | When payment was made |
| `webhookProcessed` | Boolean | ❌ | `false` | Whether webhook processed this |
| `expiresAt` | Date | ❌ | `now + 15min` | Auto-delete pending bookings |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

**Indexes:**
- `{ user: 1, createdAt: -1 }` — Compound index
- `{ paymentStatus: 1, status: 1 }` — Compound index
- `expiresAt` — TTL index with `expireAfterSeconds: 0`, partial filter: `{ paymentStatus: "pending", expiresAt: { $type: "date" } }`

**TTL Index Details:**
- Auto-deletes documents where `paymentStatus === "pending"` and `expiresAt` has passed
- Ensures unconfirmed bookings are cleaned up after 15 minutes

**Relationships:**
- `user` → `users` collection
- `room` → `rooms` collection

---

## Gallery

**Collection:** `galleries`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `title` | String | ✅ | — | Image title (trimmed) |
| `imageUrl` | String | ✅ | — | Image URL or path |
| `createdBy` | ObjectId (ref: User) | ❌ | — | Who added the image |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

**Indexes:** `_id` only

**Relationships:**
- `createdBy` → `users` collection

---

## Blocked Pincodes

**Collection:** `blockedpincodes`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `pincode` | String | ✅ | — | 6-digit pincode (unique, trimmed) |
| `district` | String | ❌ | `""` | District name |
| `state` | String | ❌ | `""` | State name |
| `reason` | String | ❌ | `"Delivery not available"` | Why delivery is blocked |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

**Indexes:**
- `pincode` — unique index
- `_id` — default

---

## Entity Relationship Diagram

```
┌─────────┐       ┌───────────┐       ┌──────────┐
│  User   │──────>│  Order    │──────>│ Product  │
│         │ 1:N   │           │ N:M   │          │
│ cart ───┤       │           │       │          │
└─────────┘       └───────────┘       └──────────┘
     │
     │ 1:N
     ▼
┌───────────┐       ┌──────────┐
│  Booking  │──────>│  Room    │
│           │ N:1   │          │
└───────────┘       └──────────┘

┌───────────────┐   ┌─────────────┐
│  Gallery      │   │ Blocked     │
│  (standalone) │   │ Pincode     │
└───────────────┘   └─────────────┘
```
