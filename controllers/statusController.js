const Status = require("../models/Status");

const createStatus = async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Status text cannot be empty" });
    }

    const status = await Status.create({
      text: text.trim(),
      image,
      author: req.user,
    });

    res.status(201).json({ message: "Status created successfully", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find()
      .sort({ createdAt: -1 })
      .populate("author", "username avatarUrl");
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findById(id).populate("author", "username avatarUrl");

    if (!status) {
      return res.status(404).json({
        message: "404 not found",
      });
    }
    const alreadyViewed = status.likes.some(
      (userId) => userId.toString() == req.user.toString(),
    );
    if (alreadyViewed) {
      status.likes.pull(req.user);
    } else {
      status.likes.push(req.user);
    }
    await status.save();

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findByIdAndDelete(id);
    if (!status) return res.status(401).json({ message: "Status not found" });
    res.status(200).json({
      message: "Post Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const likeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findById(id);
    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }
    const isLiked = status.likes.some(
      (userId) => userId.toString() == req.user.toString(),
    );
    if (isLiked) {
      status.likes.pull(req.user);
    } else {
      status.likes.push(req.user);
    }
    await status.save();
    res.status(200).json({ liked: !isLiked, likesCount: status.likes.length });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error,
    });
  }
};
module.exports = {
  createStatus,
  getStatuses,
  getStatusById,
  deleteStatus,
  likeStatus,
};
