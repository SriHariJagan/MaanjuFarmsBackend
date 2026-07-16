const express = require("express");
const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const multer = require("../middleware/multerMiddleware");

const productCtrl = require("../controllers/productController");
const roomCtrl = require("../controllers/roomController");
const galleryCtrl = require("../controllers/galleryController");
const orderCtrl = require("../controllers/orderController");
const customerCtrl = require("../controllers/customerController");
const dashboardCtrl = require("../controllers/dashboardController");
const analyticsCtrl = require("../controllers/analyticsController");
const settingsCtrl = require("../controllers/settingsController");

router.use(authMiddleware, adminMiddleware);

// ── Dashboard ──
router.get("/dashboard", dashboardCtrl.getDashboardStats);

// ── Analytics ──
router.get("/analytics", analyticsCtrl.getAnalytics);

// ── Products ──
router.get("/products", productCtrl.getAllProducts);
router.get("/products/categories", productCtrl.getCategories);
router.get("/products/:id", productCtrl.getProductById);
router.post("/products", multer("products").single("image"), productCtrl.addProduct);
router.put("/products/:id", multer("products").single("image"), productCtrl.updateProduct);
router.delete("/products/:id", productCtrl.deleteProduct);
router.post("/products/bulk/delete", productCtrl.bulkDelete);
router.post("/products/bulk/publish", productCtrl.bulkPublish);
router.post("/products/bulk/unpublish", productCtrl.bulkUnpublish);
router.post("/products/:id/duplicate", productCtrl.duplicateProduct);

// ── Villas ──
router.get("/villas", roomCtrl.getAllRooms);
router.get("/villas/:id", roomCtrl.getRoomById);
router.post("/villas", multer("rooms").single("image"), roomCtrl.addRoom);
router.put("/villas/:id", multer("rooms").single("image"), roomCtrl.updateRoom);
router.delete("/villas/:id", roomCtrl.deleteRoom);
router.patch("/villas/:id/status", roomCtrl.updateRoomStatus);
router.get("/villas/:id/bookings", roomCtrl.getRoomBookings);

// ── Gallery ──
router.get("/gallery", galleryCtrl.getGallery);
router.post("/gallery", multer("gallery").array("images", 10), galleryCtrl.addGalleryItem);
router.patch("/gallery/:id", multer("gallery").single("image"), galleryCtrl.updateGalleryItem);
router.delete("/gallery/:id", galleryCtrl.deleteGalleryItem);

// ── Orders ──
router.get("/orders", orderCtrl.getAllOrders);
router.get("/orders/:id", orderCtrl.getOrderById);
router.put("/orders/:id", orderCtrl.updateOrder);
router.get("/orders/:id/timeline", orderCtrl.getOrderTimeline);
router.get("/orders/:id/invoice", orderCtrl.downloadInvoice);
router.get("/orders/export/csv", orderCtrl.exportOrdersCSV);

// ── Customers ──
router.get("/customers", customerCtrl.getCustomers);
router.get("/customers/:id", customerCtrl.getCustomerById);

// ── Settings ──
router.get("/settings", settingsCtrl.getSettings);
router.put("/settings", multer("general").single("siteLogo"), settingsCtrl.updateSettings);
router.post("/settings/hero", multer("general").single("image"), settingsCtrl.uploadHeroImage);
router.delete("/settings/hero/:index", settingsCtrl.deleteHeroImage);

module.exports = router;
