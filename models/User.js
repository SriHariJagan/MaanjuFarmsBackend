const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Cart: array of products with quantity
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 }
      }
    ],

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
