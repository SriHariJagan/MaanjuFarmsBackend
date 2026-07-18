require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const products = require("./trimmedProducts.json");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    await Product.deleteMany({});

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products added to DB`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
