const Group = require("../models/Group");
const Membership = require("../models/Membership");
const Post = require("../models/Post");

const createGroup = async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }
    const existing = await Group.find({ name: name.trim() });

    if (existing) {
      return res.status(409).json({
        message: "Group already exists",
      });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      privacy: privacy || "public",
      creator: req.user,
      memberCount: 1,
    });

    await Memebership.create({
      group: group._id,
      user: req.user,
      role: "admin",
    });

    res.status(201).json({
      message: "Group created Succesfully",
      group,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ privacy: "public" })
      .sort({ memberCount: -1 })
      .populate("creator", "username avatarUrl");

    const myMemberShips = await Membership.find({ user: req.user }).select(
      "group",
    );

    const joinedIds = new Set(myMemberShips.map((m) => m.group.toString()));

    const withStatus = group.map((g) => ({
      ...g.toObject(),
      isMember: joinedIds.has(g._id.toString()),
    }));
    res.status(200).json(withStatus);
  } catch (error) {
    res.status(500).json({
      message: "server error",
    });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await req.group.populate("creator", "username avatar");
    res.status(200).json({
      group,
      isMember: !!req.membership,
      role: req.membership?.role || null,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
    });
  }
};

const toggleJoinGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const existing = await Membership.findOne({ group: id, user: req.user });

    if (existing) {
      if (existing.role == "admin") {
        const adminCount = await Membership.countDocuments({
          group: id,
          role: "admin",
        });

        if (adminCount == 1) {
          return res.status(400).json({
            message: "You are the only admin — promote someone before leaving",
          });
        }

        await existing.deleteOne();
        group.memberCount = Math.max(0, group.memberCount - 1);
        await group.save();
        return res.status(200).json({
          joined: false,
          memberCount: group.memberCount,
        });
      }

      await Membership.create({
    group: id, 
    user: req.user,
    role: "member"
      });
    }
    group.memberCount+=1;
    await group.save();
    res.status(200).json({ joined: true, memberCount: group.memberCount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already a member" });
    }
    console.error("Join group error:", error);
    res.status(500).json({
      message: "server error",
    });
  }
};


const getGroupMembers= async(req, res)=>{
    try {
        const members= await Membership.find({group: req.params.id}).sort({role: 1, createdAt: 1}).populate("user", "username avatarUrl department");
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching members" });
    }
}

module.exports={
    createGroup,
    getGroups,
    getGroupById,
    toggleJoinGroup,
    getGroupMembers,
}