const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();


const {
  getUserProfile, toggleFollow, 
} = require("../controllers/profileController");
router.get("/:id",protect, getUserProfile);
router.post("/:id/follow",protect, toggleFollow);
// router.post("/:id/like",protect, likePost);

module.exports = router;
