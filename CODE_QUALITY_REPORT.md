# Code Quality Report

---

## Dead/Unused Code

| # | File | Issue | Recommended Action |
|---|---|---|---|
| 1 | `services/mailService.js` | Empty file — 0 lines | Delete |
| 2 | `mails/templates/productOrder.js` | Old template, not imported anywhere | Delete |
| 3 | `mails/templates/villaBooking.js` | Old template, not imported anywhere | Delete |
| 4 | `utils/generateInvoice.js` | PDF invoice generator — never imported or called | Delete or integrate |
| 5 | `readme` (root) | Contains `stripe listen` command for Stripe, but app uses Razorpay | Delete or update |

---

## Unused npm Packages

| Package | In package.json | Actually Used | Action |
|---|---|---|---|
| `crypto` | ✅ | ❌ (Node built-in used instead) | Remove |
| `pdfkit` | ✅ | ❌ (generateInvoice.js unused) | Remove |
| `axios` | ❌ | ✅ (pincodeController.js) | Add to dependencies |

---

## Missing Dependencies

| Package | Used In | Action |
|---|---|---|
| `axios` | `controllers/pincodeController.js` | `npm install axios` |

---

## Naming / Consistency Issues

| Issue | Occurrences | Recommendation |
|---|---|---|
| Inconsistent response format | All controllers | Standardize: `{ success: bool, message: string, data: any }` |
| Mixed `msg` vs `message` vs `error` keys | Throughout | Use one consistent key |
| `room` vs `villa` naming | `models/Room.js` has `category: "villa"` | Either call it Room or Villa, not both |
| `routers/` vs `routes/` | Folder named `routers` | Standard is `routes/` |
| Seed files named inconsistently | `seedProducts.js`, `seedVillas.js` | No convention |

---

## Code Duplication

| Pattern | Files | Lines |
|---|---|---|
| try/catch boilerplate | Every controller | ~5 lines each × 11 controllers = ~55 duplicated lines |
| Error response patterns | Multiple files | Same `res.status(500).json({ msg: "Server error" })` repeated |
| Stock update loop | paymentController, webhookController | Duplicate logic for reducing stock |
| Email sending logic | paymentController (verifyPayment) | Same pattern repeated for product and booking |
| Authorization middleware pattern | All admin routes | `authMiddleware, adminMiddleware` repeated in every router file |

---

## Large Files

| File | Lines | Notes |
|---|---|---|
| `controllers/paymentController.js` | 767 | Very large — combines product order, booking order, verify, mark failed |
| `controllers/webhookController.js` | 533 | Complex — handles both product and booking webhooks |
| `mails/templates/productOrderCustomer.js` | 290 | Large HTML template |
| `controllers/pincodeController.js` | 230 | 4 controllers in one file |
| `models/Order.js` | 205 | Large schema — could be split |

---

## Circular Dependencies

**None detected.** The dependency graph is clean:
- Controllers → Models (no cycles)
- Routers → Controllers → Models
- mailTypes → sendMail → nodemailer
- generateInvoice → pdfkit (unused)

---

## Folder Structure Issues

| Issue | Suggestion |
|---|---|
| `mails/` folder mix of templates and logic | Split into `emails/` with subfolders: `emails/templates/`, `emails/dispatcher.js`, `emails/transporter.js` |
| `controllers/` very flat with mixed concerns | Group by module: `controllers/auth/`, `controllers/products/`, `controllers/bookings/` etc. |
| `services/` has 1 empty file | Remove or rename to meaningful service layer |
| `utils/` has 1 unused file | Make it meaningful or remove |
| Root-level seed files | Move to `scripts/` folder |
| `routers/` (misspelled) | Rename to `routes/` |

---

## Code Quality Score: **5/10**

The codebase is functional and follows basic Express patterns, but suffers from inconsistent error formats, dead files, and large controller files that mix multiple concerns.
