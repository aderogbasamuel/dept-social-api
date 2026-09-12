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
} = require("../controllers/postController");
router.post("/",protect, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById );
router.post("/:id",protect, deletePost);
router.patch("/:id",protect, updatePost);
router.patch("/:id",protect, likePost);

module.exports = router;
