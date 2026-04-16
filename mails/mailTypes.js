// mails/mailTypes.js
const sendMail = require("./sendMail");

const villaBookingTemplate = require("./templates/villaBooking");
const productOrderTemplate = require("./templates/productOrder");
// const passwordResetTemplate = require("./templates/passwordReset");

const sendMailByType = async (type, data) => {
  let html = "";
  let subject = "";

  switch (type) {
    case "VILLA_BOOKING":
      subject = "Villa Booking Confirmation";
      html = villaBookingTemplate(data);
      break;

    case "PRODUCT_ORDER":
      subject = "Order Confirmation";
      html = productOrderTemplate(data);
      break;

    // case "PASSWORD_RESET":
    //   subject = "Reset Your Password";
    //   html = passwordResetTemplate(data);
    //   break;

    default:
      throw new Error("Invalid mail type");
  }

  await sendMail({
    to: data.email,
    subject,
    html,
  });
};

module.exports = sendMailByType;