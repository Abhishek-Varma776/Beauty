const mongoose = require("mongoose");

const businessHourSchema = new mongoose.Schema(
  {
    weekday: { type: Number, required: true, min: 0, max: 6, unique: true },
    open_time: { type: String, required: true },
    close_time: { type: String, required: true },
    is_open: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

module.exports = mongoose.model("BusinessHour", businessHourSchema);
