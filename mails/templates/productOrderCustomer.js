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

      <h2>Thank you for your order 🌿</h2>

      <p>Hello ${data.user.name},</p>

      <p>Your order has been confirmed successfully.</p>

      <h3>Order Details</h3>

      <p>
        <strong>Order ID:</strong>
        ${data.orderId}
      </p>

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

      <p>
        We will notify you once the order is shipped.
      </p>

    </div>
  `;
};