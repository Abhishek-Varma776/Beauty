/**
 * Drop stale unique indexes from the users collection.
 * Run with: node scripts/dropStaleIndexes.js
 */
const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB");

    // Get the raw users collection
    const usersCollection = mongoose.connection.collection("users");
    
    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log("Current indexes:", indexes.map(idx => idx.name));

    // Check if email_1 unique index exists
    const emailIndex = indexes.find(idx => idx.name === "email_1" || idx.key?.email !== undefined);
    
    if (emailIndex) {
      console.log(`⚠️  Found email index:`, emailIndex);
      await usersCollection.dropIndex(emailIndex.name);
      console.log("🎉  Successfully dropped stale email index!");
    } else {
      console.log("ℹ️  No stale email index found.");
    }
  } catch (err) {
    console.error("❌  Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
  }
})();
