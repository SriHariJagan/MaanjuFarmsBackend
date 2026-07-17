require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const products = require("./trimmedProducts.json");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Clear existing products (optional)
    await Product.deleteMany({});

    // Insert products
    await Product.insertMany(products);
    console.log("Products added to DB");

    mongoose.disconnect();
  })
  .catch((err) => console.error(err));
