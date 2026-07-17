
module.exports = (data) => {

  // console.log(
  //   "Generating customer order email with data:",
  //   data
  // );

  const productRows = data.products
    .map(
      (item) => `
        <tr>

          <td style="padding:12px;">
            <img
              src="${item.product.image}"
              alt="${item.product.name}"
              width="60"
              height="60"
              style="
                border-radius:8px;
                object-fit:cover;
              "
            />
          </td>

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
            ₹${item.product.price}${item.product.unit ? `/${item.product.unit}` : ""}
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
            #0f766e,
            #115e59
          );
          color:white;
          padding:30px;
          text-align:center;
        ">

          <h1 style="margin:0;">
            🌿 Order Confirmed
          </h1>

          <p style="
            margin-top:10px;
            opacity:0.9;
          ">
            Thank you for your purchase
          </p>

        </div>

        <div style="padding:30px;">

          <p style="font-size:16px;">
            Hello
            <strong>
              ${data.user.name}
            </strong>,
          </p>

          <p style="
            color:#444;
            line-height:1.7;
          ">

            Your order has been successfully placed and payment has been confirmed.

            We are preparing your items for shipment.

          </p>

          <!-- ORDER INFO -->

          <div style="
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
            margin:25px 0;
          ">

            <h2 style="
              margin-top:0;
              color:#0f766e;
            ">
              Order Summary
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
              color:#0f766e;
            ">
              Shipping Address
            </h2>

            <p style="
              line-height:1.8;
              color:#444;
            ">

              ${data.address.name}<br/>

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
              color:#0f766e;
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

          <!-- FOOTER -->

          <div style="
            margin-top:30px;
            padding-top:20px;
            border-top:1px solid #e5e7eb;
            text-align:center;
          ">

            <p style="
              color:#666;
              line-height:1.7;
            ">

              We will notify you once your order is shipped.

            </p>

            <p style="
              font-weight:bold;
              color:#0f766e;
            ">

              🌿 Thank you for shopping with us

            </p>

          </div>

        </div>

      </div>

    </div>

  `;
};

