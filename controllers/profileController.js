const Post = require("../models/Post");
const User = require("../models/User");
// GET /api/users/:id — public-ish profile view (still behind `protect` since
// your whole app requires login anyway, but doesn't require it be YOUR id)
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postsCount = await Post.countDocuments({ author: id });

    const isFollowing = user.followers.some(
      (followerId) => followerId.toString() === req.user.toString()
    );

    res.status(200).json({
      user,
      postsCount,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      isFollowing,
      isOwnProfile: id === req.user.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// POST /api/users/:id/follow — toggles follow/unfollow
const toggleFollow = async (req, res) => {
  try {
    const { id } = req.params; // the user being followed/unfollowed

    if (id === req.user.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(req.user);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.some(
      (uid) => uid.toString() === id
    );

    if (isFollowing) {
      currentUser.following.pull(id);
      targetUser.followers.pull(req.user);
    } else {
      currentUser.following.push(id);
      targetUser.followers.push(req.user);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      following: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error toggling follow" });
  }
};

// GET /api/posts/user/:id — a specific user's posts, for their profile feed
const getPostsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ author: id })
      .sort({ createdAt: -1 })
      .populate("author", "username avatarUrl");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching user's posts" });
  }
};

module.exports = { getUserProfile , toggleFollow, getPostsByUser };