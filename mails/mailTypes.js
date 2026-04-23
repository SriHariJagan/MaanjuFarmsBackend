const sendMail = require("./sendMail");

const villaBookingTemplate = require("./templates/villaBooking");
const productOrderTemplate = require("./templates/productOrder");
const contactMailTemplate = require("./templates/contactMail");
const contactAutoReplyTemplate = require("./templates/contactAutoReply");

const sendMailByType = async (type, data) => {
  let html = "";
  let subject = "";

  switch (type) {
    case "VILLA_BOOKING":
      subject = "Villa Booking Confirmation";
      html = villaBookingTemplate(data);

      await sendMail({
        to: data.email,
        subject,
        html,
      });
      return;

    case "PRODUCT_ORDER":
      subject = "Order Confirmation";
      html = productOrderTemplate(data);

      await sendMail({
        to: data.email,
        subject,
        html,
      });
      return;

    case "CONTACT":
      // ✅ Send to Admin
      await sendMail({
        to: ["sriharijagan04@gmail.com"],
        subject: "New Contact Inquiry",
        html: contactMailTemplate(data),
      });

      // ✅ Send Auto Reply to User
      await sendMail({
        to: data.email,
        subject: "We received your message 🌿",
        html: contactAutoReplyTemplate(data),
      });

      return;

    default:
      throw new Error("Invalid mail type");
  }
};

module.exports = sendMailByType;