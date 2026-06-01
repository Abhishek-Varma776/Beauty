const asyncHandler = require("../utils/asyncHandler");
const GalleryItem = require("../models/GalleryItem");

exports.listGallery = asyncHandler(async (req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  res.json({ items });
});

exports.createGalleryItem = asyncHandler(async (req, res) => {
  const imageUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : req.body.image_url;
  const item = await GalleryItem.create({
    title: req.body.title,
    image_url: imageUrl,
    uploaded_by: req.user.id,
  });
  res.status(201).json({ item });
});
