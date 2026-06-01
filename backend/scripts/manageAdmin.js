/**
 * Admin Management Script
 * 
 * Commands:
 * 1. List users:
 *    node scripts/manageAdmin.js list
 * 
 * 2. Promote an existing user to admin:
 *    node scripts/manageAdmin.js promote <phone>
 * 
 * 3. Create a brand-new admin:
 *    node scripts/manageAdmin.js create <name> <phone> <password>
 */
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const command = process.argv[2];

if (!command || !["list", "promote", "create"].includes(command)) {
  console.log("\n❌  Invalid or missing command!");
  console.log("Usage:");
  console.log("  node scripts/manageAdmin.js list");
  console.log("  node scripts/manageAdmin.js promote <phone>");
  console.log("  node scripts/manageAdmin.js create <name> <phone> <password>");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB");

    if (command === "list") {
      const users = await User.find({}, "name phone role email").lean();
      console.log("\n--- Registered Users ---");
      if (users.length === 0) {
        console.log("No users found.");
      } else {
        users.forEach((user, idx) => {
          console.log(`${idx + 1}. Name: ${user.name} | Phone: ${user.phone} | Role: ${user.role} | Email: ${user.email || 'N/A'}`);
        });
      }
      console.log("-------------------------\n");
    } else if (command === "promote") {
      const phone = process.argv[3];
      if (!phone) {
        console.error("❌  Usage: node scripts/manageAdmin.js promote <phone>");
        process.exit(1);
      }

      const user = await User.findOne({ phone: phone.trim() });
      if (!user) {
        console.error(`❌  No user found with phone number: ${phone}`);
      } else {
        user.role = "admin";
        await user.save();
        console.log(`🎉  Successfully promoted "${user.name}" (${user.phone}) to ADMIN!`);
      }
    } else if (command === "create") {
      const name = process.argv[3];
      const phone = process.argv[4];
      const password = process.argv[5];

      if (!name || !phone || !password) {
        console.error("❌  Usage: node scripts/manageAdmin.js create <name> <phone> <password>");
        process.exit(1);
      }

      const existingUser = await User.findOne({ phone: phone.trim() });
      if (existingUser) {
        console.error(`❌  A user with phone number ${phone} already exists! Use 'promote' instead.`);
      } else {
        const newUser = await User.create({
          name: name.trim(),
          phone: phone.trim(),
          password,
          role: "admin"
        });
        console.log(`🎉  Successfully created new ADMIN user: "${newUser.name}" (${newUser.phone})!`);
      }
    }
  } catch (err) {
    console.error("❌  Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
  }
})();
