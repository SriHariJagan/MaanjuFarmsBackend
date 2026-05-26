module.exports = (data) => {

  const productRows = data.products
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family: Arial; padding: 20px;">

      <h2>🛒 New Order Received</h2>

      <h3>Customer Details</h3>

      <p><strong>Name:</strong> ${data.user.name}</p>

      <p><strong>Email:</strong> ${data.user.email}</p>

      <p><strong>Phone:</strong> ${data.address.phone}</p>

      <h3>Delivery Address</h3>

      <p>
        ${data.address.street},
        ${data.address.city},
        ${data.address.state},
        ${data.address.pincode}
      </p>

      <h3>Products</h3>

      <table
        border="1"
        cellpadding="10"
        cellspacing="0"
        width="100%"
      >
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>

        ${productRows}
      </table>

      <h3>Total: ₹${data.totalAmount}</h3>

    </div>
  `;
};