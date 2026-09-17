const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  likePost,
} = require("../controllers/postControllers");
const {
getPostsByUser
} = require("../controllers/profileController");
router.post("/", protect, upload.single("image"), createPost);
router.get("/", protect, getPosts);
router.get("/:id", protect, getPostById );
router.delete("/:id", protect, deletePost);
router.patch("/:id", protect, updatePost);
router.post("/:id/like", protect, likePost);
router.get("/user/:id/", getPostsByUser);
module.exports = router;
