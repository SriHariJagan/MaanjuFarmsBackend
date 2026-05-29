
module.exports = (data) => {

  console.log(
    "Generating admin order email with data:",
    data.products.product
  );

  const productRows = data.products
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;">
            ${item.product.name}
          </td>

          <td style="
            padding:12px;
            text-align:center;
          ">
            ${item.quantity}
          </td>

          <td style="
            padding:12px;
            text-align:right;
          ">
            ₹${item.product.price}
          </td>

          <td style="
            padding:12px;
            text-align:right;
            font-weight:bold;
          ">
            ₹${item.product.price * item.quantity}
          </td>

        </tr>
      `
    )
    .join("");

  return `

    <div style="
      font-family:Arial,sans-serif;
      background:#f4f7fb;
      padding-block: 30px;
    ">

      <div style="
        max-width:850px;
        margin:auto;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 12px rgba(0,0,0,0.08);
      ">

        <!-- HEADER -->

        <div style="
          background:linear-gradient(
            135deg,
            #1d4ed8,
            #1e40af
          );
          color:white;
          padding:30px;
          text-align:center;
        ">

          <h1 style="margin:0;">
            🛒 New Order Received
          </h1>

          <p style="
            margin-top:10px;
            opacity:0.9;
          ">
            A new customer order has been placed
          </p>

        </div>

        <div style="padding:30px;">

          <!-- ORDER INFO -->

          <div style="
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
            margin-bottom:25px;
          ">

            <h2 style="
              margin-top:0;
              color:#1d4ed8;
            ">
              Order Information
            </h2>

            <p>
              <strong>Order ID:</strong>
              ${data.orderId}
            </p>

            <p>
              <strong>Total Amount:</strong>
              ₹${data.totalAmount}
            </p>

            <p>
              <strong>Payment Status:</strong>
              Paid
            </p>

          </div>

          <!-- CUSTOMER -->

          <div style="
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
            margin-bottom:25px;
          ">

            <h2 style="
              margin-top:0;
              color:#1d4ed8;
            ">
              Customer Details
            </h2>

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
              ${data.address.phone}
            </p>

          </div>

          <!-- SHIPPING -->

          <div style="
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
            margin-bottom:25px;
          ">

            <h2 style="
              margin-top:0;
              color:#1d4ed8;
            ">
              Shipping Address
            </h2>

            <p style="
              line-height:1.8;
              color:#444;
            ">

              ${data.address.name}<br/>

              ${data.address.phone}<br/>

              ${data.address.email}<br/>

              ${data.address.street}<br/>

              ${data.address.apartment || ""}<br/>

              ${data.address.city},
              ${data.address.district}<br/>

              ${data.address.state} -
              ${data.address.pincode}

            </p>

          </div>

          <!-- PRODUCTS -->

          <div style="
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
          ">

            <h2 style="
              margin-top:0;
              color:#1d4ed8;
            ">
              Ordered Products
            </h2>

            <table style="
              width:100%;
              border-collapse:collapse;
              font-size:14px;
            ">

              <thead>

                <tr style="
                  background:#f3f4f6;
                ">

                  <th style="padding:12px;">
                    Image
                  </th>

                  <th style="padding:12px;">
                    Product
                  </th>

                  <th style="padding:12px;">
                    Qty
                  </th>

                  <th style="padding:12px;">
                    Price
                  </th>

                  <th style="padding:12px;">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>
                ${productRows}
              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  `;
};

