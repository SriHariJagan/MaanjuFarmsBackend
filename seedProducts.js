const mongoose = require("mongoose");
const Product = require("./models/Product"); // path to your Product model
const products = require("./trimmedProducts.json"); // the JSON above

mongoose
  .connect("mongodb+srv://maanjoofarms_db_user:2WJAUwXsjWIhDQAQ@cluster0.k1vwfxb.mongodb.net/maanjufarms_db?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
