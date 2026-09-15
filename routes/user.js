const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const upload = require("../middleware/upload");
const { updateUsername, uploadAvatar } = require("../controllers/userController");
const {
getPostsByUser
} = require("../controllers/profileController");
router.patch("/username", protect, updateUsername);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.get("/:id/", getPostsByUser);
module.exports = router;