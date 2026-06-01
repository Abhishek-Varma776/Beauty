const mongoose = require("mongoose");
const Service = require("../models/Service");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    const services = await Service.find({});
    console.log(`Total services in DB: ${services.length}`);
    services.forEach(s => {
      console.log(`- ID: ${s._id}, Name: "${s.name}", Active: ${s.is_active}, Image: "${s.image_url}"`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
