const Product = require("../models/Product");

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body;

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
    const products = await Product.find();
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
