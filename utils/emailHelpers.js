// utils/emailHelpers.js
// Reusable email helper functions

const sendMail = require("../mails/sendMail");
const orderStatusEmail = require("../mails/templates/orderStatusEmail");

const ORDER_STATUS_EMAILS = {
  pending: {
    subject: (id) => `Order Placed #${id}`,
    message: "Your order has been placed successfully and is awaiting confirmation.",
    ctaText: "View Order",
    ctaUrl: null,
  },
  confirmed: {
    subject: (id) => `Order Confirmed #${id}`,
    message:
      "Your order has been confirmed and we are preparing it for processing.",
    ctaText: "View Order",
    ctaUrl: null,
  },
  processing: {
    subject: (id) => `Order Processing #${id}`,
    message: "Your order is now being processed. We'll update you soon!",
    ctaText: "Track Order",
    ctaUrl: null,
  },
  packed: {
    subject: (id) => `Order Packed #${id}`,
    message: "Your order has been packed and is ready for shipping.",
    ctaText: "View Order",
    ctaUrl: null,
  },
  shipped: {
    subject: (id) => `Order Shipped #${id} 🚚`,
    message: null,
    ctaText: "Track Package",
    ctaUrl: null,
  },
  out_for_delivery: {
    subject: (id) => `Out for Delivery #${id} 📬`,
    message: "Your order is out for delivery and will arrive soon!",
    ctaText: "Track Package",
    ctaUrl: null,
  },
  delivered: {
    subject: (id) => `Order Delivered #${id} 🎉`,
    message:
      "Your order has been delivered successfully. We hope you love your products!",
    ctaText: "Write a Review",
    ctaUrl: null,
  },
  cancelled: {
    subject: (id) => `Order Cancelled #${id}`,
    message:
      "Your order has been cancelled as requested. If you did not request this, please contact support.",
    ctaText: "Shop Again",
    ctaUrl: null,
  },
};

async function sendOrderStatusEmail({ order, user, status, delivery }) {
  const emailConfig = ORDER_STATUS_EMAILS[status];
  if (!emailConfig) return;

  const frontendBase =
    process.env.CLIENT_URL || "http://localhost:5173";

  const ctaUrl = emailConfig.ctaUrl
    ? emailConfig.ctaUrl
    : status === "shipped" || status === "out_for_delivery"
    ? delivery?.trackingUrl || `${frontendBase}/my-orders`
    : `${frontendBase}/my-orders`;

  const html = orderStatusEmail({
    user,
    orderId: order._id,
    products: order.products,
    totalAmount: order.totalAmount,
    status,
    delivery,
    address: order.deliveryAddress,
    message: emailConfig.message,
    ctaText: emailConfig.ctaText,
    ctaUrl,
  });

  const recipients = [user.email];
  if (order.deliveryAddress?.email && order.deliveryAddress.email !== user.email) {
    recipients.push(order.deliveryAddress.email);
  }

  try {
    await sendMail({
      to: recipients,
      subject: `${emailConfig.subject(order._id.toString().slice(-8))}`,
      html,
    });

    await order.updateOne({
      $push: {
        emailHistory: {
          type: `status_${status}`,
          sentAt: new Date(),
          status: "sent",
        },
      },
    });

    return true;
  } catch (err) {
    console.error(`Failed to send ${status} email:`, err.message);

    await order.updateOne({
      $push: {
        emailHistory: {
          type: `status_${status}`,
          sentAt: new Date(),
          status: "failed",
        },
      },
    });

    return false;
  }
}

async function sendAdminNewOrderNotification(order, user) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return false;

    const productRows = order.products
      .map(
        (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${
          item.product?.name || item.nameAtOrder || "Product"
        }</td>
        <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${
          item.quantity
        }</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">₹${
          (item.product?.price || item.priceAtOrder || 0) * item.quantity
        }</td>
      </tr>`
      )
      .join("");

    const html = `
    <div style="font-family:Arial;background:#f4f7fb;padding:20px;">
      <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);padding:24px;text-align:center;color:white;">
          <h1 style="margin:0;">🛒 New Order Received</h1>
          <p style="margin:8px 0 0;opacity:0.9;">Order #${order._id.toString().slice(-8)}</p>
        </div>
        <div style="padding:24px;">
          <p><strong>Customer:</strong> ${user?.name || "N/A"} (${user?.email || "N/A"})</p>
          <p><strong>Total:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment:</strong> ${order.paymentStatus}</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <thead><tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;">Product</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
            <tbody>${productRows}</tbody>
          </table>
          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard/orders" style="display:inline-block;padding:10px 24px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px;">View in Dashboard</a>
          </div>
        </div>
      </div>
    </div>`;

    await sendMail({
      to: adminEmail,
      subject: `🛒 New Order #${order._id.toString().slice(-8)} — ₹${order.totalAmount}`,
      html,
    });

    return true;
  } catch (err) {
    console.error("Admin notification failed:", err.message);
    return false;
  }
}

module.exports = {
  sendOrderStatusEmail,
  sendAdminNewOrderNotification,
  ORDER_STATUS_EMAILS,
};
