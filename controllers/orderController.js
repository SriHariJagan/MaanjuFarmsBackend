const Order = require("../models/Order");

exports.getUserOrders = async (req, res) => {

  try {

    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    res.status(500).json({ msg: "Server error", error: err.message });

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

    res.status(500).json({ msg: "Server error", error: err.message });

  }

};