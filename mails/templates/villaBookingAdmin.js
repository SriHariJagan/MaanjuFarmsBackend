
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
          background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
          color: white;
          padding: 30px;
          text-align: center;
        ">
          <h1 style="margin:0;">
            🏡 New Villa Booking
          </h1>

          <p style="
            margin-top: 10px;
            font-size: 15px;
            opacity: 0.9;
          ">
            A new booking has been successfully placed
          </p>
        </div>

        <div style="padding: 30px;">

          <!-- Customer Details -->
          <div style="
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
          ">

            <h2 style="
              margin-top: 0;
              color: #1d4ed8;
            ">
              Customer Details
            </h2>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 15px;
            ">
              <tr>
                <td style="padding: 10px 0;"><strong>Name</strong></td>
                <td>${data.user.name}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Email</strong></td>
                <td>${data.user.email}</td>
              </tr>

              <tr>
                <td style="padding: 10px 0;"><strong>Phone</strong></td>
                <td>${data.user.phone || "N/A"}</td>
              </tr>
            </table>
          </div>

          <!-- Booking Details -->
          <div style="
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
          ">

            <h2 style="
              margin-top: 0;
              color: #1d4ed8;
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
              color: #1d4ed8;
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
            ">
              This is an automated booking notification from the Villa Booking System.
            </p>
          </div>

        </div>
      </div>
    </div>
  `;
};

