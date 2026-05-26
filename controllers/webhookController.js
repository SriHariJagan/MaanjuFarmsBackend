// controllers/razorpayWebhook.js

const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Product = require("../models/Product");

const sendMailByType = require("../mails/mailTypes");

exports.razorpayWebhook = async (req, res) => {

  const session =
    await mongoose.startSession();

  try {

    // =====================================================
    // SIGNATURE VALIDATION
    // =====================================================

    const signature =
      req.headers["x-razorpay-signature"];

    if (!signature) {

      return res
        .status(400)
        .send("Missing signature");
    }

    const rawBody = req.body;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env
          .RAZORPAY_WEBHOOK_SECRET
      )
      .update(rawBody)
      .digest("hex");

    if (
      expectedSignature !== signature
    ) {

      console.log(
        "❌ Invalid webhook signature"
      );

      return res
        .status(400)
        .send("Invalid signature");
    }

    // =====================================================
    // PARSE EVENT
    // =====================================================

    const event = JSON.parse(
      rawBody.toString()
    );

    console.log(
      "📩 Razorpay Webhook:",
      event.event
    );

    // =====================================================
    // PAYMENT CAPTURED
    // =====================================================

    if (
      event.event ===
      "payment.captured"
    ) {

      const payment =
        event.payload.payment.entity;

      // =====================================================
      // EXTRA SAFETY
      // =====================================================

      if (
        payment.status !==
        "captured"
      ) {

        return res.json({
          status:
            "payment_not_captured",
        });
      }

      const razorpayOrderId =
        payment.order_id;

      // =====================================================
      // START TRANSACTION
      // =====================================================

      session.startTransaction();

      // =====================================================
      // PRODUCT ORDER
      // =====================================================

      const order =
        await Order.findOneAndUpdate(
          {
            razorpayOrderId,

            paymentStatus: {
              $ne: "paid",
            },

            webhookProcessed:
              false,
          },

          {
            paymentStatus:
              "paid",

            status:
              "confirmed",

            razorpayPaymentId:
              payment.id,

            razorpaySignature:
              signature,

            webhookProcessed:
              true,
            paidAt: new Date(),
          },

          {
            new: true,
            session,
          }
        );

      // =====================================================
      // PRODUCT ORDER FOUND
      // =====================================================

      if (order) {

        const populatedOrder =
          await Order.findById(
            order._id
          )
            .populate(
              "products.product"
            )
            .populate("user")
            .session(session);

        if (!populatedOrder) {

          await session.abortTransaction();

          session.endSession();

          return res.json({
            status:
              "order_not_found",
          });
        }

        // =====================================================
        // REDUCE STOCK
        // =====================================================

        for (const item of populatedOrder.products) {

          const updatedProduct =
            await Product.findOneAndUpdate(
              {
                _id:
                  item.product._id,

                stock: {
                  $gte:
                    item.quantity,
                },
              },

              {
                $inc: {
                  stock:
                    -item.quantity,
                },
              },

              {
                new: true,
                session,
              }
            );

          // =====================================================
          // STOCK FAILURE
          // =====================================================

          if (!updatedProduct) {

            console.log(
              `❌ Stock unavailable for ${item.product.name}`
            );

            await session.abortTransaction();

            session.endSession();

            return res.json({
              status:
                "stock_unavailable",

              product:
                item.product.name,
            });
          }
        }

        // =====================================================
        // CLEAR USER CART
        // =====================================================

        await User.findByIdAndUpdate(
          populatedOrder.user._id,

          {
            $set: {
              cart: [],
            },
          },

          {
            session,
          }
        );

        // =====================================================
        // COMMIT TRANSACTION
        // =====================================================

        await session.commitTransaction();

        session.endSession();

        // =====================================================
        // SEND MAILS
        // =====================================================

        try {

          await sendMailByType(
            "PRODUCT_ORDER",
            {
              user:
                populatedOrder.user,

              orderId:
                populatedOrder._id,

              products:
                populatedOrder.products,

              totalAmount:
                populatedOrder.totalAmount,

              address:
                populatedOrder.deliveryAddress,
            }
          );

        } catch (mailErr) {

          console.error(
            "PRODUCT MAIL ERROR:",
            mailErr
          );
        }

        console.log(
          "✅ Product order processed:",
          order._id
        );

        return res.json({
          status:
            "product_done",
        });
      }

      // =====================================================
      // BOOKING PAYMENT
      // =====================================================

      const booking =
        await Booking.findOneAndUpdate(
          {
            razorpayOrderId,

            paymentStatus: {
              $ne: "paid",
            },

            webhookProcessed:
              false,
          },

          {
            paymentStatus:
              "paid",

            status:
              "confirmed",

            razorpayPaymentId:
              payment.id,

            razorpaySignature:
              signature,

            webhookProcessed:
              true,

            paidAt: new Date(),
          },

          {
            new: true,
            session,
          }
        );

      // =====================================================
      // BOOKING FOUND
      // =====================================================

      if (booking) {

        await session.commitTransaction();

        session.endSession();

        // =====================================================
        // POPULATE BOOKING
        // =====================================================

        const populatedBooking =
          await Booking.findById(
            booking._id
          )
            .populate("user")
            .populate("room");

        // =====================================================
        // SEND MAILS
        // =====================================================

        try {

          await sendMailByType(
            "VILLA_BOOKING",
            {
              user:
                populatedBooking.user,

              bookingId:
                populatedBooking._id,

              room:
                populatedBooking.room,

              checkIn:
                populatedBooking.checkIn,

              checkOut:
                populatedBooking.checkOut,

              totalAmount:
                populatedBooking.totalAmount,

              guestDetails:
                populatedBooking.guestDetails,
            }
          );

        } catch (mailErr) {

          console.error(
            "BOOKING MAIL ERROR:",
            mailErr
          );
        }

        console.log(
          "✅ Booking processed:",
          booking._id
        );

        return res.json({
          status:
            "booking_done",
        });
      }

      // =====================================================
      // NOTHING FOUND
      // =====================================================

      await session.abortTransaction();

      session.endSession();

      return res.json({
        status:
          "order_not_found",
      });
    }

    // =====================================================
    // PAYMENT FAILED
    // =====================================================

    if (
      event.event ===
      "payment.failed"
    ) {

      const payment =
        event.payload.payment.entity;

      const razorpayOrderId =
        payment.order_id;

      // =====================================================
      // PRODUCT FAILED
      // =====================================================

      const order =
        await Order.findOneAndUpdate(
          {
            razorpayOrderId,

            paymentStatus: {
              $ne: "paid",
            },
          },

          {
            paymentStatus:
              "failed",

            status:
              "payment_failed",

            razorpayPaymentId:
              payment.id || "",

            failureReason:
              payment.error_description ||
              "",
          },

          {
            new: true,
          }
        );

      if (order) {

        console.log(
          "❌ Product payment failed:",
          order._id
        );

        return res.json({
          status:
            "product_failed",
        });
      }

      // =====================================================
      // BOOKING FAILED
      // =====================================================

      const booking =
        await Booking.findOneAndUpdate(
          {
            razorpayOrderId,

            paymentStatus: {
              $ne: "paid",
            },
          },

          {
            paymentStatus:
              "failed",

            status:
              "cancelled",

            razorpayPaymentId:
              payment.id || "",

            failureReason:
              payment.error_description ||
              "",
          },

          {
            new: true,
          }
        );

      if (booking) {

        console.log(
          "❌ Booking payment failed:",
          booking._id
        );

        return res.json({
          status:
            "booking_failed",
        });
      }

      return res.json({
        status:
          "failed_order_not_found",
      });
    }

    // =====================================================
    // IGNORE OTHER EVENTS
    // =====================================================

    return res.json({
      status: "ignored",
      event: event.event,
    });

  } catch (err) {

    try {

      if (
        session.inTransaction()
      ) {

        await session.abortTransaction();
      }

    } catch (abortErr) {

      console.error(
        "Abort Transaction Error:",
        abortErr
      );
    }

    session.endSession();

    console.error(
      "🔥 Razorpay Webhook Error:",
      err
    );

    return res.status(500).json({
      error: "Webhook failed",
    });
  }
};