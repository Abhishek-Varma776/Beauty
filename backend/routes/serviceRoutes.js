const express = require("express");
const {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} = require("../controllers/serviceController");
const { adminOnly, protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", listServices);
router.get("/:id", getService);
router.post("/", protect, adminOnly, upload.single("image"), createService);
router.patch("/:id", protect, adminOnly, upload.single("image"), updateService);
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;
