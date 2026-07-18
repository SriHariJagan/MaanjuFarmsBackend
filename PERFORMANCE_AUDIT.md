# Performance Audit Report

---

## Issues Found

### PERF-01: No Pagination on Products API
**File:** `controllers/productController.js:getAllProducts`
```javascript
const products = await Product.find();
res.json(products);
```
**Risk:** Returns ALL products. As inventory grows to hundreds/thousands of items, this will:
- Increase response size (bandwidth)
- Slow down database queries
- Increase frontend render time
**Fix:** Add pagination with `page`, `limit`, `skip` like roomController.

### PERF-02: No Search/Filter on Products
**File:** `controllers/productController.js`
**Risk:** Frontend must filter client-side, wasting bandwidth.
**Fix:** Add query params: `search`, `category`, `minPrice`, `maxPrice`.

### PERF-03: Email Blocking the Response
**File:** `controllers/paymentController.js:verifyPayment`
**Risk:** Email sending is synchronous (awaited). If Gmail SMTP is slow, the HTTP response is delayed.
**Fix:** Send emails asynchronously (fire-and-forget) or use a job queue (Bull/BullMQ).

### PERF-04: N+1 Query in Payment Verification
**File:** `controllers/paymentController.js:verifyPayment` (lines 425-436)
```javascript
for (const item of populatedOrder.products) {
  await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
}
```
**Risk:** Sequential updates inside a loop. One query per product.
**Fix:** Use bulkWrite or updateMany.

### PERF-05: N+1 Query in Webhook
**File:** `controllers/webhookController.js` (lines 182-207)
Same issue as PERF-04 — sequential stock updates.

### PERF-06: Cart Population on Every Request
**File:** `controllers/cartController.js:getCart`
**Risk:** Populating cart.product on every read. Cart can grow large.
**Fix:** Consider pagination, or use lean() with manual population.

### PERF-07: No Database Connection Pool Tuning
**File:** `config/db.js`
```javascript
await mongoose.connect(process.env.MONGO_URI);
```
**Risk:** Default connection pool size (100) may be too high or too low depending on deployment.
**Fix:** Add explicit pool size: `mongoose.connect(uri, { maxPoolSize: 10 })`.

### PERF-08: No Index on Product Category
**File:** `models/Product.js`
**Risk:** Category-based queries (if added later) would be full collection scans.
**Fix:** Add index: `productSchema.index({ category: 1 })`.

### PERF-09: No Lean Queries
**File:** Multiple controllers use Mongoose queries without `.lean()`
**Risk:** Mongoose returns full document objects with all methods/getters/setters — memory overhead.
**Fix:** Use `.lean()` for read-only queries.

### PERF-10: Large Email Templates Inline
**Files:** All template files contain large HTML strings.
**Risk:** Increases memory usage for each email sent.
**Fix:** Use template engine or read from files.

### PERF-11: File Uploads Stored Locally
**Risk:** Local disk I/O is slow and doesn't scale. No CDN support.
**Fix:** Store on S3/Cloudinary with CDN.

### PERF-12: No Response Compression
**File:** `index.js`
**Risk:** JSON responses are not compressed, increasing bandwidth.
**Fix:** Add `compression` middleware.

---

## Quick Wins

| Issue | Fix | Effort | Impact |
|---|---|---|---|
| PERF-01 | Add pagination to products | 1 hour | High |
| PERF-02 | Add search/filter to products | 2 hours | High |
| PERF-04 | Use bulkWrite for stock updates | 30 min | Medium |
| PERF-05 | Same as PERF-04 | 30 min | Medium |
| PERF-09 | Add `.lean()` to read queries | 15 min | Medium |
| PERF-12 | Add compression middleware | 5 min | Medium |
| PERF-07 | Set explicit pool size | 2 min | Low |

---

## Performance Score: **4/10**

Major pagination and blocking email issues need immediate attention. Without pagination on products, the app will not scale past a few hundred products.
