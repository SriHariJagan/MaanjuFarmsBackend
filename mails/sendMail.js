// mails/sendMail.js
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
      from: `"Manjoo Farming" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments, // ✅ FIXED
    });
  } catch (err) {
    console.error("Mail error:", err);
    throw err;
  }
};

module.exports = sendMail;