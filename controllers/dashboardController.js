const Product = require("../models/Product");
const Room = require("../models/Room");
const Order = require("../models/Order");
const User = require("../models/User");
const Gallery = require("../models/Gallery");
const Booking = require("../models/Booking");

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalProducts,
      publishedProducts,
      draftProducts,
      galleryImages,
      villaListings,
      totalOrders,
      totalCustomers,
      totalBookings,
      revenueResult,
      lastMonthRevenueResult,
      recentOrders,
      categoryBreakdown,
      latestProducts,
      latestBookings,
      messages,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: "published" }),
      Product.countDocuments({ status: "draft" }),
      Gallery.countDocuments(),
      Room.countDocuments({ category: "villa" }),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Booking.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: firstOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: firstOfLastMonth, $lt: firstOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email").lean(),
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Product.find().sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find().sort({ createdAt: -1 }).limit(5).populate("room", "name").lean(),
      0,
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const lastMonthRevenue = lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].total : 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : "0";

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          publishedProducts,
          draftProducts,
          galleryImages,
          villaListings,
          totalOrders,
          totalCustomers,
          totalBookings,
          revenue,
          revenueGrowth: Number(revenueGrowth),
          visitors: totalCustomers + totalOrders,
          messages,
        },
        categoryBreakdown,
        recentOrders: recentOrders.map((o) => ({
          _id: o._id,
          user: o.user,
          totalAmount: o.totalAmount,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        })),
        latestActivity: [
          ...latestProducts.map((p) => ({
            type: "product",
            message: `Product "${p.name}" was ${p.status === "published" ? "published" : "saved as draft"}`,
            createdAt: p.createdAt,
          })),
          ...latestBookings.map((b) => ({
            type: "booking",
            message: `Booking for "${b.room?.name || "a villa"}" was ${b.status}`,
            createdAt: b.createdAt,
          })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
};
