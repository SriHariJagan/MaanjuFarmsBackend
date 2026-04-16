const PDFDocument = require("pdfkit");

const generateInvoice = (data) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    /* ================= HEADER ================= */
    doc
      .fontSize(22)
      .fillColor("#2e7d32")
      .text("Manjoo Farming", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(16)
      .fillColor("#000")
      .text("INVOICE", { align: "center", underline: true });

    doc.moveDown();

    /* ================= CUSTOMER ================= */
    doc.fontSize(12).text(`Customer: ${data.name}`);
    doc.text(`Email: ${data.email}`);
    doc.text(`Invoice ID: ${data.invoiceId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    /* ================= TABLE ================= */
    doc.fontSize(13).text("Items", { underline: true });
    doc.moveDown(0.5);

    data.items.forEach((item, i) => {
      doc.text(
        `${i + 1}. ${item.name}  |  Qty: ${item.quantity}  |  ₹${item.price}`
      );
    });

    doc.moveDown();

    /* ================= TOTAL ================= */
    doc
      .fontSize(14)
      .fillColor("#2e7d32")
      .text(`Total Amount: ₹${data.totalAmount}`, { align: "right" });

    doc.moveDown(2);

    doc
      .fontSize(11)
      .fillColor("#555")
      .text("Thank you for choosing Manjoo Farming 🌿", {
        align: "center",
      });

    doc.end();
  });
};

module.exports = generateInvoice;