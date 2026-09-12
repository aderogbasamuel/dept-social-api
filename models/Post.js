const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  body: String,
  image: String,
  category: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});


module.exports=mongoose.model('Post', PostSchema);