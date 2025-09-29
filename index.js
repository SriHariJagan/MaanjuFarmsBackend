// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import database connection function
const connectDB = require("./config/db");
// Connect to MongoDB
connectDB();

// Import route files
const authRoutes = require("./routers/auth");
const productRoutes = require("./routers/product");
const roomRoutes = require("./routers/room");
const cartRoutes = require("./routers/cart");
const orderRoutes = require("./routers/order");
const bookingRoutes = require("./routers/booking");
const galleryRoutes = require("./routers/gallery");

const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());


const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes); // Routes for signup/login
app.use("/api/products", productRoutes); // Routes for product CRUD operations
app.use("/api/rooms", roomRoutes); // Routes for room CRUD and bookings
app.use("/api/cart", cartRoutes); // Routes for managing user cart
app.use("/api/orders", orderRoutes); // Routes for orders/checkout
app.use("/api/bookings", bookingRoutes); // Routes for room bookings
app.use("/api/gallery", galleryRoutes); // Routes for gallery management

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
