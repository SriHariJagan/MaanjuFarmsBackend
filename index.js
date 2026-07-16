require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { authLimiter } = require("./middleware/rateLimiter");

connectDB();

const app = express();

// ================== CORS (MUST BE FIRST) ==================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.CLIENT_URL && process.env.CLIENT_URL.trim(),
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ================== SECURITY HEADERS ==================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false,
  })
);

// ================== STATIC ==================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================== WEBHOOK (MUST BE BEFORE JSON PARSER) ==================
const { razorpayWebhook } = require("./controllers/webhookController");

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// ================== BODY PARSERS ==================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================== MANUAL MONGO SANITIZATION ==================
app.use((req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(sanitize);
      return Object.keys(obj).reduce((acc, key) => {
        if (!key.startsWith("$") && !key.includes(".")) {
          acc[key] = sanitize(obj[key]);
        }
        return acc;
      }, {});
    };
    req.body = sanitize(req.body);
  }
  next();
});

// ================== RATE LIMITING ==================
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// ================== ROUTES ==================
const authRoutes = require("./routers/auth");
const productRoutes = require("./routers/product");
const roomRoutes = require("./routers/room");
const cartRoutes = require("./routers/cart");
const orderRoutes = require("./routers/order");
const bookingRoutes = require("./routers/booking");
const galleryRoutes = require("./routers/gallery");
const paymentRoutes = require("./routers/payment");
const contactRoutes = require("./routers/contactRoutes");
const pincodeRoutes = require("./routers/pincodeRoutes");
const adminRoutes = require("./routers/admin");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/pincode", pincodeRoutes);
app.use("/api/", contactRoutes);

app.get("/api/test-pincode", (req, res) => {
  res.json({ success: true });
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, error: "Origin not allowed" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, error: "File size exceeds 5MB limit" });
  }

  if (err.message && (err.message.includes("Only JPG") || err.message.includes("Only images"))) {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, error: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: "Duplicate entry" });
  }

  res.status(err.status || 500).json({ success: false, error: err.message || "Something went wrong" });
});

// ================== START ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
