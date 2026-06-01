const express = require("express");
const { createGalleryItem, listGallery } = require("../controllers/galleryController");
const { adminOnly, protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", listGallery);
router.post("/", protect, adminOnly, upload.single("image"), createGalleryItem);

module.exports = router;
