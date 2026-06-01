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

exports.register = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    res.status(400);
    throw new Error("Name, phone number, and password are required");
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
