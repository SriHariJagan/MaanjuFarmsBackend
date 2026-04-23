const contactMailTemplate = (data) => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    
    <h2 style="color:#2E7D32;">📩 New Contact Inquiry</h2>

    <p>You have received a new message from your website:</p>

    <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">Name:</td>
        <td style="padding: 8px;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Email:</td>
        <td style="padding: 8px;">${data.email}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Phone:</td>
        <td style="padding: 8px;">${data.phone}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Subject:</td>
        <td style="padding: 8px;">${data.subject}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Message:</td>
        <td style="padding: 8px;">${data.message}</td>
      </tr>
    </table>

    <p style="margin-top:20px;">Regards,<br/>Maanjoo Farms Website</p>
  </div>
  `;
};

module.exports = contactMailTemplate;