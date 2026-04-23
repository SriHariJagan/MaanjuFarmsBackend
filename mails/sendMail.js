const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: `"Maanjoo Farms" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
  } catch (err) {
    console.error("Mail error:", err);
    throw err;
  }
};

module.exports = sendMail;