const mongoose = require("mongoose");

const blockedPincodeSchema =
  new mongoose.Schema(
    {
      pincode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      district: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      reason: {
        type: String,
        default:
          "Delivery not available",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "BlockedPincode",
  blockedPincodeSchema
);