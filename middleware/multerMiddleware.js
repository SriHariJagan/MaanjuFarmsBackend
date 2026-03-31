const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= STORAGE ================= */
const storage = (folder = "general") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../uploads/${folder}`);

      // ✅ Create folder if not exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9);

      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

/* ================= FILE FILTER ================= */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

/* ================= EXPORT ================= */
const upload = (folder = "general") =>
  multer({
    storage: storage(folder),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

module.exports = upload;