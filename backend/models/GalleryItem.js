const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
  {
    image_url: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
