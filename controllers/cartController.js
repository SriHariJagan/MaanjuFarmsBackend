const User = require("../models/User");
const Product = require("../models/Product");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    let user = await User.findById(userId);
    const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    res.json({ msg: "Product added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { productId } = req.body;
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    res.json({ msg: "Product removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
