// mails/templates/villaBooking.js
const villaBookingTemplate = ({ name, villaName, date, location }) => {
  return `
  <div style="background:#f0fdf4;padding:30px;font-family: 'Segoe UI', Arial, sans-serif;">
    
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#43a047;padding:20px;text-align:center;color:white;">
        <h1 style="margin:0;font-size:24px;">🌿 Manjoo Farming</h1>
        <p style="margin:5px 0 0;font-size:14px;">Luxury Nature Stay</p>
      </div>

      <!-- Hero Section -->
      <div style="padding:25px;">
        <h2 style="color:#1e4620;margin-bottom:10px;">
          Your Villa is Booked 🎉
        </h2>
        <p style="color:#3d6b49;font-size:15px;">
          Hi <b>${name}</b>, your peaceful getaway is confirmed!
        </p>

        <!-- Card -->
        <div style="margin-top:20px;padding:20px;border:1px solid #ddd;border-radius:10px;background:#fafafa;">
          <p><b>🏡 Villa:</b> ${villaName}</p>
          <p><b>📍 Location:</b> ${location}</p>
          <p><b>📅 Date:</b> ${date}</p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-top:25px;">
          <a href="#" 
            style="background:#43a047;color:white;padding:12px 25px;
            border-radius:6px;text-decoration:none;font-weight:bold;">
            View Booking
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #eee;">
        Need help? Contact us anytime 🌱<br/>
        © ${new Date().getFullYear()} Manjoo Farming
      </div>

    </div>
  </div>
  `;
};

module.exports = villaBookingTemplate;