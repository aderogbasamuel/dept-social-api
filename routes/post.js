const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  likePost,
} = require("../controllers/postControllers");
router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById );
router.delete("/:id",protect, deletePost);
router.patch("/:id",protect, updatePost);
router.post("/:id/like",protect, likePost);

module.exports = router;
