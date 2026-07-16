const Product = require("../models/Product");
const { deleteFile } = require("../utils/fileCleanup");

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, status } = req.body;

    const errors = {};
    if (!name || !name.trim()) errors.name = "Product name is required";
    if (price === undefined || price === "" || isNaN(Number(price)) || Number(price) < 0)
      errors.price = "Price must be a positive number";
    if (stock === undefined || stock === "" || isNaN(Number(stock)) || Number(stock) < 0)
      errors.stock = "Stock must be a non-negative number";
    if (!category || !category.trim()) errors.category = "Category is required";

    if (Object.keys(errors).length > 0) {
      if (req.file) deleteFile(`/uploads/products/${req.file.filename}`);
      return res.status(400).json({ success: false, error: "Validation failed", fields: errors });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      stock: Number(stock),
      image: req.file ? `/uploads/products/${req.file.filename}` : null,
      category: category.trim(),
      status: status || "published",
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/products/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, status } = req.body;
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      if (req.file) deleteFile(`/uploads/products/${req.file.filename}`);
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const errors = {};
    if (name !== undefined && !name.trim()) errors.name = "Product name cannot be empty";
    if (price !== undefined && price !== "" && (isNaN(Number(price)) || Number(price) < 0))
      errors.price = "Price must be a positive number";
    if (stock !== undefined && stock !== "" && (isNaN(Number(stock)) || Number(stock) < 0))
      errors.stock = "Stock must be a non-negative number";
    if (category !== undefined && !category.trim()) errors.category = "Category cannot be empty";
    if (status !== undefined && !["published", "draft"].includes(status))
      errors.status = "Status must be published or draft";

    if (Object.keys(errors).length > 0) {
      if (req.file) deleteFile(`/uploads/products/${req.file.filename}`);
      return res.status(400).json({ success: false, error: "Validation failed", fields: errors });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (category !== undefined) updateData.category = category.trim();
    if (status !== undefined) updateData.status = status;

    if (req.file) {
      if (existing.image) deleteFile(existing.image);
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/products/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    if (product.image) deleteFile(product.image);
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: "Product deleted" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "Product IDs array is required" });
    }
    const products = await Product.find({ _id: { $in: ids } });
    products.forEach((p) => { if (p.image) deleteFile(p.image); });
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, data: { deleted: ids.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.bulkPublish = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "Product IDs array is required" });
    }
    await Product.updateMany({ _id: { $in: ids } }, { status: "published" });
    res.json({ success: true, data: { updated: ids.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.bulkUnpublish = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "Product IDs array is required" });
    }
    await Product.updateMany({ _id: { $in: ids } }, { status: "draft" });
    res.json({ success: true, data: { updated: ids.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, error: "Product not found" });

    const duplicate = await Product.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      price: original.price,
      stock: original.stock,
      image: original.image,
      category: original.category,
      status: "draft",
    });

    res.status(201).json({ success: true, data: duplicate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20, sort = "-createdAt" } = req.query;

    let filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const sortObj = {};
    if (sort.startsWith("-")) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort(sortObj)
        .lean(),
    ]);

    res.json({
      success: true,
      data: { products, total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
