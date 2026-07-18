require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");

const villas = [
  {
    name: "Thar Olive Cottage",
    category: "villa",
    type: "cottage",
    description:
      "A cozy cottage surrounded by olive trees, offering a peaceful retreat with modern amenities.",
    image: "https://thar-olive-cottages.hotels-rajasthan.com/data/Pics/OriginalPhoto/15409/1540933/1540933576/thar-olive-cottages-pilani-pilani-pic-14.JPEG",
    price: 2500
  },
  {
    name: "Date Palm Villa",
    category: "villa",
    type: "villa",
    description:
      "Spacious villa nestled among date palms, providing a luxurious stay with scenic views.",
    image: "https://thar-olive-cottages.hotels-rajasthan.com/data/Pics/OriginalPhoto/15409/1540933/1540933576/thar-olive-cottages-pilani-pilani-pic-14.JPEG",
    price: 3000
  },
  {
    name: "Sweet Lime Suite",
    category: "villa",
    type: "suite",
    description:
      "Elegant suite overlooking sweet lime orchards, perfect for relaxation and rejuvenation.",
    image: "https://thar-olive-cottages.hotels-rajasthan.com/data/Pics/OriginalPhoto/15409/1540933/1540933576/thar-olive-cottages-pilani-pilani-pic-14.JPEG",
    price: 2800
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Only delete existing villas, keep rooms
    await Room.deleteMany({ category: "villa" });

    await Room.insertMany(villas);
    console.log(`✅ ${villas.length} villas added to DB`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
