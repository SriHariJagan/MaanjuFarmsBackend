const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Admin email (only this account will be admin)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@maanjufarms.com";

// 🔹 Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role: admin only if email matches predefined admin
    const role = email === ADMIN_EMAIL ? "admin" : "user";

    // Create user
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ msg: "User created successfully", role });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 🔹 Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};