const express = require("express");
const { listBusinessHours, upsertBusinessHour } = require("../controllers/businessHourController");
const { adminOnly, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listBusinessHours);
router.put("/", protect, adminOnly, upsertBusinessHour);

module.exports = router;
