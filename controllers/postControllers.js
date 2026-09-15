const Post = require("../models/Post");
const cloudinary = require("../config/Cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "dept-social/posts" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Post cannot be empty" });
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
    });

    const populated = await post.populate("author", "username avatarUrl");
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
    const posts = await Post.find()
      .populate("author", "username avatarUrl")
      .sort({ createdAt: -1 });
    if (!posts)
      return res.status(401).json({
        message: "No post found",
      });

    res.status(200).json({
      posts,
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
    res.status(200).json({
      post,
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
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(401).json({ message: "Erro" });
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
    const post = await Post.findById(id);
    const { text } = req.body;
    if (!post) return res.status(404).json({ messsage: "Post not found" });

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
