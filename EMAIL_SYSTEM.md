# Email System

## Architecture

```
Controller
    │
    ▼
sendMailByType(type, data)  (mails/mailTypes.js)
    │
    ├─ Case "PRODUCT_ORDER"
    │   ├─ Customer → productOrderCustomerTemplate
    │   └─ Admin → productOrderAdminTemplate
    │
    ├─ Case "VILLA_BOOKING"
    │   ├─ Customer → villaBookingCustomerTemplate
    │   └─ Admin → villaBookingAdminTemplate
    │
    └─ Case "CONTACT"
        ├─ Admin → contactMailTemplate
        └─ User → contactAutoReplyTemplate
    │
    ▼
sendMail({ to, subject, html })  (mails/sendMail.js)
    │
    ▼
Nodemailer Transporter → Gmail SMTP
```

---

## Configuration

**File:** `mails/sendMail.js`

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // maanjoofarms@gmail.com
    pass: process.env.EMAIL_PASS,  // Gmail App Password
  },
});
```

### Required Environment Variables
| Variable | Example |
|---|---|
| `EMAIL_USER` | `maanjoofarms@gmail.com` |
| `EMAIL_PASS` | `zqck esbl ucyi cdrt` (App Password) |
| `ADMIN_EMAIL` | `admin@maanjufarms.com` |

---

## Email Templates

### 1. Product Order — Customer (`productOrderCustomer.js`)
- **Trigger:** Payment verified for product order
- **To:** Customer email + delivery address email
- **Content:** Order ID, items table with images, total amount, shipping address

### 2. Product Order — Admin (`productOrderAdmin.js`)
- **Trigger:** Payment verified for product order
- **To:** `ADMIN_EMAIL`
- **Content:** Customer details, shipping address, ordered products with prices

### 3. Villa Booking — Customer (`villaBookingCustomer.js`)
- **Trigger:** Payment verified for villa booking
- **To:** Customer email
- **Content:** Villa image, booking details (dates, guests, amount), guest list

### 4. Villa Booking — Admin (`villaBookingAdmin.js`)
- **Trigger:** Payment verified for villa booking
- **To:** `ADMIN_EMAIL`
- **Content:** Customer details, booking details, guest list

### 5. Contact — Admin (`contactMail.js`)
- **Trigger:** Contact form submission
- **To:** `ADMIN_EMAIL`
- **Content:** Name, email, phone, subject, message

### 6. Contact — Auto Reply (`contactAutoReply.js`)
- **Trigger:** Contact form submission
- **To:** Submitter's email
- **Content:** Thank you message with their submitted message

---

## Triggers

| Email Type | Trigger Endpoint | Controller |
|---|---|---|
| `PRODUCT_ORDER` | `POST /api/payment/verify-payment` | `paymentController.verifyPayment` |
| `VILLA_BOOKING` | `POST /api/payment/verify-payment` | `paymentController.verifyPayment` |
| `CONTACT` | `POST /api/contact` | `contactController.sendContactMail` |

**⚠️ Bug:** Webhook handler (`webhookController.razorpayWebhook`) does **NOT** send emails. Only the `/verify-payment` endpoint sends them.

---

## Email Variables

### PRODUCT_ORDER Data
| Variable | Source | Description |
|---|---|---|
| `data.user` | Populated Order.user | User object (name, email) |
| `data.orderId` | Order._id | Order identifier |
| `data.products` | Populated products | Array with product details |
| `data.totalAmount` | Order.totalAmount | Total order value |
| `data.address` | Order.deliveryAddress | Shipping address object |

### VILLA_BOOKING Data
| Variable | Source | Description |
|---|---|---|
| `data.user` | Populated Booking.user | User object |
| `data.bookingId` | Booking._id | Booking identifier |
| `data.room` | Populated Booking.room | Room object (name, category, image) |
| `data.checkIn` | Booking.checkIn | Check-in date |
| `data.checkOut` | Booking.checkOut | Check-out date |
| `data.totalAmount` | Booking.totalAmount | Total amount |
| `data.guestDetails` | Booking.guestDetails | Array of guest info |

**⚠️ Bug:** In `mailTypes.js`, the VILLA_BOOKING case references `data.address.email` (line 69), but booking data does not have an `address` field. This will crash or send to undefined email.

### CONTACT Data
| Variable | Source | Description |
|---|---|---|
| `data.name` | req.body | Sender name |
| `data.email` | req.body | Sender email |
| `data.phone` | req.body | Sender phone |
| `data.subject` | req.body | Message subject |
| `data.message` | req.body | Message body |

---

## Error Handling

Email failures are logged but do not block the main flow:

```javascript
try {
  await sendMailByType("PRODUCT_ORDER", data);
  order.emailSent = true;
  await order.save();
} catch (mailErr) {
  console.error("PRODUCT MAIL ERROR:", mailErr);
  // Order is still confirmed even if email fails
}
```

---

## Limitations

| Issue | Severity | Description |
|---|---|---|
| Gmail SMTP Only | Medium | Not suitable for high-volume production |
| No Queue | High | Emails sent synchronously — blocks response |
| No Retry Logic | High | Failed emails are not retried |
| No Email Tracking | Low | No open/click tracking |
| No Templates DB | Low | Templates are hardcoded JS files |
| HTML Inline Styles | Low | No email framework (MJML, etc.) |
| Bug: VILLA_BOOKING address | 🔴 Critical | References non-existent `data.address.email` |
