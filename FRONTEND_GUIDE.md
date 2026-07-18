# Frontend Developer Guide

This document describes every frontend page, its API calls, required components, and state management needs.

---

## Page Inventory

| # | Page | Route | Auth | Role | API Endpoints |
|---|---|---|---|---|---|
| 1 | Home | `/` | No | — | `GET /api/gallery` |
| 2 | Shop / Products | `/shop` | No | — | `GET /api/products`, `GET /api/products/:id` |
| 3 | Product Detail | `/shop/:id` | No | — | `GET /api/products/:id`, `POST /api/cart/add` (auth) |
| 4 | Cart | `/cart` | Yes | user | `GET /api/cart`, `POST /api/cart/add`, `POST /api/cart/remove` |
| 5 | Checkout | `/checkout` | Yes | user | `GET /api/cart`, `POST /api/payment/product-order`, `POST /api/payment/verify-payment`, `GET /api/pincode/check/:pin` |
| 6 | Order Success | `/order/success` | Yes | user | `POST /api/payment/verify-payment` |
| 7 | My Orders | `/orders` | Yes | user | `GET /api/orders/my-orders` |
| 8 | Villas / Rooms | `/villas` | No | — | `GET /api/rooms` |
| 9 | Villa Detail | `/villas/:id` | No | — | `GET /api/rooms/:id`, `GET /api/rooms/:id/availability` |
| 10 | Villa Booking | `/villas/:id/book` | Yes | user | `POST /api/payment/booking-order`, `POST /api/payment/verify-payment` |
| 11 | Booking Success | `/booking/success` | Yes | user | `POST /api/payment/verify-payment` |
| 12 | My Bookings | `/bookings` | Yes | user | `GET /api/bookings/my-bookings`, `POST /api/bookings/cancel/:id` |
| 13 | Gallery | `/gallery` | No | — | `GET /api/gallery` |
| 14 | Contact | `/contact` | No | — | `POST /api/contact` |
| 15 | Login | `/login` | No | — | `POST /api/auth/login` |
| 16 | Signup | `/signup` | No | — | `POST /api/auth/signup` |
| 17 | Profile | `/profile` | Yes | user | `GET /api/auth/me` |
| 18 | Admin Dashboard | `/admin` | Yes | admin | Various |
| 19 | Admin Products | `/admin/products` | Yes | admin | `GET/POST/PUT/DELETE /api/products` |
| 20 | Admin Rooms | `/admin/rooms` | Yes | admin | `GET/POST/PUT/DELETE /api/rooms` |
| 21 | Admin Orders | `/admin/orders` | Yes | admin | `GET /api/orders/all`, `PUT /api/orders/update/:id` |
| 22 | Admin Bookings | `/admin/bookings` | Yes | admin | `GET /api/bookings` |
| 23 | Admin Gallery | `/admin/gallery` | Yes | admin | `GET/POST/PUT/DELETE /api/gallery` |
| 24 | Admin Pincodes | `/admin/pincodes` | Yes | admin | `GET/POST/DELETE /api/pincode/blocked` |

---

## Page-by-Page Documentation

### 1. Home Page (`/`)

**Purpose:** Landing page showcasing the brand, featured products, gallery images.

**API Calls:**
- `GET /api/gallery` — Fetch gallery images for hero/slider

**Components Needed:**
- HeroBanner / Slider
- FeaturedProducts section
- GalleryGrid
- CallToAction section

**State Management:**
- Gallery images (fetched on mount)

---

### 2. Shop / Products Page (`/shop`)

**Purpose:** Browse all products with category filter.

**API Calls:**
- `GET /api/products` — Fetch all products (no pagination)

**Components Needed:**
- ProductCard (image, name, price, category, "Add to Cart" button)
- CategoryFilter (tabs or dropdown)
- LoadingSkeleton
- EmptyState ("No products found")

**State Management:**
- `products` array
- `selectedCategory` filter
- Loading / error states

**⚠️ Missing Features:**
- No search bar (not supported by API)
- No price filter (not supported by API)
- No pagination (all products returned at once)

---

### 3. Product Detail Page (`/shop/:id`)

**Purpose:** View product details and add to cart.

**API Calls:**
- `GET /api/products/:id` — Fetch product details
- `POST /api/cart/add` — Add to cart (requires auth)

**Components Needed:**
- ProductImage (main + thumbnails)
- ProductInfo (name, price, description, stock)
- QuantitySelector
- AddToCartButton
- RelatedProducts section

**State Management:**
- `product` object
- `quantity` (local)
- Auth check for add-to-cart

---

### 4. Cart Page (`/cart`)

**Purpose:** View and manage cart items.

**API Calls:**
- `GET /api/cart` — Fetch cart with populated products
- `POST /api/cart/add` — Update quantity
- `POST /api/cart/remove` — Remove item

**Components Needed:**
- CartItem (image, name, price, quantity, subtotal, remove button)
- CartSummary (subtotal, total, "Proceed to Checkout" button)
- EmptyCart (with "Continue Shopping" link)

**State Management:**
- Cart items (fetched)
- Quantity changes (optimistic update or refetch)

---

### 5. Checkout Page (`/checkout`)

**Purpose:** Enter delivery address and make payment.

**API Calls:**
- `GET /api/cart` — Verify cart contents
- `GET /api/pincode/check/:pin` — Validate pincode (on blur)
- `POST /api/payment/product-order` — Create Razorpay order

**Components Needed:**
- AddressForm (name, phone, email, street, apartment, city, district, state, pincode)
- PincodeValidator (with error/success states)
- OrderSummary (items list, total)
- RazorpayButton (triggers Razorpay checkout)

**Validation (Frontend):**
- All address fields required
- Pincode must be 6 digits
- Pincode must not be blocked (check API)
- Phone must be 10 digits

**Razorpay Integration Flow:**
```javascript
const handlePayment = async () => {
  const response = await fetch('/api/payment/product-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  const data = await response.json();
  
  const options = {
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    name: "Maanjoo Farms",
    order_id: data.orderId,
    handler: async function(response) {
      // Call verify-payment
      const verifyRes = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });
      // Redirect to success page
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
};
```

---

### 6. Order Success Page (`/order/success`)

**Purpose:** Show payment success confirmation.

**API Calls:** None (data from previous page's verify response)

**Components Needed:**
- SuccessAnimation
- OrderSummary
- "View Order" button → `/orders`
- "Continue Shopping" button

**State:** Read from URL params or localStorage

---

### 7. My Orders Page (`/orders`)

**Purpose:** View order history.

**API Calls:**
- `GET /api/orders/my-orders` — Fetch user's orders

**Components Needed:**
- OrderCard (order ID, date, status, items summary, total, tracking info)
- StatusBadge (pending/confirmed/shipped/delivered/cancelled)
- EmptyState ("No orders yet")
- LoadingSkeleton

**State:**
- Orders array
- Loading / error

---

### 8. Villas Page (`/villas`)

**Purpose:** Browse available villas with search/filter.

**API Calls:**
- `GET /api/rooms?category=villa&page=1&limit=10&search=...&minPrice=...&maxPrice=...`

**Query Parameters (construct from filters):**
- `page`, `limit`, `search`, `minPrice`, `maxPrice`, `type`

**Components Needed:**
- VillaCard (image, name, type, price, status badge)
- SearchBar
- PriceRangeSlider
- TypeFilter (checkboxes)
- Pagination
- LoadingSkeleton

**State:**
- Rooms array, total, page, pages
- Filters (search, price range, type)
- Loading / error

---

### 9. Villa Detail Page (`/villas/:id`)

**Purpose:** View villa details and check availability.

**API Calls:**
- `GET /api/rooms/:id` — Fetch villa details
- `GET /api/rooms/:id/availability?checkIn=...&checkOut=...` — Check dates

**Components Needed:**
- VillaImage (hero image)
- VillaInfo (name, description, price, type)
- DatePicker (check-in, check-out)
- AvailabilityIndicator
- "Book Now" button

**State:**
- Villa data
- Selected dates
- Availability status
- Calculated total (nights × price)

---

### 10. Villa Booking Page (`/villas/:id/book`)

**Purpose:** Enter guest details and pay for booking.

**API Calls:**
- `POST /api/payment/booking-order` — Create Razorpay order

**Request Body:**
```json
{
  "villaId": "id",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "guests": 2,
  "guestDetails": [
    { "name": "John", "age": 30, "gender": "male" }
  ]
}
```

**Components Needed:**
- BookingSummary (dates, nights, price per night, total)
- GuestDetailsForm (dynamic fields for each guest)
- RazorpayButton

---

### 11. Booking Success Page (`/booking/success`)

Same pattern as Order Success but for bookings.

---

### 12. My Bookings Page (`/bookings`)

**API Calls:**
- `GET /api/bookings/my-bookings` — Fetch bookings
- `POST /api/bookings/cancel/:id` — Cancel booking

**Components Needed:**
- BookingCard (villa name, dates, status, total)
- CancelButton (with confirmation dialog)
- StatusBadge

---

### 13-24. Remaining Pages

Follow similar patterns. Admin pages need table components with:
- DataTable (sortable columns)
- ActionButtons (edit, delete)
- Modal/Dialog for forms
- Pagination
- SearchBar
- ConfirmDialog for deletions

---

## Global State Management

### Authentication State
```javascript
{
  user: { id, name, email, role } | null,
  token: string | null,
  isAuthenticated: boolean,
  isAdmin: boolean,
  loading: boolean
}
```

### Cart State
```javascript
{
  items: [{ product: Product, quantity: number }],
  totalItems: number,
  totalAmount: number,
  loading: boolean
}
```

### API Hooks (Suggested)
- `useAuth()` — Login, signup, logout, getMe
- `useProducts()` — CRUD + listing
- `useRooms()` — CRUD + listing + availability
- `useCart()` — Add, remove, get
- `useOrders()` — List, admin update
- `useBookings()` — Create, list, cancel
- `usePincode()` — Check, admin block/unblock
- `useGallery()` — List, admin CRUD

---

## Component Library Suggestions

| Component | Library |
|---|---|
| UI Framework | Material UI / Ant Design / Chakra UI |
| State Management | Zustand or Redux Toolkit |
| Forms | React Hook Form + Zod |
| Tables | MUI DataGrid / TanStack Table |
| Date Picker | react-datepicker / MUI DatePicker |
| Razorpay | razorpayjs (official) |
| HTTP Client | axios / react-query / SWR |
| Notifications | react-hot-toast / sonner |
