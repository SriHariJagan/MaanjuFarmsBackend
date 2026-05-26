module.exports = (data) => {
  return `
    <div style="font-family: Arial; padding: 20px;">

      <h2>
        🌿 Villa Booking Confirmed
      </h2>

      <p>
        Hello ${data.user.name},
      </p>

      <p>
        Your booking has been confirmed successfully.
      </p>

      <hr />

      <h3>Booking Details</h3>

      <p>
        <strong>Booking ID:</strong>
        ${data.bookingId}
      </p>

      <p>
        <strong>Villa:</strong>
        ${data.villaName}
      </p>

      <p>
        <strong>Check In:</strong>
        ${data.checkIn}
      </p>

      <p>
        <strong>Check Out:</strong>
        ${data.checkOut}
      </p>

      <p>
        <strong>Guests:</strong>
        ${data.guests}
      </p>

      <p>
        <strong>Total Amount:</strong>
        ₹${data.totalAmount}
      </p>

      <hr />

      <h3>Guest Details</h3>

      <p>
        ${data.user.name}
      </p>

      <p>
        ${data.user.email}
      </p>

      <p>
        ${data.user.phone}
      </p>

      <br />

      <p>
        Thank you for booking with us 🌿
      </p>

    </div>
  `;
};