const express = require("express");
const { login, me, register, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.patch("/profile", protect, updateProfile);

module.exports = router;
