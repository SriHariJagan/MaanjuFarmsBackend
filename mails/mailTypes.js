const sendMail = require("./sendMail");

// ================= TEMPLATES =================

const villaBookingCustomerTemplate = require("./templates/villaBookingCustomer");

const villaBookingAdminTemplate = require("./templates/villaBookingAdmin");

const productOrderCustomerTemplate = require("./templates/productOrderCustomer");

const productOrderAdminTemplate = require("./templates/productOrderAdmin");

const contactMailTemplate = require("./templates/contactMail");

const contactAutoReplyTemplate = require("./templates/contactAutoReply");

// ======================================================
// SEND MAIL BY TYPE
// ======================================================

const sendMailByType = async (
  type,
  data
) => {
  switch (type) {

    // ==================================================
    // PRODUCT ORDER
    // ==================================================

    case "PRODUCT_ORDER":

      // CUSTOMER MAIL
      await sendMail({
        to: [data.user.email, data.address.email],

        subject:
          `Order Confirmation #${data.orderId}`,

        html:
          productOrderCustomerTemplate(
            data
          ),
      });

      // ADMIN MAIL
      await sendMail({
        to: process.env.ADMIN_EMAIL,

        subject:
          `🛒 New Order Received #${data.orderId}`,

        html:
          productOrderAdminTemplate(
            data
          ),
      });

      return;

    // ==================================================
    // VILLA BOOKING
    // ==================================================

    case "VILLA_BOOKING":

      // CUSTOMER MAIL
      await sendMail({
        to: [data.user.email, data.address.email],

        subject:
          `Villa Booking Confirmation #${data.bookingId}`,

        html:
          villaBookingCustomerTemplate(
            data
          ),
      });

      // ADMIN MAIL
      await sendMail({
        to: process.env.ADMIN_EMAIL,

        subject:
          `🏡 New Villa Booking #${data.bookingId}`,

        html:
          villaBookingAdminTemplate(
            data
          ),
      });

      return;

    // ==================================================
    // CONTACT
    // ==================================================

    case "CONTACT":

      // ADMIN MAIL
      await sendMail({
        to: process.env.ADMIN_EMAIL,

        subject:
          "New Contact Inquiry",

        html:
          contactMailTemplate(data),
      });

      // USER AUTO REPLY
      await sendMail({
        to: data.email,

        subject:
          "We received your message 🌿",

        html:
          contactAutoReplyTemplate(
            data
          ),
      });

      return;

    default:
      throw new Error(
        "Invalid mail type"
      );
  }
};

module.exports = sendMailByType;