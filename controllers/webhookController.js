const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/Order");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Room = require("../models/Room");

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status !== "paid") {
        return res.json({ received: true });
      }

      const type = session.metadata?.type;

      // ================= PRODUCT =================
      if (type === "product") {
        const order = await Order.findOne({
          stripeSessionId: session.id,
        });

        if (!order || order.paymentStatus === "paid") {
          return res.json({ received: true });
        }

        order.paymentStatus = "paid";
        order.status = "confirmed";
        await order.save();

        await User.findByIdAndUpdate(order.user, {
          $set: { cart: [] },
        });

        console.log("✅ Product order completed");
      }

      // ================= BOOKING =================
      // inside webhook
      if (type === "booking") {
        const {
          roomId,
          userId,
          checkIn,
          checkOut,
          guests,
        } = session.metadata;


        console.log("📦 Creating booking from webhook:", session.id);

        // prevent duplicate
        const exists = await Booking.findOne({
          stripeSessionId: session.id,
        });

        if (exists) {
          console.log("⚠️ Booking already exists");
          return res.json({ received: true });
        }

        const booking = await Booking.create({
          user: userId,
          room: roomId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guests,
          status: "confirmed",
          paymentStatus: "paid",
          stripeSessionId: session.id,
        });

      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
};