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
// 🛒 CREATE PRODUCT ORDER
//
exports.createProductOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");

    if (!user?.cart?.length) {
      return res.status(400).json({ msg: "Cart empty" });
    }

    let totalAmount = 0;

    const products = user.cart.map((item) => {
      totalAmount += item.product.price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
      };
    });

    const order = await Order.create({
      user: user._id,
      products,
      totalAmount,
      paymentStatus: "pending",
      status: "pending",
    });

    const razorOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        type: "product",
        orderId: order._id.toString(),
      },
    });

    order.razorpayOrderId = razorOrder.id;
    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorOrder.id,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Order creation failed" });
  }
};

//
// 🏨 CREATE BOOKING ORDER
//
exports.createBookingOrder = async (req, res) => {
  try {
    const { villaId, checkIn, checkOut, guestDetails } = req.body;

    const room = await Room.findById(villaId);
    if (!room) return res.status(404).json({ msg: "Villa not found" });

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

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorOrder.id,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Booking failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false });
    }

    // only check status (NO business logic)
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });

    if (order?.paymentStatus === "paid") {
      return res.json({ success: true, type: "product" });
    }

    if (booking?.paymentStatus === "paid") {
      return res.json({ success: true, type: "booking" });
    }

    return res.json({ success: true, type: "processing" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};