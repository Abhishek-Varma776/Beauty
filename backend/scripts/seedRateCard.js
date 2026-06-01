/**
 * Seeding Script for Mani's Elite Makeover Rate Card
 * Run with: node scripts/seedRateCard.js
 */
const mongoose = require("mongoose");
const Service = require("../models/Service");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const rateCardServices = [
  {
    name: "Eyebrows",
    description: "Precise eyebrows threading/shaping to enhance your natural facial structure.",
    price: 50,
    price_home: 99,
    duration_min: 15,
    image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Upper Lip",
    description: "Quick and hygienic upper lip threading service.",
    price: 30,
    price_home: 49,
    duration_min: 15,
    image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Full Face Threading",
    description: "Complete facial hair threading for a clean, smooth, and radiant look.",
    price: 150,
    price_home: 249,
    duration_min: 30,
    image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Cleanup",
    description: "Refreshing face cleanup to remove dirt, blackheads, and dead skin cells.",
    price: 399,
    price_home: 799,
    duration_min: 45,
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Facial",
    description: "Premium glowing skin facial with gentle massage and hydration pack.",
    price: 599,
    price_home: 999,
    duration_min: 60,
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Pedicure",
    description: "Relaxing foot soak, scrub, nail shaping, and soothing massage.",
    price: 799,
    price_home: 899,
    duration_min: 60,
    image_url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Manicure",
    description: "Professional hand therapy, nail grooming, scrub, and massage.",
    price: 499,
    price_home: 699,
    duration_min: 45,
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Hair Cut",
    description: "Trendy haircut and style perfectly tailored to your preference.",
    price: 149,
    price_home: 199,
    duration_min: 45,
    image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Hair Spa",
    description: "Nourishing deep-conditioning cream spa treatment to revive dry/damaged hair.",
    price: 999,
    price_home: 1299,
    duration_min: 60,
    image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Hair Color",
    description: "Professional root touch-up or full hair coloring with premium products.",
    price: 1199,
    price_home: 1499,
    duration_min: 90,
    image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Saree Draping",
    description: "Elegant, clean, and perfectly styled saree draping for any special occasion.",
    price: 499,
    price_home: 999,
    duration_min: 30,
    image_url: "http://localhost:5000/uploads/saree-draping.png",
    is_active: true
  },
  {
    name: "Party Makeup",
    description: "Gorgeous party-ready makeup and hairstyling designed to make you shine.",
    price: 2999,
    price_home: 3999,
    duration_min: 90,
    image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Engagement Makeup",
    description: "Flawless HD makeup, advanced hair styling, and professional draping for your special day.",
    price: 5999,
    price_home: 6999,
    duration_min: 120,
    image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    is_active: true
  },
  {
    name: "Bridal Makeup",
    description: "Luxury signature bridal package including HD/Airbrush makeup, hair styling, draping, and jewelry setting.",
    price: 9999,
    price_home: 12999,
    duration_min: 180,
    image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
    is_active: true
  }
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB");

    // Clear existing services
    const deleteResult = await Service.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} old service(s) from database.`);

    // Insert new rate card services
    const inserted = await Service.insertMany(rateCardServices);
    console.log(`🎉  Successfully seeded ${inserted.length} Rate Card services!`);

  } catch (err) {
    console.error("❌  Error seeding database:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
  }
})();
