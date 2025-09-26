const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// Create new order from cart
exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (user.cart.length === 0) return res.status(400).json({ msg: "Cart is empty" });

    let totalAmount = 0;
    const products = user.cart.map(item => {
      totalAmount += item.product.price * item.quantity;
      return { product: item.product._id, quantity: item.quantity };
    });

    const order = new Order({ user: user._id, products, totalAmount });
    await order.save();

    // Clear user's cart
    user.cart = [];
    await user.save();

    res.json({ msg: "Order placed", order });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get logged-in user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("products.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
