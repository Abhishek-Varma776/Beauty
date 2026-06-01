/**
 * Image Copier Script
 * Run with: node scripts/copyImages.js
 */
const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "C:\\Users\\pujal\\.gemini\\antigravity-ide\\brain\\3aad5aa4-f21d-48ad-a1da-4724a01d6cc9";
const DEST_DIR = path.join(__dirname, "..", "uploads");

const fileMap = {
  "media__1780290738654.png": "hair-color.png",
  "media__1780290809872.png": "full-face-threading.png",
  "media__1780290853867.png": "cleanup.png",
  "media__1780290886909.png": "pedicure.png",
  "media__1780290914963.png": "upper-lip.png",
  "eyebrows_service_1780291043981.png": "eyebrows.png"
};

try {
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  Object.entries(fileMap).forEach(([srcName, destName]) => {
    const srcPath = path.join(SOURCE_DIR, srcName);
    const destPath = path.join(DEST_DIR, destName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅  Copied ${srcName} -> ${destName}`);
    } else {
      console.warn(`⚠️  Source file not found: ${srcName}`);
    }
  });

  console.log("🎉  All images successfully copied to backend uploads!");
} catch (err) {
  console.error("❌  Error copying files:", err.message);
}
