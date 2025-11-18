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

const MONGO_URI = "mongodb+srv://maanjoofarms_db_user:2WJAUwXsjWIhDQAQ@cluster0.k1vwfxb.mongodb.net/maanjufarms_db?retryWrites=true&w=majority"; // change if needed

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

     // Clear existing products (optional)
    await Room.deleteMany({});

    // insert villas only (don’t delete rooms)
    await Room.insertMany(villas);

    console.log("Villas added successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
