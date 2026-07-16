const User = require("../models/User");
const Product = require("../models/Product");
const Room = require("../models/Room");
const Order = require("../models/Order");
const Booking = require("../models/Booking");

exports.getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalRooms,
      totalOrders,
      totalBookings,
      revenueResult,
      pendingOrders,
      pendingBookings
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Room.countDocuments(),
      Order.countDocuments(),
      Booking.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "pending" })
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalRooms,
      totalOrders,
      totalBookings,
      totalRevenue: revenueResult.length ? revenueResult[0].total : 0,
      pendingOrders,
      pendingBookings
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getRecent = async (req, res) => {
  try {
    const [recentOrders, recentBookings] = await Promise.all([
      Order.find()
        .populate("user", "name email")
        .populate("products.product")
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find()
        .populate("user", "name email")
        .populate("room")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({ recentOrders, recentBookings });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const [orderStatusCounts, bookingStatusCounts] = await Promise.all([
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    const formatCounts = (arr) =>
      arr.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

    res.json({
      orderStatusCounts: formatCounts(orderStatusCounts),
      bookingStatusCounts: formatCounts(bookingStatusCounts)
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const [inStock, lowStock, outOfStock] = await Promise.all([
      Product.countDocuments({ stock: { $gt: 10 } }),
      Product.countDocuments({ stock: { $gte: 1, $lte: 10 } }),
      Product.countDocuments({ stock: { $lte: 0 } })
    ]);

    res.json({ inStock, lowStock, outOfStock });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
