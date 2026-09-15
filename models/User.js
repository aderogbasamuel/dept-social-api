const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      // default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    department: String,
    birthday: {
      type: Date,
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  },

);

module.exports = mongoose.model("User", userSchema);
