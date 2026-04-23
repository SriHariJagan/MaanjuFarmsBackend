const sendMailByType = require("../mails/mailTypes");

const sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await sendMailByType("CONTACT", {
      name,
      email,
      phone,
      subject,
      message,
      email
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { sendContactMail };