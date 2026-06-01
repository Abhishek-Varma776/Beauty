/**
 * Run this script to delete a user by phone number from MongoDB.
 * Usage: node scripts/deleteUser.js <phone>
 * Example: node scripts/deleteUser.js 9491874221
 */
const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const phone = process.argv[2];

if (!phone) {
  console.error("❌  Usage: node scripts/deleteUser.js <phone>");
  process.exit(1);
}

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB");

    const result = await User.deleteMany({ phone: phone.trim() });
    if (result.deletedCount > 0) {
      console.log(`✅  Deleted ${result.deletedCount} user(s) with phone: ${phone}`);
    } else {
      console.log(`⚠️  No user found with phone: ${phone}`);
    }
  } catch (err) {
    console.error("❌  Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
  }
})();
