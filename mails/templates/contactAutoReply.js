const contactAutoReplyTemplate = (data) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="color:#2E7D32;">🌿 Thank You for Contacting Us</h2>

      <p>Hi ${data.name},</p>

      <p>
        We’ve received your message and our team will get back to you shortly.
      </p>

      <p><strong>Your Message:</strong></p>
      <p>${data.message}</p>

      <br/>
      <p>Regards,<br/>Maanjoo Farms Team</p>
    </div>
  `;
};

module.exports = contactAutoReplyTemplate;