const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const Room = require("../models/Room");

const PERIOD_FORMATS = {
  daily:   { group: "%Y-%m-%d",  label: "yyyy-MM-dd" },
  weekly:  { group: "%Y-W%V",    label: "yyyy-Www"   },
  monthly: { group: "%Y-%m",     label: "yyyy-MM"    },
  yearly:  { group: "%Y",        label: "yyyy"       },
};

const getPeriod = (query) => {
  const period = query.period || "monthly";
  return PERIOD_FORMATS[period] || PERIOD_FORMATS.monthly;
};

const dateGroupStage = (format, dateField) => ({
  $group: {
    _id: { $dateToString: { format: format.group, date: `$${dateField}` } },
    count: { $sum: 1 },
  },
});

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const format = getPeriod(req.query);

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: format.group, date: "$paidAt" } },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const total = revenue.reduce((acc, r) => acc + r.revenue, 0);

    res.json({ period: req.query.period || "monthly", total, breakdown: revenue });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getOrderAnalytics = async (req, res) => {
  try {
    const format = getPeriod(req.query);
    const dateField = "createdAt";

    const [trends, statusBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: {} },
        dateGroupStage(format.group, dateField),
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts = statusBreakdown.reduce(
      (acc, s) => ({ ...acc, [s._id]: s.count }), {}
    );

    res.json({
      period: req.query.period || "monthly",
      trends,
      statusBreakdown: statusCounts,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getBookingAnalytics = async (req, res) => {
  try {
    const format = getPeriod(req.query);
    const dateField = "createdAt";

    const [trends, statusBreakdown] = await Promise.all([
      Booking.aggregate([
        { $match: {} },
        dateGroupStage(format.group, dateField),
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts = statusBreakdown.reduce(
      (acc, s) => ({ ...acc, [s._id]: s.count }), {}
    );

    res.json({
      period: req.query.period || "monthly",
      trends,
      statusBreakdown: statusCounts,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getProductAnalytics = async (req, res) => {
  try {
    const [topSelling, totalUnits, categoryDist] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.product",
            totalSold: { $sum: "$products.quantity" },
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
        { $unwind: "$product" },
        {
          $project: {
            _id: 1,
            name: "$product.name",
            category: "$product.category",
            price: "$product.price",
            image: "$product.image",
            unit: "$product.unit",
            totalSold: 1,
          },
        },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            total: { $sum: "$products.quantity" },
          },
        },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const categoryDistribution = categoryDist.reduce(
      (acc, c) => ({ ...acc, [c._id]: c.count }), {}
    );

    res.json({
      topSelling,
      totalUnitsSold: totalUnits.length ? totalUnits[0].total : 0,
      categoryDistribution,
      totalProducts: categoryDist.reduce((acc, c) => acc + c.count, 0),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getRoomAnalytics = async (req, res) => {
  try {
    const format = getPeriod(req.query);

    const [mostBooked, bookingFrequency] = await Promise.all([
      Booking.aggregate([
        { $match: { status: { $in: ["confirmed", "pending"] } } },
        { $group: { _id: "$room", bookingCount: { $sum: 1 } } },
        { $sort: { bookingCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "rooms",
            localField: "_id",
            foreignField: "_id",
            as: "room",
          },
        },
        { $unwind: "$room" },
        {
          $project: {
            _id: 1,
            name: "$room.name",
            category: "$room.category",
            type: "$room.type",
            price: "$room.price",
            bookingCount: 1,
          },
        },
      ]),
      Booking.aggregate([
        { $match: {} },
        {
          $group: {
            _id: { $dateToString: { format: format.group, date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      period: req.query.period || "monthly",
      mostBooked,
      bookingFrequency,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
