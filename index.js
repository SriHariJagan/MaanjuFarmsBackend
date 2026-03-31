// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// ================== ✅ CORS ==================
app.use(cors());

// ================== ✅ STATIC UPLOADS ==================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================== 🔥 STRIPE WEBHOOK ==================
// ⚠️ Must come BEFORE express.json()
const { stripeWebhook } = require("./controllers/webhookController");
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ================== ✅ JSON PARSER ==================
app.use(express.json());

// ================== ROUTES ==================
const authRoutes = require("./routers/auth");
const productRoutes = require("./routers/product");
const roomRoutes = require("./routers/room");
const cartRoutes = require("./routers/cart");
const orderRoutes = require("./routers/order");
const bookingRoutes = require("./routers/booking");
const galleryRoutes = require("./routers/gallery");
const paymentRoutes = require("./routers/payment");

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gallery", galleryRoutes);

// ✅ Payment routes (after JSON parser)
app.use("/api/payment", paymentRoutes);

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});