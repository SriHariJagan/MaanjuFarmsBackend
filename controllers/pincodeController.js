const axios = require("axios");
const https = require("https");
const BlockedPincode = require("../models/BlockedPincode");



/* =====================================================
   CHECK PINCODE
===================================================== */

exports.checkPincode = async (req, res) => {
  try {
    const { pin } = req.params;

    /* ================= VALIDATE ================= */

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format",
      });
    }

    /* ================= CHECK BLOCKED ================= */

    const blocked = await BlockedPincode.findOne({
      pincode: pin,
    });

    if (blocked) {
      return res.status(200).json({
        success: false,
        blocked: true,
        message: blocked.reason,

        data: blocked,
      });
    }

    /* ================= INDIA POST API ================= */

    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pin}`,
      {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    );

    const apiData = response.data?.[0];

    if (
      !apiData ||
      apiData.Status !== "Success" ||
      !apiData.PostOffice ||
      apiData.PostOffice.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Invalid pincode",
      });
    }

    const post =
      apiData.PostOffice.find(
        (p) => p.DeliveryStatus === "Delivery"
      ) || apiData.PostOffice[0];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      blocked: false,

      data: {
        pincode: pin,
        district: post.District || "",
        state: post.State || "",
        city: post.Block || "",
        country: post.Country || "",
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Unable to verify pincode",
    });
  }
};



/* =====================================================
   ADD BLOCKED PINCODE
===================================================== */

exports.addBlockedPincode = async (
  req,
  res
) => {
  try {
    const {
      pincode,
      district,
      state,
      reason,
    } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
      });
    }

    const existing =
      await BlockedPincode.findOne({
        pincode,
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Pincode already blocked",
      });
    }

    const blocked =
      await BlockedPincode.create({
        pincode,
        district,
        state,
        reason,
      });

    return res.status(201).json({
      success: true,
      message:
        "Pincode blocked successfully",

      data: blocked,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message:
        "Unable to block pincode",
    });
  }
};



/* =====================================================
   GET BLOCKED PINCODES
===================================================== */

exports.getBlockedPincodes = async (
  req,
  res
) => {
  try {
    const pincodes =
      await BlockedPincode.find().sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: pincodes,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch blocked pincodes",
    });
  }
};



/* =====================================================
   DELETE BLOCKED PINCODE
===================================================== */

exports.deleteBlockedPincode = async (
  req,
  res
) => {
  try {
    const deleted =
      await BlockedPincode.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Pincode removed successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete pincode",
    });
  }
};