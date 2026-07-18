# Notification System

## Current State

**Only email notifications are implemented.** There is no:
- Push notification system
- SMS notification system
- In-app notification system
- WebSocket / real-time updates

---

## Existing Notifications (Email)

| Event | Recipient | Type |
|---|---|---|
| Product order placed (paid) | Customer | Email |
| Product order placed (paid) | Admin | Email |
| Villa booking confirmed (paid) | Customer | Email |
| Villa booking confirmed (paid) | Admin | Email |
| Contact form submitted | Admin | Email |
| Contact form submitted | Customer | Email (auto-reply) |

---

## Missing Notifications

| Event | Should Notify |
|---|---|
| Order status changed to "shipped" | Customer (email) |
| Order status changed to "delivered" | Customer (email/SMS) |
| Order payment failed | Customer (email) |
| Booking cancelled | Customer (email) |
| Booking cancelled | Admin (email) |
| New user signup | Admin (email) |
| Product out of stock | Admin (in-app) |
| Room under maintenance | Admin (in-app) |

---

## Recommendation

Implement a notification system with these components:

```
Event occurs
    │
    ▼
Notification Service
    │
    ├─ Email Channel (existing)
    ├─ SMS Channel (Twilio, AWS SNS)
    ├─ Push Channel (Firebase Cloud Messaging)
    └─ In-App Channel (WebSocket + MongoDB collection)

    │
    ▼
Notification model (Mongoose)
{
  user: ObjectId,
  type: String,
  title: String,
  message: String,
  data: Object,
  read: Boolean,
  createdAt: Date
}
```
