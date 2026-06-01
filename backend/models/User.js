const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    // Extended profile fields
    dob: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "prefer_not_to_say", ""], default: "" },
    beautyUse: { type: String, trim: true, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
