// controllers/razorpayWebhook.js

const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Product = require("../models/Product");
const Room = require("../models/Room");

exports.razorpayWebhook = async (
  req,
  res
) => {

  const session =
    await mongoose.startSession();

  try {

    // =====================================================
    // VALIDATE SIGNATURE
    // =====================================================

    const signature =
      req.headers[
      "x-razorpay-signature"
      ];

    if (!signature) {

      return res
        .status(400)
        .send("Missing signature");
    }

    const rawBody = req.body;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_WEBHOOK_SECRET
        )
        .update(rawBody)
        .digest("hex");

    if (
      expectedSignature !==
      signature
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
      `📩 Razorpay Event: ${event.event}`
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
      // HANDLE PRODUCT ORDER
      // =====================================================

      const order =
        await Order.findOneAndUpdate(
          {
            razorpayOrderId,

            paymentStatus: {
              $ne: "paid",
            },

            webhookProcessed: {
              $ne: true,
            },
          },

          {
            $set: {
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

              paidAt:
                new Date(),
            },
          },

          {
            new: true,
            session,
          }
        );

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

          if (!updatedProduct) {

            console.log(
              `❌ Insufficient stock for ${item.product.name}`
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

        console.log(
          `✅ Product order processed: ${order._id}`
        );

        return res.json({
          success: true,
          type: "product",
          status:
            "product_processed",
        });
      }

      // =====================================================
      // HANDLE BOOKING
      // =====================================================

      await Booking.findOneAndUpdate(
        {
          razorpayOrderId,
        },

        {
          paymentStatus: "paid",

          status: "confirmed",

          razorpayPaymentId:
            payment.id,

          razorpaySignature:
            signature,

          webhookProcessed: true,

          paidAt: new Date(),

          $unset: {
            expiresAt: 1,
          },
        },

        {
          new: true,
          session,
        }
      );

      if (booking) {

        // =====================================================
        // UNBLOCK ROOM
        // =====================================================

        await Room.findByIdAndUpdate(
          booking.room,
          {
            $set: {
              isBlocked: false,
              blockedUntil: null,
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

        console.log(
          `✅ Booking processed: ${booking._id}`
        );

        return res.json({
          success: true,
          type: "booking",
          status:
            "booking_processed",
        });
      }

      // =====================================================
      // NOTHING FOUND
      // =====================================================

      await session.abortTransaction();

      session.endSession();

      return res.json({
        success: false,
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
      // PRODUCT PAYMENT FAILED
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
            $set: {
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
          },

          {
            new: true,
          }
        );

      if (order) {

        console.log(
          `❌ Product payment failed: ${order._id}`
        );

        return res.json({
          success: true,
          type: "product",
          status:
            "payment_failed",
        });
      }

      // =====================================================
      // BOOKING PAYMENT FAILED
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
            $set: {
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
          },

          {
            new: true,
          }
        );

      if (booking) {

        // =====================================================
        // UNBLOCK ROOM
        // =====================================================

        await Room.findByIdAndUpdate(
          booking.room,
          {
            $set: {
              isBlocked: false,
              blockedUntil: null,
            },
          }
        );

        console.log(
          `❌ Booking payment failed: ${booking._id}`
        );

        return res.json({
          success: true,
          type: "booking",
          status:
            "payment_failed",
        });
      }

      return res.json({
        success: false,
        status:
          "payment_record_not_found",
      });
    }

    // =====================================================
    // IGNORE OTHER EVENTS
    // =====================================================

    return res.json({
      success: true,
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
        "Transaction Abort Error:",
        abortErr
      );
    }

    session.endSession();

    console.error(
      "🔥 Razorpay Webhook Error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: "Webhook processing failed",
    });
  }
};