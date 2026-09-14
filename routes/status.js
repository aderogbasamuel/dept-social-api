const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createStatus,
  getStatuses,
  getStatusById,
  deleteStatus,
  likeStatus,
} = require("../controllers/statusController");

router.get("/", getStatuses);
router.get("/:id", getStatusById);
router.post("/", protect, createStatus);
router.post("/:id/like", protect, likeStatus);
router.delete("/:id", protect, deleteStatus);

module.exports = router;
