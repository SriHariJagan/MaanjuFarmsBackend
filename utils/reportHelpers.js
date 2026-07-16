const PDFDocument = require("pdfkit");

const escapeCsvField = (value) => {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const generateCsv = (columns, rows) => {
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvField(c.accessor(row))).join(",")
    )
    .join("\n");
  return `${header}\n${body}\n`;
};

const generatePdf = (title, columns, rows, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4", layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);

  doc.pipe(res);

  doc.fontSize(18).text(title, { align: "center" });
  doc.moveDown();
  doc
    .fontSize(9)
    .text(`Generated: ${new Date().toLocaleString()}`, { align: "right" });
  doc.moveDown();

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / columns.length;
  const rowHeight = 18;

  const drawHeader = () => {
    doc.fontSize(9).font("Helvetica-Bold");
    let x = doc.page.margins.left;
    columns.forEach((c) => {
      doc.rect(x, doc.y, colWidth, rowHeight).fill("#2e7d32");
      doc.fillColor("#fff").text(c.label, x + 3, doc.y + 4, {
        width: colWidth - 6,
        align: "left",
      });
      doc.fillColor("#000");
      x += colWidth;
    });
    doc.moveDown(1.2);
  };

  const drawRow = (row, i) => {
    doc.font("Helvetica").fontSize(8);
    const y = doc.y;
    let x = doc.page.margins.left;

    if (i % 2 === 0) {
      doc
        .rect(x, y, pageWidth, rowHeight)
        .fillColor("#f5f5f5")
        .fill();
      doc.fillColor("#000");
    }

    x = doc.page.margins.left;
    columns.forEach((c) => {
      doc.text(String(c.accessor(row) ?? ""), x + 3, y + 4, {
        width: colWidth - 6,
        align: "left",
      });
      x += colWidth;
    });
    doc.moveDown(1);
  };

  drawHeader();

  rows.forEach((row, i) => {
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      drawHeader();
    }
    drawRow(row, i);
  });

  doc.moveDown();
  doc
    .fontSize(9)
    .fillColor("#555")
    .text(`Total Records: ${rows.length}`, { align: "center" });

  doc.end();
};

module.exports = { generateCsv, generatePdf };
