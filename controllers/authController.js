const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendMail = require("../mails/sendMail");

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

// 🔹 Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ msg: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f0f7f0;font-family:'Segoe UI',Arial,sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f7f0;padding:20px;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
            <tr><td style="background:linear-gradient(135deg,#2e7d32,#1b5e20);padding:30px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#ffffff;">🌿 Manjoo Farming</h1>
              <p style="margin:8px 0 0;color:#a5d6a7;font-size:14px;">Fresh & Organic From Our Farm to Your Home</p>
            </td></tr>
            <tr><td style="padding:30px;">
              <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 20px;">Hello <strong style="color:#1e4620;">${user.name}</strong>,</p>
              <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">We received a request to reset the password for your Manjoo Farming account. Click the button below to set a new password.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#2e7d32,#1b5e20);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Reset Password</a>
              </div>
              <p style="font-size:13px;color:#888;line-height:1.7;margin:0 0 8px;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
              <p style="font-size:13px;color:#888;line-height:1.7;margin:0;">If the button doesn't work, copy and paste this URL into your browser:</p>
              <p style="font-size:12px;color:#2e7d32;word-break:break-all;margin:4px 0 0;">${resetUrl}</p>
            </td></tr>
            <tr><td style="background:#1b5e20;padding:16px 30px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a5d6a7;">🌿 Manjoo Farming &copy; ${new Date().getFullYear()}</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request — Manjoo Farming",
      html,
    });

    res.json({ msg: "If an account with that email exists, a password reset link has been sent." });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 🔹 Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ msg: "Password has been reset successfully. You can now log in with your new password." });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};