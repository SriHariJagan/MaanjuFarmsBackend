# Role Permissions

## Roles

| Role | Description |
|---|---|
| `user` | Default role. Can browse, purchase, and book. |
| `admin` | Full access. Can manage all resources. |

---

## Permission Matrix

| Area | Action | Public | User | Admin |
|---|---|---|---|---|
| **Auth** | Signup | — | ✅ | ✅ |
| | Login | — | ✅ | ✅ |
| | Get Profile | — | ✅ | ✅ |
| **Products** | List Products | ✅ | ✅ | ✅ |
| | View Product | ✅ | ✅ | ✅ |
| | Create Product | — | — | ✅ |
| | Update Product | — | — | ✅ |
| | Delete Product | — | — | ✅ |
| **Rooms** | List Rooms | ✅ | ✅ | ✅ |
| | View Room | ✅ | ✅ | ✅ |
| | Check Availability | ✅ | ✅ | ✅ |
| | Create Room | — | — | ✅ |
| | Update Room | — | — | ✅ |
| | Delete Room | — | — | ✅ |
| **Cart** | View Cart | — | ✅ | ✅ |
| | Add to Cart | — | ✅ | ✅ |
| | Remove from Cart | — | ✅ | ✅ |
| **Orders** | View Own Orders | — | ✅ | ✅ |
| | View All Orders | — | — | ✅ |
| | Update Order | — | — | ✅ |
| **Bookings** | Create Booking | — | ✅ | ✅ |
| | View Own Bookings | — | ✅ | ✅ |
| | View All Bookings | — | — | ✅ |
| | Cancel Own Booking | — | ✅ (owner) | ✅ |
| **Payments** | Create Product Order | — | ✅ | ✅ |
| | Create Booking Order | — | ✅ | ✅ |
| | Verify Payment | ✅ | ✅ | ✅ |
| | Mark Payment Failed | — | ✅ | ✅ |
| | Webhook | ✅ (Razorpay) | — | — |
| **Gallery** | View Gallery | ✅ | ✅ | ✅ |
| | Add to Gallery | — | — | ✅ |
| | Update Gallery | — | — | ✅ |
| | Delete Gallery | — | — | ✅ |
| **Pincode** | Check Pincode | ✅ | ✅ | ✅ |
| | List Blocked | — | — | ✅ |
| | Block Pincode | — | — | ✅ |
| | Unblock Pincode | — | — | ✅ |
| **Contact** | Submit Contact | ✅ | ✅ | ✅ |
| **Health** | Test Endpoint | ✅ | ✅ | ✅ |

---

## Implementation

### How Admin Role Is Assigned

In `authController.js` (line 21):
```javascript
const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
```

**This means:** Anyone who registers with the email matching `ADMIN_EMAIL` automatically becomes admin. This is a security concern if `ADMIN_EMAIL` is leaked.

### How Authorization Is Enforced

Two middleware functions in `middleware/authMiddleware.js`:

```javascript
// Step 1: Authenticate (verify JWT)
authMiddleware → sets req.user = { id, role }

// Step 2: Authorize (check admin)
adminMiddleware → checks req.user.role === "admin"
```

Route example:
```javascript
router.post("/", authMiddleware, adminMiddleware, addProduct);
```

### Ownership Check

Booking cancellation verifies ownership:
```javascript
if (booking.user.toString() !== req.user.id)
  return res.status(403).json({ msg: "Unauthorized" });
```

**Missing ownership checks:**
- Viewing own orders (`getUserOrders`) only checks `req.user.id` — correct
- No admin can view any user's orders via `/my-orders` — correct (separate admin route exists)
- No endpoint to view a specific order by ID for users
