const User = require("../models/User");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/Cloudinary");
const streamifier = require("streamifier");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};


const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "dept-social/avatars" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    const trimmed = username.trim();

    const existing = await User.findOne({ username: trimmed });
    if (existing && existing._id.toString() !== req.user.toString()) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { username: trimmed },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Username updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error updating username" });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user,
      { avatarUrl: result.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Avatar updated", user });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error uploading avatar" });
  }
};


const register = async (req, res) => {
  try {
    const { username, email, password, department, birthday, avatarUrl } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User Already Exixts",
      });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      department,
      birthday,
      avatarUrl, 
    });
    res.status(201).json({
      message: "User Created Succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const isMatch = await bycrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    res.cookie("token", generateToken(user._id), {
      httpOnly: true,
      secure: true, // true in production (https)
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        department: user.department,
        birthday: user.birthday,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error, could not login",
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not Found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: `Server error, could not get user, ${error}`,
    });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // set to true in production (https)
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  me,
  logout,
  updateUsername,
  uploadAvatar,
};
