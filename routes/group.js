const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  requireMembership,
  requireGroupAdmin,
  canViewGroup,
} = require("../middleware/GroupMiddleware");
const {
  createGroup,
  getGroups,
  getGroupById,
  toggleJoinGroup,
  getGroupMembers,
} = require("../controllers/groupController");

const router = express.Router();

router.get("/", protect, getGroups);
router.post("/", protect, createGroup);

router.get("/:id", protect, canViewGroup, getGroupById);
router.post("/:id/join", protect, toggleJoinGroup);
router.get("/:id/members", protect, canViewGroup, getGroupMembers);

module.exports = router;