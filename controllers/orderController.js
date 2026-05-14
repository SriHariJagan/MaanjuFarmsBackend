// controllers/orderController.js

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
    const orders = await Order.find()
      .populate("user", "name email")
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