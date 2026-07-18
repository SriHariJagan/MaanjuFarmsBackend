// controllers/orderController.js

const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  sendOrderStatusEmail,
  sendAdminNewOrderNotification,
} = require("../utils/emailHelpers");
const generateInvoice = require("../utils/generateInvoice");

// ─── Helper: parse pagination ───────────────────────────────
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─── Helper: build filter from query ────────────────────────
const buildFilters = (query, userId) => {
  const filter = {};
  if (userId) filter.user = userId;

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.paymentStatus && query.paymentStatus !== "all") {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.search) {
    const q = query.search;
    filter.$or = [
      { _id: q.length >= 8 ? { $regex: q, $options: "i" } : undefined },
    ].filter(Boolean);
  }
  return filter;
};

// ─── Helper: build sort from query ──────────────────────────
const buildSort = (query) => {
  switch (query.sortBy) {
    case "oldest":
      return { createdAt: 1 };
    case "amount-high":
      return { totalAmount: -1 };
    case "amount-low":
      return { totalAmount: 1 };
    default:
      return { createdAt: -1 };
  }
};

//
// ─── GET /api/orders/my-orders ──────────────────────────────
//
exports.getUserOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildFilters(req.query, req.user.id);
    const sort = buildSort(req.query);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("products.product")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── GET /api/orders/:id ─────────────────────────────────────
//
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product")
      .populate("user", "name email phone")
      .populate("delivery.updatedBy", "name");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Ownership check
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── GET /api/orders/all ─────────────────────────────────────
//
exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildFilters(req.query);
    const sort = buildSort(req.query);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .populate("products.product")
        .populate("delivery.updatedBy", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── GET /api/orders/stats ───────────────────────────────────
//
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pipeline = [
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
          todayOrders: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", today] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "pending"] }, { $eq: ["$paymentStatus", "paid"] }] },
                1,
                0,
              ],
            },
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          processing: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
          },
          packed: {
            $sum: { $cond: [{ $eq: ["$status", "packed"] }, 1, 0] },
          },
          shipped: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
          outForDelivery: {
            $sum: {
              $cond: [{ $eq: ["$status", "out_for_delivery"] }, 1, 0],
            },
          },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          avgOrderValue: {
            $cond: [
              { $gt: ["$paidOrders", 0] },
              { $divide: ["$totalRevenue", "$paidOrders"] },
              0,
            ],
          },
        },
      },
    ];

    const [stats] = await Order.aggregate(pipeline);

    return res.json({
      success: true,
      stats: stats || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        todayOrders: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        packed: 0,
        shipped: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── PUT /api/orders/:id/status ─────────────────────────────
//
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const validStatuses = Order.getValidStatuses();
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: `Invalid status: ${status}` });
    }

    const order = await Order.findById(orderId)
      .populate("products.product")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Validate transition
    if (!Order.isValidTransition(order.status, status)) {
      return res.status(400).json({
        msg: `Cannot transition from "${order.status}" to "${status}"`,
        currentStatus: order.status,
        allowedTransitions: Order.getStatusFlow()[order.status] || [],
      });
    }

    // Apply status change
    order.status = status;

    // Auto-set delivery dates based on status
    if (status === "shipped" && !order.delivery.shippedDate) {
      order.delivery.shippedDate = new Date();
    }
    if (status === "delivered") {
      order.delivery.deliveredDate = new Date();
    }
    if (status === "cancelled") {
      order.cancelReason = notes || "Cancelled by admin";
    }

    // Add timeline entry with updater info
    order.timeline.push({
      status,
      date: new Date(),
      updatedBy: req.user.id,
      notes: notes || "",
    });

    await order.save();

    // Send email in background (don't block)
    sendOrderStatusEmail({
      order,
      user: order.user,
      status,
      delivery: order.delivery,
    }).catch((e) => console.error("Status email failed:", e.message));

    return res.json({
      success: true,
      msg: `Order status updated to "${status}"`,
      order,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── PUT /api/orders/:id/delivery ────────────────────────────
//
exports.updateDelivery = async (req, res) => {
  try {
    const { partner, trackingNumber, trackingUrl, estimatedDelivery, notes } =
      req.body;

    if (!partner && !trackingNumber) {
      return res.status(400).json({
        msg: "At least courier partner or tracking number is required",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("products.product")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        msg: `Cannot update delivery for ${order.status} orders`,
      });
    }

    order.delivery = {
      ...order.delivery,
      partner: partner || order.delivery.partner,
      trackingNumber: trackingNumber || order.delivery.trackingNumber,
      trackingUrl: trackingUrl || order.delivery.trackingUrl,
      estimatedDelivery: estimatedDelivery
        ? new Date(estimatedDelivery)
        : order.delivery.estimatedDelivery,
      notes: notes || order.delivery.notes,
      updatedBy: req.user.id,
    };

    await order.save();

    // Send email with delivery info for shipped/out_for_delivery
    if (order.status === "shipped" || order.status === "out_for_delivery") {
      sendOrderStatusEmail({
        order,
        user: order.user,
        status: order.status,
        delivery: order.delivery,
      }).catch((e) => console.error("Delivery email failed:", e.message));
    }

    return res.json({
      success: true,
      msg: "Delivery details updated",
      order,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── POST /api/orders/:id/cancel ─────────────────────────────
//
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Ownership check
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!Order.isValidTransition(order.status, "cancelled")) {
      return res.status(400).json({
        msg: `Order in "${order.status}" status cannot be cancelled`,
        allowedTransitions: Order.getStatusFlow()[order.status] || [],
      });
    }

    const wasPaid = order.paymentStatus === "paid";

    order.status = "cancelled";
    order.paymentStatus = wasPaid ? "refunded" : "failed";
    order.cancelReason = reason || "Cancelled by customer";
    order.timeline.push({
      status: "cancelled",
      date: new Date(),
      updatedBy: req.user.id,
      notes: reason || "Cancelled by customer",
    });

    // Restore stock if payment was made
    if (wasPaid) {
      const populated = await Order.findById(order._id).populate("products.product");
      if (populated) {
        for (const item of populated.products) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    await order.save();

    sendOrderStatusEmail({
      order,
      user: order.user,
      status: "cancelled",
    }).catch((e) => console.error("Cancel email failed:", e.message));

    return res.json({ success: true, msg: "Order cancelled", order });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── POST /api/orders/:id/resend-email ───────────────────────
//
exports.resendEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const sent = await sendOrderStatusEmail({
      order,
      user: order.user,
      status: order.status,
      delivery: order.delivery,
    });

    if (sent) {
      return res.json({ success: true, msg: "Email resent successfully" });
    } else {
      return res
        .status(500)
        .json({ success: false, msg: "Failed to send email" });
    }
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ─── GET /api/orders/:id/invoice ──────────────────────────────
//
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ msg: "Invoice is only available for paid orders" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const invoiceData = {
      name: order.deliveryAddress?.name || order.user?.name || "Customer",
      email: order.user?.email || "",
      invoiceId: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      items: order.products.map((item) => ({
        name: item.product?.name || item.nameAtOrder || "Product",
        quantity: item.quantity,
        price: (item.product?.price || item.priceAtOrder || 0) * item.quantity,
      })),
      totalAmount: order.totalAmount || 0,
    };

    const pdfBuffer = await generateInvoice(invoiceData);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order._id.toString().slice(-8)}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
