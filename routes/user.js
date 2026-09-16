const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const upload = require("../middleware/upload");
const { updateUsername, uploadAvatar } = require("../controllers/userController");

router.patch("/username", protect, updateUsername);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;