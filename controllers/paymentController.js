const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const User = require("../models/User");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

//
// 🛒 PRODUCT CHECKOUT
//
exports.createProductCheckout = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ msg: "Address required" });
    }

    const user = await User.findById(req.user.id).populate("cart.product");

    if (!user || user.cart.length === 0) {
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

    // ✅ Create order BEFORE payment
    const order = await Order.create({
      user: req.user.id,
      products,
      totalAmount,
      deliveryAddress: address,
      paymentStatus: "pending",
    });

    const line_items = user.cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: user.email,

      metadata: {
        type: "product",
        orderId: order._id.toString(),
      },

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed?error=Payment cancelled`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Payment error", error: err.message });
  }
};


//
// 🏨 BOOKING CHECKOUT (NO DB WRITE HERE)
//
exports.createBookingCheckout = async (req, res) => {
  try {
    const { villaId, checkIn, checkOut, guests } = req.body;

    if (!villaId || !checkIn || !checkOut) {
      return res.status(400).json({ msg: "Missing booking data" });
    }

    const room = await Room.findById(villaId);
    if (!room) {
      return res.status(404).json({ msg: "Villa not found" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ msg: "Invalid dates" });
    }

    const nights =
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

    const total = nights * room.price;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${room.name} (${nights} nights)`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        type: "booking",
        userId: req.user.id,
        roomId: villaId,
        checkIn,
        checkOut,
        guests,
      },

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed?error=Booking cancelled`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Stripe error", error: err.message });
  }
};


//
// 🔍 VERIFY SESSION (CREATE BOOKING HERE)
//
exports.verifySession = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.json({ success: false });
    }

    const metadata = session.metadata;

    /* ================= PRODUCT ================= */
    if (metadata.type === "product") {
      const order = await Order.findOne({
        stripeSessionId: session_id,
      });

      if (!order) {
        return res.status(404).json({ success: false });
      }

      order.paymentStatus = "paid";
      await order.save();

      // Clear cart
      await User.findByIdAndUpdate(order.user, {
        $set: { cart: [] },
      });

      return res.json({ success: true, type: "product" });
    }

    /* ================= BOOKING ================= */
    if (metadata.type === "booking") {
      const { userId, roomId, checkIn, checkOut, guests } = metadata;

      // ✅ Prevent duplicate booking
      const existingBooking = await Booking.findOne({
        stripeSessionId: session_id,
      });

      if (existingBooking) {
        return res.json({ success: true, type: "booking" });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false });
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const nights =
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

      const total = nights * room.price;

      // ✅ CREATE BOOKING AFTER PAYMENT
      await Booking.create({
        user: userId,
        room: roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalAmount: total,
        paymentStatus: "paid",
        stripeSessionId: session_id,
      });

      return res.json({ success: true, type: "booking" });
    }

    return res.json({ success: false });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false });
  }
};