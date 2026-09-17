const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    image: String,
    category: String,
    isEdited: { type: Boolean, default: false },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    }, 
    commentcount:{
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);
PostSchema.index({ group: 1, createdAt: -1 });
module.exports=mongoose.model('Post', PostSchema);