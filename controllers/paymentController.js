// controllers/paymentController.js

const Razorpay = require("razorpay");
const crypto = require("crypto");

const User = require("../models/User");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

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
      return res.status(400).json({ msg: "Delivery address required" });
    }

    const user = await User.findById(req.user.id).populate("cart.product");

    if (!user || !user.cart.length) {
      return res.status(400).json({
        msg: "Cart is empty",
      });
    }

    let totalAmount = 0;

    const products = [];

    for (const item of user.cart) {
      const product = item.product;

      if (!product) continue;

      // STOCK CHECK
      if (product.stock < item.quantity) {
        return res.status(400).json({
          msg: `${product.name} stock unavailable`,
        });
      }

      totalAmount += product.price * item.quantity;

      products.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    // CREATE ORDER
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

    // CREATE RAZORPAY ORDER
    const razorOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",

      receipt: `order_${order._id}`,

      notes: {
        type: "product",
        orderId: order._id.toString(),
      },
    });

    // SAVE RAZORPAY ORDER ID
    order.razorpayOrderId = razorOrder.id;

    await order.save();

    res.status(200).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: razorOrder.id,

      amount: razorOrder.amount,

      currency: razorOrder.currency,
    });

    console.log("✅ Product Order Created:", order._id);
  } catch (err) {
    console.error("CREATE PRODUCT ORDER ERROR:", err);

    res.status(500).json({
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
    const { villaId, checkIn, checkOut, guestDetails } = req.body;

    const room = await Room.findById(villaId);

    if (!room) {
      return res.status(404).json({
        msg: "Villa not found",
      });
    }

    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    const total = nights * room.price;

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

    res.status(200).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: razorOrder.id,

      amount: razorOrder.amount,

      currency: razorOrder.currency,
    });
  } catch (err) {
    console.error("BOOKING ORDER ERROR:", err);

    res.status(500).json({
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // VERIFY SIGNATURE
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }

    //
    // =================================
    // PRODUCT ORDER
    // =================================
    //

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (order) {
      // PREVENT DUPLICATE UPDATE
      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";

        order.status = "confirmed";

        order.razorpayPaymentId = razorpay_payment_id;

        order.razorpaySignature = razorpay_signature;

        await order.save();

        // CLEAR CART
        await User.findByIdAndUpdate(order.user, {
          cart: [],
        });

        console.log("✅ Product Payment Verified:", order._id);
      }

      return res.status(200).json({
        success: true,
        type: "product",
      });
    }

    //
    // =================================
    // BOOKING PAYMENT
    // =================================
    //

    const booking = await Booking.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (booking) {
      if (booking.paymentStatus !== "paid") {
        booking.paymentStatus = "paid";

        booking.status = "confirmed";

        booking.razorpayPaymentId = razorpay_payment_id;

        booking.razorpaySignature = razorpay_signature;

        await booking.save();

        console.log("✅ Booking Payment Verified:", booking._id);
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
    console.error("VERIFY PAYMENT ERROR:", err);

    res.status(500).json({
      success: false,
      msg: "Payment verification failed",
    });
  }
};
