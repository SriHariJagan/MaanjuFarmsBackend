// mails/templates/productOrder.js
const productOrderTemplate = ({ name, orderId, products, totalAmount }) => {
  
  // Generate product rows dynamically
  const productRows = products.map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;">
        ${item.name}
      </td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">
        ₹ ${item.price}
      </td>
    </tr>
  `).join("");

  return `
  <div style="background:#f0fdf4;padding:30px;font-family:Segoe UI, Arial;">
    
    <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;
      box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">

      <!-- Header -->
      <div style="background:#43a047;padding:20px;text-align:center;color:white;">
        <h1 style="margin:0;">🌿 Manjoo Farming</h1>
        <p style="margin:5px 0 0;">Fresh & Organic Products</p>
      </div>

      <!-- Body -->
      <div style="padding:25px;">
        <h2 style="color:#1e4620;">Order Confirmed ✅</h2>
        <p style="color:#3d6b49;">
          Hi <b>${name}</b>, your order has been successfully placed.
        </p>

        <p style="font-size:13px;color:#666;">
          Order ID: <b>${orderId}</b>
        </p>

        <!-- Table -->
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="padding:10px;text-align:left;">Product</th>
              <th style="padding:10px;text-align:center;">Qty</th>
              <th style="padding:10px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <!-- Total -->
        <div style="margin-top:20px;text-align:right;">
          <p style="font-size:18px;font-weight:bold;color:#b8860b;">
            Total: ₹ ${totalAmount}
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-top:25px;">
          <a href="#" 
            style="background:#2e7d32;color:white;padding:12px 25px;
            border-radius:6px;text-decoration:none;font-weight:bold;">
            Track Order
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #eee;">
        Thank you for choosing organic 🌱<br/>
        © ${new Date().getFullYear()} Manjoo Farming
      </div>

    </div>
  </div>
  `;
};

module.exports = productOrderTemplate;