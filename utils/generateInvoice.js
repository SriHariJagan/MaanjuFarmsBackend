const PDFDocument = require("pdfkit");

const generateInvoice = (data) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const pageWidth = doc.page.width - 100;

    /* ================= HEADER ================= */
    doc.fontSize(22).fillColor("#2e7d32").text("Manjoo Farming", { align: "center" });
    doc.fontSize(10).fillColor("#666").text("Fresh & Organic From Our Farm to Your Home", { align: "center" });

    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y).strokeColor("#e5e7eb").stroke();
    doc.moveDown(1);

    doc.fontSize(18).fillColor("#000").text("INVOICE", { align: "center" });
    doc.moveDown(1);

    /* ================= INVOICE INFO ================= */
    doc.fontSize(10).fillColor("#374151");
    const infoTop = doc.y;
    doc.text(`Invoice #: ${data.invoiceId}`, 50, infoTop, { align: "left" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, 50, infoTop, { align: "right" });

    doc.moveDown(2);

    /* ================= BILL TO ================= */
    doc.fontSize(11).fillColor("#2e7d32").text("Bill To:", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    doc.text(data.name || "Customer");
    doc.text(data.email || "");

    doc.moveDown(1.5);

    /* ================= TABLE HEADER ================= */
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 350;
    const col3 = 430;
    const col4 = 500;

    doc.rect(50, tableTop - 4, pageWidth, 20).fillColor("#f0fdf4").fill();
    doc.fillColor("#1e4620").fontSize(10).font("Helvetica-Bold");
    doc.text("Item", col1 + 5, tableTop);
    doc.text("Qty", col2, tableTop, { width: 60, align: "center" });
    doc.text("Price", col3, tableTop, { width: 60, align: "center" });
    doc.text("Total", col4, tableTop, { width: 60, align: "right" });

    doc.moveDown(1.5);

    /* ================= TABLE ROWS ================= */
    let yPos = doc.y;
    data.items.forEach((item, i) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      if (i % 2 === 0) {
        doc.rect(50, yPos - 4, pageWidth, 22).fillColor("#f9fafb").fill();
      }

      doc.fillColor("#374151").fontSize(9).font("Helvetica");
      doc.text(item.name, col1 + 5, yPos, { width: 290 });
      doc.text(String(item.quantity), col2, yPos, { width: 60, align: "center" });
      doc.text(`Rs.${item.price}`, col3, yPos, { width: 60, align: "center" });
      doc.text(`Rs.${item.price}`, col4, yPos, { width: 60, align: "right" });

      yPos += 22;
      doc.y = yPos;
    });

    doc.moveDown(1);

    /* ================= TOTAL ================= */
    const totalLine = doc.y;
    doc.moveTo(50, totalLine).lineTo(50 + pageWidth, totalLine).strokeColor("#e5e7eb").stroke();
    doc.moveDown(0.5);

    doc.fontSize(14).fillColor("#2e7d32").font("Helvetica-Bold");
    doc.text(`Total Amount: Rs.${data.totalAmount.toFixed(2)}`, { align: "right" });

    doc.moveDown(3);

    /* ================= FOOTER ================= */
    doc.fontSize(10).fillColor("#666").font("Helvetica");
    doc.text("Thank you for choosing Manjoo Farming!", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor("#9ca3af");
    doc.text("Maanjoo Farms | Fresh & Organic Produce", { align: "center" });

    doc.end();
  });
};

module.exports = generateInvoice;