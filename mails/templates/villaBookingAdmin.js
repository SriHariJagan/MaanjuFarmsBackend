module.exports = (data) => {
  return `
    <div style="font-family: Arial; padding: 20px;">

      <h2>
        🏡 New Villa Booking
      </h2>

      <hr />

      <h3>Customer Details</h3>

      <p>
        <strong>Name:</strong>
        ${data.user.name}
      </p>

      <p>
        <strong>Email:</strong>
        ${data.user.email}
      </p>

      <p>
        <strong>Phone:</strong>
        ${data.user.phone}
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

    </div>
  `;
};