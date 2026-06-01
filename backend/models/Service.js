const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    price_home: { type: Number, default: 0 },
    duration_min: { type: Number, required: true, min: 15 },
    image_url: { type: String, default: null },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

module.exports = mongoose.model("Service", serviceSchema);
