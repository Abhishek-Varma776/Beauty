const express = require("express");
const {
  adminBookings,
  availableSlots,
  cancelBooking,
  createBooking,
  createOnlineOrder,
  getBooking,
  myBookings,
  todayBookings,
  updateStatus,
  verifyPayment,
} = require("../controllers/bookingController");
const { adminOnly, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/slots", availableSlots);
router.post("/", protect, createBooking);
router.get("/my", protect, myBookings);
router.get("/today", protect, adminOnly, todayBookings);
router.get("/admin", protect, adminOnly, adminBookings);
router.get("/:id", protect, getBooking);
router.patch("/:id/status", protect, adminOnly, updateStatus);
router.patch("/:id/cancel", protect, cancelBooking);
router.post("/payments/order", protect, createOnlineOrder);
router.post("/payments/verify", protect, verifyPayment);

module.exports = router;
