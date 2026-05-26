// controllers/paymentController.js

const Razorpay = require("razorpay");
const crypto = require("crypto");

const User = require("../models/User");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Product = require("../models/Product");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//
// ===========================================
// 🛒 CREATE PRODUCT ORDER
// ===========================================
//

exports.createProductOrder = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        msg: "Delivery address required",
      });
    }

    const user = await User.findById(req.user.id)
      .populate("cart.product");

    if (!user || !user.cart.length) {
      return res.status(400).json({
        success: false,
        msg: "Cart is empty",
      });
    }

    let totalAmount = 0;

    const products = [];

    for (const item of user.cart) {
      const product = item.product;

      if (!product) continue;

      // ================= STOCK CHECK =================

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          msg: `${product.name} stock unavailable`,
        });
      }

      totalAmount += product.price * item.quantity;

      products.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    // ================= CREATE ORDER =================

    const order = await Order.create({
      user: user._id,

      products,

      totalAmount,

      paymentStatus: "pending",

      status: "pending",

      deliveryAddress: {
        name: address.name || "",
        phone: address.phone || "",
        email: address.email || "",
        street: address.street || "",
        apartment: address.apartment || "",
        city: address.city || "",
        district: address.district || "",
        state: address.state || "",
        pincode: address.pincode || "",
      },
    });

    // ================= CREATE RAZORPAY ORDER =================

    const razorOrder = await razorpay.orders.create({
      amount: totalAmount * 100,

      currency: "INR",

      receipt: `order_${order._id}`,

      notes: {
        type: "product",
        orderId: order._id.toString(),
      },
    });

    // ================= SAVE RAZORPAY ORDER ID =================

    order.razorpayOrderId = razorOrder.id;

    await order.save();

    console.log(
      "✅ Product Order Created:",
      order._id
    );

    return res.status(200).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: razorOrder.id,

      amount: razorOrder.amount,

      currency: razorOrder.currency,
    });

  } catch (err) {

    console.error(
      "CREATE PRODUCT ORDER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      msg: "Order creation failed",
    });
  }
};

//
// ===========================================
// 🏨 CREATE BOOKING ORDER
// ===========================================
//

exports.createBookingOrder = async (req, res) => {
  try {

    const {
      villaId,
      checkIn,
      checkOut,
      guestDetails,
    } = req.body;

    const room = await Room.findById(villaId);

    if (!room) {
      return res.status(404).json({
        success: false,
        msg: "Villa not found",
      });
    }

    // ================= VALIDATE DATES =================

    const checkInDate = new Date(checkIn);

    const checkOutDate = new Date(checkOut);

    const nights =
      (checkOutDate - checkInDate) /
      (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid booking dates",
      });
    }

    const total = nights * room.price;

    // ================= CREATE BOOKING =================

    const booking = await Booking.create({
      user: req.user.id,

      room: villaId,

      checkIn,

      checkOut,

      guestDetails,

      totalAmount: total,

      paymentStatus: "pending",

      status: "pending",
    });

    // ================= CREATE RAZORPAY ORDER =================

    const razorOrder = await razorpay.orders.create({
      amount: total * 100,

      currency: "INR",

      receipt: `booking_${booking._id}`,

      notes: {
        type: "booking",
        bookingId: booking._id.toString(),
      },
    });

    booking.razorpayOrderId = razorOrder.id;

    await booking.save();

    console.log(
      "✅ Booking Order Created:",
      booking._id
    );

    return res.status(200).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: razorOrder.id,

      amount: razorOrder.amount,

      currency: razorOrder.currency,
    });

  } catch (err) {

    console.error(
      "BOOKING ORDER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      msg: "Booking failed",
    });
  }
};

//
// ===========================================
// ✅ VERIFY PAYMENT
// ===========================================
//

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // VERIFY SIGNATURE

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }

    // ONLY RETURN SUCCESS TO UI

    return res.status(200).json({
      success: true,
      msg: "Payment verified",
    });

  } catch (err) {

    console.error(
      "VERIFY PAYMENT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      msg: "Payment verification failed",
    });
  }
};

//
// ===========================================
// ❌ MARK PAYMENT FAILED
// ===========================================
//

exports.markPaymentFailed = async (req, res) => {
  try {

    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        msg: "razorpay_order_id required",
      });
    }

    // ================= PRODUCT ORDER =================

    const order = await Order.findOne({
      razorpayOrderId:
        razorpay_order_id,
    });

    if (order) {

      // Prevent overwriting success

      if (
        order.paymentStatus !== "paid"
      ) {

        order.paymentStatus = "failed";

        order.status = "cancelled";

        await order.save();

        console.log(
          "❌ Product Payment Failed:",
          order._id
        );
      }

      return res.status(200).json({
        success: true,
        type: "product",
      });
    }

    // ================= BOOKING =================

    const booking =
      await Booking.findOne({
        razorpayOrderId:
          razorpay_order_id,
      });

    if (booking) {

      // Prevent overwriting success

      if (
        booking.paymentStatus !==
        "paid"
      ) {

        booking.paymentStatus =
          "failed";

        booking.status =
          "cancelled";

        await booking.save();

        console.log(
          "❌ Booking Payment Failed:",
          booking._id
        );
      }

      return res.status(200).json({
        success: true,
        type: "booking",
      });
    }

    return res.status(404).json({
      success: false,
      msg: "Order not found",
    });

  } catch (err) {

    console.error(
      "MARK FAILED ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      msg: "Failed to update payment",
    });
  }
};