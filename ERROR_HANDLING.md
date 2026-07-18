# Error Handling

## Current Implementation

### Pattern: try/catch in every controller

Every controller function follows this pattern:

```javascript
exports.someFunction = async (req, res) => {
  try {
    // business logic
    if (error) return res.status(400).json({ msg: "..." });
    res.json({ success: true, ... });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
```

### Global Error Handler (index.js)

```javascript
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({ message: "Something went wrong" });
});
```

---

## HTTP Status Codes Used

| Code | Usage | Example |
|---|---|---|
| 200 | Success | `res.json(data)` |
| 201 | Created | `res.status(201).json({ msg: "Product added" })` |
| 400 | Bad Request | Missing fields, invalid dates, duplicate |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Non-admin accessing admin route |
| 404 | Not Found | Resource by ID not found |
| 500 | Server Error | Unhandled exceptions |

---

## Error Response Formats

### Inconsistent — Two formats exist:

**Format 1 (most common):**
```json
{ "msg": "Error description" }
```

**Format 2 (used by payments, gallery, pincode):**
```json
{ "success": false, "message": "Error description", "error": "..." }
```

**Format 3 (auth middleware):**
```json
{ "msg": "No token, authorization denied" }
```

**Format 4 (gallery):**
```json
{ "error": "Failed to fetch gallery" }
```

---

## What's Missing

| Issue | Severity | Description |
|---|---|---|
| No centralized error class | Medium | No custom AppError / ApiError class |
| Inconsistent response format | Medium | Some use `msg`, some use `message`, some use `error` |
| Stack traces leaked | 🔴 High | `.error: err.message` exposed in production responses |
| No async handler wrapper | Low | Express 5 handles this, but pattern is repetitive |
| No error logging service | 🔴 High | Only console.log — no persistent logs |
| No validation error details | Medium | Missing field errors return generic message (except pincode) |
| 404 on missing routes | Low | No "Route not found" handler — returns HTML for unknown routes |
