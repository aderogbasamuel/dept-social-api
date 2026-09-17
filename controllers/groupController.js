const Group = require("../models/Group");
const Membership = require("../models/Membership");
const Post = require("../models/Post");

// POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description, privacy } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const existing = await Group.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "A group with that name exists" });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      privacy: privacy || "public",
      creator: req.user,
      memberCount: 1, // the creator
    });

    // Creator is automatically an admin member
    await Membership.create({
      group: group._id,
      user: req.user,
      role: "admin",
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error creating group" });
  }
};

// GET /api/groups  — browsable list
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ privacy: "public" })
      .sort({ memberCount: -1 })
      .populate("creator", "username avatarUrl");

    // Mark which ones the caller has already joined, so the frontend
    // can show "Joined" vs "Join" without a second round-trip.
    const myMemberships = await Membership.find({ user: req.user }).select(
      "group"
    );
    const joinedIds = new Set(myMemberships.map((m) => m.group.toString()));

    const withStatus = groups.map((g) => ({
      ...g.toObject(),
      isMember: joinedIds.has(g._id.toString()),
    }));

    res.status(200).json(withStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching groups" });
  }
};

// GET /api/groups/:id  — uses canViewGroup middleware, which sets req.group
const getGroupById = async (req, res) => {
  try {
    const group = await req.group.populate("creator", "username avatarUrl");

    res.status(200).json({
      group,
      isMember: !!req.membership,
      role: req.membership?.role || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching group" });
  }
};

// POST /api/groups/:id/join  — toggles join/leave
const toggleJoinGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const existing = await Membership.findOne({ group: id, user: req.user });

    if (existing) {
      // Don't let the last admin orphan the group
      if (existing.role === "admin") {
        const adminCount = await Membership.countDocuments({
          group: id,
          role: "admin",
        });
        if (adminCount === 1) {
          return res.status(400).json({
            message: "You are the only admin — promote someone before leaving",
          });
        }
      }

      await existing.deleteOne();
      group.memberCount = Math.max(0, group.memberCount - 1);
      await group.save();

      return res.status(200).json({
        joined: false,
        memberCount: group.memberCount,
      });
    }

    await Membership.create({ group: id, user: req.user, role: "member" });
    group.memberCount += 1;
    await group.save();

    res.status(200).json({ joined: true, memberCount: group.memberCount });
  } catch (error) {
    // The unique index throws code 11000 on a duplicate join race
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already a member" });
    }
    console.error("Join group error:", error);
    res.status(500).json({ message: "Server error joining group" });
  }
};

// GET /api/groups/:id/members
const getGroupMembers = async (req, res) => {
  try {
    const members = await Membership.find({ group: req.params.id })
      .sort({ role: 1, createdAt: 1 })
      .populate("user", "username avatarUrl department");

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching members" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  toggleJoinGroup,
  getGroupMembers,
};
