// mails/templates/orderStatusEmail.js
// Professional responsive order status email for all order events

module.exports = ({
  user,
  orderId,
  products,
  totalAmount,
  status,
  delivery,
  address,
  message,
  ctaText,
  ctaUrl,
}) => {
  const productRows = (products || [])
    .map(
      (item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e8f5e9;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="60" style="padding-right:12px;">
              <img src="${item.product?.image || item.imageAtOrder || ""}" alt="${item.product?.name || item.nameAtOrder || ""}" width="50" height="50" style="border-radius:6px;object-fit:cover;display:block;" />
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:14px;color:#1e4620;font-weight:600;">${item.product?.name || item.nameAtOrder || "Product"}</p>
              <p style="margin:3px 0 0;font-size:12px;color:#666;">Qty: ${item.quantity}</p>
            </td>
            <td width="80" style="text-align:right;vertical-align:middle;">
              <p style="margin:0;font-size:14px;color:#1e4620;font-weight:600;">₹${(item.product?.price || item.priceAtOrder || 0) * item.quantity}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    )
    .join("");

  const statusColors = {
    pending: "#d97706",
    confirmed: "#2e7d32",
    processing: "#2563eb",
    packed: "#7c3aed",
    shipped: "#2563eb",
    out_for_delivery: "#0891b2",
    delivered: "#40513B",
    cancelled: "#ef4444",
    returned: "#ea580c",
    refunded: "#6b7280",
  };

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    refunded: "Refunded",
  };

  const color = statusColors[status] || "#2e7d32";
  const label = statusLabels[status] || status;

  const statusIcon = {
    pending: "⏳",
    confirmed: "✅",
    processing: "🔄",
    packed: "📦",
    shipped: "🚚",
    out_for_delivery: "📬",
    delivered: "🎉",
    cancelled: "❌",
    returned: "↩️",
    refunded: "💰",
  };

  const icon = statusIcon[status] || "📋";

  const greeting =
    status === "delivered"
      ? "Your order has been delivered!"
      : status === "cancelled"
      ? "Your order has been cancelled"
      : status === "shipped"
      ? "Your order is on the way!"
      : status === "out_for_delivery"
      ? "Your order is out for delivery!"
      : status === "confirmed"
      ? "Your order has been confirmed"
      : `Order ${label}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f7f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f7f0;padding:20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#2e7d32,#1b5e20);padding:30px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#ffffff;">🌿 Manjoo Farming</h1>
              <p style="margin:8px 0 0;color:#a5d6a7;font-size:14px;">Fresh & Organic From Our Farm to Your Home</p>
            </td>
          </tr>

          <!-- STATUS BAR -->
          <tr>
            <td style="padding:20px 30px;background:${color}08;border-bottom:2px solid ${color}20;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:28px;">${icon}</span>
                  </td>
                  <td width="100%" style="padding-left:12px;vertical-align:middle;">
                    <h2 style="margin:0;font-size:18px;color:${color};">${greeting}</h2>
                    <p style="margin:4px 0 0;font-size:13px;color:#666;">
                      Order #${orderId?.toString().slice(-8) || orderId}
                    </p>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;background:${color}15;color:${color};">${label}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;">

              <!-- MESSAGE -->
              <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 20px;">
                Hello <strong style="color:#1e4620;">${user?.name || "Valued Customer"}</strong>,
              </p>

              ${
                message
                  ? `<p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;padding:14px;background:#f9fafb;border-radius:8px;border-left:3px solid ${color};">${message}</p>`
                  : ""
              }

              <!-- DELIVERY INFO -->
              ${
                delivery && (delivery.trackingNumber || delivery.partner)
                  ? `
              <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #e5e7eb;">
                <h3 style="margin:0 0 12px;font-size:14px;color:#1e4620;">🚚 Delivery Information</h3>
                <table cellpadding="4" cellspacing="0" border="0" width="100%" style="font-size:13px;color:#444;">
                  ${
                    delivery.partner
                      ? `<tr><td width="100">Partner:</td><td><strong>${delivery.partner}</strong></td></tr>`
                      : ""
                  }
                  ${
                    delivery.trackingNumber
                      ? `<tr><td>Tracking:</td><td><strong>${delivery.trackingNumber}</strong></td></tr>`
                      : ""
                  }
                  ${
                    delivery.estimatedDelivery
                      ? `<tr><td>Est. Delivery:</td><td><strong>${new Date(
                          delivery.estimatedDelivery
                        ).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</strong></td></tr>`
                      : ""
                  }
                </table>
                ${
                  delivery.trackingUrl
                    ? `<p style="margin:12px 0 0;text-align:center;"><a href="${delivery.trackingUrl}" style="display:inline-block;padding:10px 24px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Track Package</a></p>`
                    : ""
                }
              </div>`
                  : ""
              }

              <!-- SHIPPING ADDRESS -->
              ${
                address
                  ? `
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
                <h3 style="margin:0 0 8px;font-size:14px;color:#1e4620;">📍 Shipping Address</h3>
                <p style="margin:0;font-size:13px;color:#555;line-height:1.7;">
                  ${address.name}<br/>
                  ${address.street}${address.apartment ? ", " + address.apartment : ""}<br/>
                  ${address.city}, ${address.district || ""}<br/>
                  ${address.state} - ${address.pincode}
                </p>
              </div>`
                  : ""
              }

              <!-- PRODUCTS TABLE -->
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
                <h3 style="margin:0 0 12px;font-size:14px;color:#1e4620;">📦 Order Summary</h3>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:13px;border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th style="padding:8px 10px;text-align:left;border-bottom:2px solid #e8f5e9;color:#555;font-size:12px;">Product</th>
                      <th style="padding:8px 10px;text-align:center;border-bottom:2px solid #e8f5e9;color:#555;font-size:12px;">Qty</th>
                      <th style="padding:8px 10px;text-align:right;border-bottom:2px solid #e8f5e9;color:#555;font-size:12px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productRows}
                  </tbody>
                </table>
                <div style="border-top:2px solid #e8f5e9;padding:12px 0 0;margin-top:8px;text-align:right;">
                  <p style="margin:0;font-size:16px;font-weight:700;color:#1e4620;">Total: ₹${totalAmount}</p>
                </div>
              </div>

              <!-- REVIEW REMINDER FOR DELIVERED -->
              ${
                status === "delivered"
                  ? `
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center;">
                <p style="margin:0 0 8px;font-size:14px;color:#166534;font-weight:600;">🎉 We'd Love Your Feedback!</p>
                <p style="margin:0 0 12px;font-size:13px;color:#444;line-height:1.6;">
                  Your opinion matters! Share your experience and help others discover the freshness of Manjoo Farming.
                </p>
                <a href="${ctaUrl || "#"}" style="display:inline-block;padding:10px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Write a Review</a>
              </div>`
                  : ""
              }

              <!-- TRACKING CTA FOR SHIPPED / OUT_FOR_DELIVERY -->
              ${
                (status === "shipped" || status === "out_for_delivery") && delivery?.trackingUrl
                  ? `
              <div style="text-align:center;margin-top:20px;">
                <a href="${delivery.trackingUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">📦 Track Your Package</a>
              </div>`
                  : ""
              }

              <!-- CTA -->
              ${
                ctaText && ctaUrl && status !== "shipped" && status !== "out_for_delivery"
                  ? `
              <div style="text-align:center;margin-top:20px;">
                <a href="${ctaUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#2e7d32,#1b5e20);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${ctaText}</a>
              </div>`
                  : ""
              }

              <!-- SUPPORT -->
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;font-size:12px;color:#888;line-height:1.7;">
                  Need help with your order? We're here for you!
                </p>
                <p style="margin:4px 0 0;font-size:12px;color:#888;">
                  📧 <a href="mailto:maanjoofarms@gmail.com" style="color:#2e7d32;text-decoration:none;">maanjoofarms@gmail.com</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1b5e20;padding:16px 30px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a5d6a7;">
                🌿 Manjoo Farming — Bringing Freshness to Your Doorstep<br/>
                &copy; ${new Date().getFullYear()} Manjoo Farming. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
