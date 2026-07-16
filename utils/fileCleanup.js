const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.join(__dirname, "..", filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

module.exports = { deleteFile };
