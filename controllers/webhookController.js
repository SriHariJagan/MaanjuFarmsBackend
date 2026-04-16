const crypto = require("crypto");

const Order = require("../models/Order");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Product = require("../models/Product");

// ⚠️ In production use Redis instead of memory
const processedPayments = new Set();

exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).send("Missing signature");
    }

    // ✅ RAW BODY (Buffer)
    const rawBody = req.body;

    // ================= VERIFY SIGNATURE =================
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    // ================= PARSE EVENT =================
    const event = JSON.parse(rawBody.toString());

    console.log("📩 Webhook event:", event.event);

    if (event.event !== "payment.captured") {
      return res.json({ status: "ignored" });
    }

    const payment = event.payload.payment.entity;

    // ================= IDEMPOTENCY =================
    if (processedPayments.has(payment.id)) {
      return res.json({ status: "duplicate_skipped" });
    }

    processedPayments.add(payment.id);

    const razorpayOrderId = payment.order_id;

    // ================= PRODUCT ORDER =================
    const order = await Order.findOne({ razorpayOrderId });

    if (order) {
      if (order.paymentStatus === "paid") {
        return res.json({ status: "already_processed" });
      }

      const updatedOrder = await Order.findOneAndUpdate(
        {
          razorpayOrderId,
          paymentStatus: "pending",
        },
        {
          paymentStatus: "paid",
          status: "confirmed",
          razorpayPaymentId: payment.id,
        },
        { new: true }
      );

      if (!updatedOrder) {
        return res.json({ status: "race_condition_prevented" });
      }

      const populated = await Order.findById(updatedOrder._id)
        .populate("products.product user");

      // ✅ Reduce stock safely
      for (const item of populated.products) {
        await Product.findOneAndUpdate(
          { _id: item.product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }

      // ✅ Clear user cart
      await User.findByIdAndUpdate(populated.user._id, {
        $set: { cart: [] },
      });

      console.log("✅ Product order processed");

      return res.json({ status: "product_done" });
    }

    // ================= BOOKING =================
    const booking = await Booking.findOne({ razorpayOrderId });

    if (booking) {
      if (booking.paymentStatus === "paid") {
        return res.json({ status: "already_processed" });
      }

      await Booking.findOneAndUpdate(
        {
          razorpayOrderId,
          paymentStatus: "pending",
        },
        {
          paymentStatus: "paid",
          status: "confirmed",
          razorpayPaymentId: payment.id,
        }
      );

      console.log("✅ Booking processed");

      return res.json({ status: "booking_done" });
    }

    return res.json({ status: "not_found" });

  } catch (err) {
    console.error("🔥 Webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
};