
module.exports = (data) => {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
    <div style="
      font-family: Arial, sans-serif;
      background: #f4f7fb;
      padding-block: 30px;
    ">

      <div style="
        max-width: 700px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      ">

        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #0f766e, #115e59);
          color: white;
          padding: 30px;
          text-align: center;
        ">
          <h1 style="margin:0;">
            🌿 Booking Confirmed
          </h1>

          <p style="
            margin-top: 10px;
            font-size: 15px;
            opacity: 0.9;
          ">
            Your villa reservation has been successfully confirmed
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">

          <p style="font-size: 16px;">
            Hello <strong>${data.user.name}</strong>,
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #444;
          ">
            Thank you for choosing us for your stay.
            Your villa booking has been successfully confirmed and payment has been verified.
          </p>

          <!-- Villa Image -->
          <div style="margin: 25px 0;">
            <img
              src="${data.room.image}"
              alt="${data.room.name}"
              style="
                width: 100%;
                height: 320px;
                object-fit: cover;
                border-radius: 10px;
              "
            />
          </div>

          <!-- Booking Details -->
          <div style="
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
          ">

            <h2 style="
              margin-top: 0;
              color: #0f766e;
            ">
              Booking Details
            </h2>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 15px;
            ">
              <tr>
                <td style="padding: 10px 0;"><strong>Booking ID</strong></td>
                <td>${data.bookingId}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Villa Name</strong></td>
                <td>${data.room.name}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Category</strong></td>
                <td>${data.room.category}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Check In</strong></td>
                <td>${formatDate(data.checkIn)}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Check Out</strong></td>
                <td>${formatDate(data.checkOut)}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Total Guests</strong></td>
                <td>${data.guestDetails?.length || 1}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Total Amount</strong></td>
                <td style="
                  color: #16a34a;
                  font-weight: bold;
                ">
                  ₹${data.totalAmount}
                </td>
              </tr>
            </table>
          </div>

          <!-- Guest Details -->
          <div style="
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
          ">

            <h2 style="
              margin-top: 0;
              color: #0f766e;
            ">
              Guest Details
            </h2>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            ">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align:left;">Name</th>
                  <th style="padding: 12px; text-align:left;">Age</th>
                  <th style="padding: 12px; text-align:left;">Gender</th>
                </tr>
              </thead>

              <tbody>
                ${data.guestDetails
                  ?.map(
                    (guest) => `
                    <tr>
                      <td style="padding: 12px; border-top:1px solid #eee;">
                        ${guest.name}
                      </td>

                      <td style="padding: 12px; border-top:1px solid #eee;">
                        ${guest.age}
                      </td>

                      <td style="padding: 12px; border-top:1px solid #eee;">
                        ${guest.gender}
                      </td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          ">

            <p style="
              font-size: 14px;
              color: #666;
              line-height: 1.7;
            ">
              We look forward to hosting you and making your stay memorable.
            </p>

            <p style="
              font-size: 14px;
              color: #666;
            ">
              Need help? Contact our support team anytime.
            </p>

            <p style="
              margin-top: 20px;
              font-weight: bold;
              color: #0f766e;
            ">
              🌿 Thank You For Booking With Us
            </p>
          </div>

        </div>
      </div>
    </div>
  `;
};
