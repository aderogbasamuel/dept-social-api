const Post = require("../models/Post");
const Group = require("../models/Group");
const Membership = require("../models/Membership");
const cloudinary = require("../config/Cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "dept-social/posts" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createPost = async (req, res) => {
  try {
    const { text, group } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    if (group) {
      const membership = await Membership.findOne({
        group,
        user: req.user,
      });
      if (!membership) {
        return res
          .status(403)
          .json({ message: "You must join this group to post in it" });
      }
    }

    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const post = await Post.create({
      text: text.trim(),
      image: imageUrl,
      author: req.user,
      group: group || null,
    });

    if (group) {
      await Group.findByIdAndUpdate(group, { $inc: { postCount: 1 } });
    }

    const populated = await post.populate([
      { path: "author", select: "username avatarUrl" },
      { path: "group", select: "name avatar" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    console.error("post ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// const createPost = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     console.log("Received body:", req.body);
//     if (!text || !text.trim()) {
//       return res.status(400).json({
//         message: "Post cannot be empty",
//       });
//     }

//     const post = await Post.create({
//       text: text.trim(),
//       image: image,
//       author: req.user,
//     });

//     const populatedPost = await post.populate("author", "username");
//     res.status(201).json({ populatedPost });
//   } catch (err) {
//     console.error("post ERROR:", err);

//     res.status(500).json({
//       message: err.message,
//     });
//   }
// };
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter;

    if (req.query.group) {
      // Single group's feed
      filter = { group: req.query.group };
    } else if (req.query.scope === "main") {
      // Ungrouped only
      filter = { group: null };
    } else {
      // Mixed home feed — this is the default
      const memberships = await Membership.find({ user: req.user }).select(
        "group",
      );
      const myGroupIds = memberships.map((m) => m.group);

      filter = {
        $or: [
          { group: null }, // everyone's main-feed posts
          { group: { $in: myGroupIds } }, // posts from groups you're in
        ],
      };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl")
      .populate("group", "name avatar"); // so the UI can show "posted in X"

    const total = await Post.countDocuments(filter);
    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      likedByMe: post.likes.some((id) => id.toString() === req.user.toString()),
    }));
    res.status(200).json({
      posts: postsWithLikeStatus,
      page,
      limit,
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        message: "Post not found",
      });
      const postsWithLikeStatus = posts.map((post) => ({
  ...post.toObject(),
  likedByMe: post.likes.some((id) => id.toString() === req.user.toString()),
}));
    res.status(200).json({
      post: postsWithLikeStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(401).json({ message: "Erro" });
    if (req.user.toString() != post.author.toString()) {
      return res.status(401).json({
        message: "Not authorized, can't delete this post",
      });
    }
    await post.deleteOne();
    res.status(200).json({
      message: "Post Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ messsage: "Post not found" });
    if (req.user.toString() != post.author.toString()) {
      return res.status(401).json({
        message: "Not authorized, can't Update this post",
      });
    }
    const editTimeLimit = 15 * 60 * 1000;
    const currentTime = new Date().getTime();
    const postCreationTime = new Dat(post.createdAt).getTime();

    if (currentTime - postCreationTime > editTimeLimit) {
      return res
        .status(403)
        .json({ message: "Editing time window has expired" });
    }

    const newPost = await Post.save({
      text,
      isEdited: true,
    });

    res.status(201).json({ message: "Post created sucesfully", newPost });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
const likePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() == req.user.toString(),
    );
    if (alreadyLiked) {
      post.likes.pull(req.user);
    } else {
      post.likes.push(req.user);
    }
    await post.save();
    res
      .status(200)
      .json({ liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  likePost,
};
