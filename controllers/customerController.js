const User = require("../models/User");
const Order = require("../models/Order");
const Booking = require("../models/Booking");

exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sort = "-createdAt" } = req.query;

    let filter = { role: "user" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = {};
    if (sort.startsWith("-")) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [total, customers] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);

    const customersWithMeta = await Promise.all(
      customers.map(async (c) => {
        const [orderCount, totalSpent, bookingCount] = await Promise.all([
          Order.countDocuments({ user: c._id }),
          Order.aggregate([
            { $match: { user: c._id, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
          Booking.countDocuments({ user: c._id }),
        ]);
        return {
          ...c,
          orderCount,
          totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
          bookingCount,
        };
      })
    );

    res.json({
      success: true,
      data: {
        customers: customersWithMeta,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch customers" });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-password").lean();
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    const [orders, bookings] = await Promise.all([
      Order.find({ user: customer._id }).sort({ createdAt: -1 }).lean(),
      Booking.find({ user: customer._id }).populate("room", "name").sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      success: true,
      data: { ...customer, orders, bookings },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch customer" });
  }
};
