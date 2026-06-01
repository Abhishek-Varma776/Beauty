const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    starts_at: { type: Date, required: true },
    ends_at: { type: Date, required: true },
    service_type: { type: String, enum: ["home", "salon"], default: "home" },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    payment_type: { type: String, enum: ["online", "cash"], required: true },
    payment_status: {
      type: String,
      enum: ["created", "paid", "failed", "not_required", "refunded"],
      default: "not_required",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

bookingSchema.virtual("service", {
  ref: "Service",
  localField: "service_id",
  foreignField: "_id",
  justOne: true,
});

bookingSchema.virtual("customer", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Booking", bookingSchema);
