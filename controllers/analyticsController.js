const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Booking = require("../models/Booking");

exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), 0, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalRevenue,
      totalOrders,
      paidOrders,
      totalCustomers,
      monthlyRevenue,
      topProducts,
      categorySales,
      orderStatusBreakdown,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.product",
            totalSold: { $sum: "$products.quantity" },
            revenue: { $sum: { $multiply: ["$products.quantity", "$totalAmount"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        { $project: { name: "$product.name", totalSold: 1, revenue: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name").lean(),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const avgOrderValue = paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: revenue,
          totalOrders,
          paidOrders,
          totalCustomers,
          averageOrderValue: avgOrderValue,
          conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : "0",
        },
        monthlyTrends: monthlyRevenue.map((m) => ({
          year: m._id.year,
          month: m._id.month,
          revenue: m.revenue,
          orders: m.orders,
        })),
        topProducts: topProducts.map((p) => ({
          name: p.name || "Deleted Product",
          totalSold: p.totalSold,
          revenue: p.revenue,
        })),
        orderStatusBreakdown,
        recentOrders,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
};
