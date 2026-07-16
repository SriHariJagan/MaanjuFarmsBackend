const Order = require("../models/Order");
const generateInvoice = require("../utils/generateInvoice");

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const {
      status, paymentStatus, search,
      startDate, endDate,
      page = 1, limit = 20, sort = "-createdAt",
    } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "deliveryAddress.email": { $regex: search, $options: "i" } },
        { "deliveryAddress.phone": { $regex: search, $options: "i" } },
        { razorpayOrderId: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = {};
    if (sort.startsWith("-")) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate("user", "name email")
        .populate("products.product")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product")
      .lean();
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status, trackingId, courierName, paymentStatus, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingId !== undefined) order.trackingId = trackingId;
    if (courierName !== undefined) order.courierName = courierName;
    if (status === "shipped") order.shippedAt = new Date();

    if (!order.timeline) order.timeline = [];
    if (status) {
      order.timeline.push({
        status,
        note: note || "",
        timestamp: new Date(),
      });
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getOrderTimeline = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("status timeline createdAt updatedAt").lean();
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product")
      .lean();
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    const invoiceData = {
      name: order.deliveryAddress?.name || order.user?.name || "Customer",
      email: order.deliveryAddress?.email || order.user?.email || "",
      invoiceId: order.razorpayOrderId || order._id.toString(),
      items: (order.products || []).map((p) => ({
        name: p.product?.name || "Product",
        quantity: p.quantity,
        price: p.product?.price || 0,
      })),
      totalAmount: order.totalAmount,
    };

    const pdfBuffer = await generateInvoice(invoiceData);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order._id}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to generate invoice" });
  }
};

exports.exportOrdersCSV = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 })
      .lean();

    const headers = "OrderID,Date,Customer,Email,Products,Total,Status,Payment,Tracking\n";
    const rows = orders.map((o) => {
      const products = (o.products || [])
        .map((p) => `${p.product?.name || "Unknown"} x${p.quantity}`)
        .join("; ");
      return [
        o._id,
        new Date(o.createdAt).toISOString().split("T")[0],
        `"${o.deliveryAddress?.name || o.user?.name || ""}"`,
        o.deliveryAddress?.email || o.user?.email || "",
        `"${products}"`,
        o.totalAmount,
        o.status,
        o.paymentStatus,
        o.trackingId || "",
      ].join(",");
    });

    const csv = headers + rows.join("\n");
    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orders-export.csv",
    });
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to export orders" });
  }
};
