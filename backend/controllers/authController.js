const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email || "",
  role: user.role,
  dob: user.dob || null,
  gender: user.gender || "",
  beautyUse: user.beautyUse || "",
  created_at: user.createdAt,
});

const isStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return strongPasswordRegex.test(password);
};

exports.register = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    res.status(400);
    throw new Error("Name, phone number, and password are required");
  }

  if (!isStrongPassword(password)) {
    res.status(400);
    throw new Error(
      "Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  const existingUser = await User.findOne({ phone: phone.trim() });
  if (existingUser) {
    res.status(409);
    throw new Error("This phone number is already registered");
  }

  const user = await User.create({ name: name.trim(), phone: phone.trim(), password });
  res.status(201).json({ token: generateToken(user.id), user: serializeUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error("Phone number and password are required");
  }

  const user = await User.findOne({ phone: phone.trim() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid phone number or password");
  }

  res.json({ token: generateToken(user.id), user: serializeUser(user) });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name ?? req.user.name;
  req.user.phone = req.body.phone ?? req.user.phone;
  if (req.body.dob !== undefined) req.user.dob = req.body.dob || null;
  if (req.body.gender !== undefined) req.user.gender = req.body.gender;
  if (req.body.beautyUse !== undefined) req.user.beautyUse = req.body.beautyUse;
  await req.user.save();
  res.json({ user: serializeUser(req.user) });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  const user = await User.findOne({ phone: phone.trim() });
  if (!user) {
    res.status(404);
    throw new Error("No account found with this phone number");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  user.resetPasswordToken = otp;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  console.log(`🔑 PASSWORD RESET OTP for ${user.phone}: ${otp}`);

  res.json({
    message: "Reset code generated successfully.",
    phone: user.phone,
    otp: otp 
  });
});

exports.verifyResetCode = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    res.status(400);
    throw new Error("Phone number and reset code are required");
  }

  const user = await User.findOne({
    phone: phone.trim(),
    resetPasswordToken: code.trim(),
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset code");
  }

  res.json({ message: "Reset code verified successfully. You can now reset your password." });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { phone, code, newPassword } = req.body;

  if (!phone || !code || !newPassword) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (!isStrongPassword(newPassword)) {
    res.status(400);
    throw new Error(
      "New password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  const user = await User.findOne({
    phone: phone.trim(),
    resetPasswordToken: code.trim(),
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset code");
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: "Password reset successfully! You can now log in." });
});
