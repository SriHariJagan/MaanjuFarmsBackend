// controllers/orderController.js

const mongoose = require("mongoose");
const Order = require("../models/Order");

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const {
      search,
      status,
      paymentStatus,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    let filter = {};

    if (search) {
      const orConditions = [
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "deliveryAddress.email": { $regex: search, $options: "i" } },
        { "deliveryAddress.phone": { $regex: search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.unshift({ _id: search });
      }

      filter.$or = orConditions;
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const hasPagination = page && limit;

    if (hasPagination) {
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const sortField = sortBy || "createdAt";
      const sortDir = sortOrder === "asc" ? 1 : -1;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate("user", "name email")
          .populate("products.product")
          .sort({ [sortField]: sortDir })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Order.countDocuments(filter),
      ]);

      return res.json({
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        orders,
      });
    }

    const sortField = sortBy || "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("products.product")
      .sort({ [sortField]: sortDir });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};


//
// ✅ UPDATE ORDER STATUS + TRACKING
//

exports.updateOrder = async (req, res) => {
  try {
    const {
      status,
      trackingId,
      courierName,
      paymentStatus,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        msg: "Order not found",
      });
    }

    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingId !== undefined) {
      order.trackingId = trackingId;
    }

    if (courierName !== undefined) {
      order.courierName = courierName;
    }

    if (status === "shipped") {
      order.shippedAt = new Date();
    }

    await order.save();

    res.json({
      msg: "Order updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};