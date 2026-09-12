const Comment = require("../models/Comment");

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user,
      post: id,
    });

    const populatedComment = await comment.populate(
      "author",
      "username"
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("CREATE COMMENT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ post: id })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createComment,
  getComments,
};