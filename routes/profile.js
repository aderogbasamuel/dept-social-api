const express = require("express");

const router = express.Router();


const {
  getUserProfile, toggleFollow, 
} = require("../controllers/profileController");
router.get("/:id", getUserProfile);
router.post("/:id/follow", toggleFollow);
// router.post("/:id/like",protect, likePost);

module.exports = router;
