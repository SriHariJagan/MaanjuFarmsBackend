# File Upload Guide

## Overview

File uploads are handled by **Multer** middleware. Uploaded files are stored on the local filesystem and served statically by Express.

## Configuration

**File:** `middleware/multerMiddleware.js`

### Storage
- **Engine:** `multer.diskStorage`
- **Location:** `uploads/<folder>/`
- **Naming:** `Date.now()` + `-` + `Math.round(Math.random() * 1e9)` + original extension
  - Example: `1758903085747-Homepage.jpg`
- **Auto-creation:** Missing folders are created automatically

### File Filter
- **Allowed:** Images only (MIME type must start with `image/`)
- **Rejected:** Non-image files throw `Error("Only images are allowed")`

### Size Limit
- **Max File Size:** 5 MB (5 × 1024 × 1024 bytes)

---

## Usage Example

```javascript
const multer = require("../middleware/multerMiddleware");

// Single file upload
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  multer("products").single("image"), // folder = "products", field name = "image"
  controller.addItem
);
```

### Upload Folders

| Route | Folder | Field Name |
|---|---|---|
| Products | `products` | `image` |
| Gallery | `gallery` | `image` |

---

## Frontend Upload Example

```html
<form id="productForm" enctype="multipart/form-data">
  <input type="text" name="name" />
  <input type="number" name="price" />
  <input type="file" name="image" accept="image/*" />
  <button type="submit">Save</button>
</form>
```

```javascript
const form = document.getElementById('productForm');
const formData = new FormData(form);

const response = await fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    // Do NOT set Content-Type — browser sets it with boundary for FormData
  },
  body: formData,
});
```

---

## Returned URLs

After upload, the controller returns the image path:

```json
{
  "image": "/uploads/products/1758903085747-Homepage.jpg"
}
```

**Full URL:** `http://localhost:5000/uploads/products/1758903085747-Homepage.jpg`

The path is stored in MongoDB and served via Express static middleware:
```javascript
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

---

## Limitations & Issues

| Issue | Severity | Description |
|---|---|---|
| Local Storage | ⚠️ Medium | Production should use cloud storage (S3, Cloudinary) |
| No File Validation | ⚠️ Medium | Only checks MIME type — can be spoofed |
| No Image Processing | ⚠️ Medium | No resizing, optimization, or thumbnail generation |
| No Compression | ⚠️ Low | Images served as-is (large file sizes) |
| No Malware Scanning | 🔴 High | Uploaded files could contain malicious content |
| No File Deletion on Update | ⚠️ Medium | Old files remain when product image is updated |
| Orphaned Files | ⚠️ Medium | Deleted products don't remove uploaded files |
| Directory Traversal | ✅ Safe | Multer diskStorage prevents path traversal via filename |
