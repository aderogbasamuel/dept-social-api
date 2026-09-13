const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createComment,
  getComments,
} = require("../controllers/commentController");
router.get("/:id", getComments);
router.post("/", protect, createComment);

module.exports = router;
