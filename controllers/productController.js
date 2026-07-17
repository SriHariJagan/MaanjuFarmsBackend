const Product = require("../models/Product");

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image, category, unit } = req.body;

    if (!name || !price || !stock || !category) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    let imagePath = image;

    // ✅ If file uploaded
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      image: imagePath,
      category,
      unit,
    });

    await product.save();

    res.status(201).json({ msg: "Product added", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// Update product
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // ✅ If new image uploaded
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minStock,
      maxStock,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (minStock || maxStock) {
      filter.stock = {};
      if (minStock) filter.stock.$gte = Number(minStock);
      if (maxStock) filter.stock.$lte = Number(maxStock);
    }

    const hasPagination = page && limit;

    if (hasPagination) {
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const sortField = sortBy || "createdAt";
      const sortDir = sortOrder === "asc" ? 1 : -1;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort({ [sortField]: sortDir })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Product.countDocuments(filter),
      ]);

      return res.json({
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        products,
      });
    }

    const sortField = sortBy || "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;
    const products = await Product.find(filter).sort({ [sortField]: sortDir });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
