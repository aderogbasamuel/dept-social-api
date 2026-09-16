const Membership = require("../models/Membership");
const Group = require("../models/Group");

/**
 * Runs AFTER `protect` (needs req.user).
 * Looks up the caller's membership in the group named by the route,
 * and attaches it as req.membership so controllers can check role.
 *
 * Use on any route where being a member is required to act.
 */
const requireMembership = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.params.id || req.body.group;

    if (!groupId) {
      return res.status(400).json({ message: "No group specified" });
    }

    const membership = await Membership.findOne({
      group: groupId,
      user: req.user,
    });

    if (!membership) {
      return res
        .status(403)
        .json({ message: "You must be a member of this group" });
    }

    req.membership = membership;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking membership" });
  }
};

/**
 * Stricter version — member AND admin.
 * For destructive actions: deleting the group, removing members,
 * deleting someone else's post in the group.
 */
const requireGroupAdmin = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.params.id;

    const membership = await Membership.findOne({
      group: groupId,
      user: req.user,
    });

    if (!membership || membership.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Admin access required for this action" });
    }

    req.membership = membership;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking permissions" });
  }
};

/**
 * Softer version — for READING a group's posts.
 * Public groups: anyone logged in can read.
 * Private groups: members only.
 * Attaches req.membership if they happen to be a member (may be null).
 */
const canViewGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const membership = await Membership.findOne({
      group: groupId,
      user: req.user,
    });

    if (group.privacy === "private" && !membership) {
      return res.status(403).json({ message: "This group is private" });
    }

    req.group = group;
    req.membership = membership; // may be null — that's fine here
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking group access" });
  }
};

module.exports = { requireMembership, requireGroupAdmin, canViewGroup };