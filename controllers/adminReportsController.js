const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const { generateCsv, generatePdf } = require("../utils/reportHelpers");

const buildDateMatch = (fromDate, toDate) => {
  const match = {};
  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = new Date(fromDate);
    if (toDate) match.createdAt.$lte = new Date(toDate);
  }
  return match;
};

const handleFormat = (req, res, data, columns, title, jsonTransformer) => {
  const format = req.query.format || "json";

  if (format === "csv") {
    const csv = generateCsv(columns, data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.csv"`);
    return res.send(csv);
  }

  if (format === "pdf") {
    const pdfColumns = columns.map((c) => ({ label: c.label, accessor: c.accessor }));
    return generatePdf(title, pdfColumns, data, res);
  }

  const result = jsonTransformer ? jsonTransformer(data) : data;
  res.json(result);
};

exports.getSalesReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const dateMatch = buildDateMatch(fromDate, toDate);

    const sales = await Order.aggregate([
      { $match: dateMatch },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          date: "$createdAt",
          orderId: { $toString: "$_id" },
          customerName: "$user.name",
          customerEmail: "$user.email",
          itemCount: { $size: "$products" },
          totalAmount: 1,
          status: 1,
          paymentStatus: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    const columns = [
      { key: "date", label: "Date", accessor: (r) => r.date ? new Date(r.date).toLocaleDateString() : "" },
      { key: "orderId", label: "Order ID", accessor: (r) => r.orderId },
      { key: "customerName", label: "Customer Name", accessor: (r) => r.customerName || "" },
      { key: "customerEmail", label: "Customer Email", accessor: (r) => r.customerEmail || "" },
      { key: "itemCount", label: "Items", accessor: (r) => r.itemCount },
      { key: "totalAmount", label: "Total (₹)", accessor: (r) => r.totalAmount?.toFixed(2) },
      { key: "status", label: "Status", accessor: (r) => r.status },
      { key: "paymentStatus", label: "Payment", accessor: (r) => r.paymentStatus },
    ];

    handleFormat(req, res, sales, columns, "sales-report");
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getBookingsReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const dateMatch = buildDateMatch(fromDate, toDate);

    const bookings = await Booking.aggregate([
      { $match: dateMatch },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          date: "$createdAt",
          bookingId: { $toString: "$_id" },
          customerName: "$user.name",
          customerEmail: "$user.email",
          roomName: "$room.name",
          checkIn: 1,
          checkOut: 1,
          guests: 1,
          totalAmount: 1,
          status: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    const columns = [
      { key: "date", label: "Date", accessor: (r) => r.date ? new Date(r.date).toLocaleDateString() : "" },
      { key: "bookingId", label: "Booking ID", accessor: (r) => r.bookingId },
      { key: "customerName", label: "Customer", accessor: (r) => r.customerName || "" },
      { key: "customerEmail", label: "Email", accessor: (r) => r.customerEmail || "" },
      { key: "roomName", label: "Room/Villa", accessor: (r) => r.roomName || "" },
      { key: "checkIn", label: "Check-In", accessor: (r) => r.checkIn ? new Date(r.checkIn).toLocaleDateString() : "" },
      { key: "checkOut", label: "Check-Out", accessor: (r) => r.checkOut ? new Date(r.checkOut).toLocaleDateString() : "" },
      { key: "guests", label: "Guests", accessor: (r) => r.guests },
      { key: "totalAmount", label: "Amount (₹)", accessor: (r) => r.totalAmount?.toFixed(2) },
      { key: "status", label: "Status", accessor: (r) => r.status },
    ];

    handleFormat(req, res, bookings, columns, "bookings-report");
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getProductsReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 }).lean();

    const rows = products.map((p) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      stockStatus: p.stock > 10 ? "In Stock" : p.stock >= 1 ? "Low Stock" : "Out of Stock",
    }));

    const columns = [
      { key: "name", label: "Product Name", accessor: (r) => r.name },
      { key: "category", label: "Category", accessor: (r) => r.category },
      { key: "price", label: "Price (₹)", accessor: (r) => r.price?.toFixed(2) },
      { key: "stock", label: "Stock", accessor: (r) => r.stock },
      { key: "stockStatus", label: "Stock Status", accessor: (r) => r.stockStatus },
    ];

    handleFormat(req, res, rows, columns, "products-report");
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          inStock: { $sum: { $cond: [{ $gt: ["$stock", 10] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $gte: ["$stock", 1] }, { $lte: ["$stock", 10] }] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const allProducts = await Product.find().sort({ name: 1 }).lean();

    const productRows = allProducts.map((p) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      stockValue: p.price * p.stock,
      stockStatus: p.stock > 10 ? "In Stock" : p.stock >= 1 ? "Low Stock" : "Out of Stock",
    }));

    const format = req.query.format || "json";

    if (format === "json") {
      return res.json({ summary, products: productRows });
    }

    const columns = [
      { key: "name", label: "Product Name", accessor: (r) => r.name },
      { key: "category", label: "Category", accessor: (r) => r.category },
      { key: "price", label: "Price (₹)", accessor: (r) => r.price?.toFixed(2) },
      { key: "stock", label: "Stock", accessor: (r) => r.stock },
      { key: "stockValue", label: "Stock Value (₹)", accessor: (r) => r.stockValue?.toFixed(2) },
      { key: "stockStatus", label: "Stock Status", accessor: (r) => r.stockStatus },
    ];

    handleFormat(req, res, productRows, columns, "inventory-report");
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
