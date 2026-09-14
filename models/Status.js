const mongoose = require("mongoose");

const StatusSchema= new mongoose.Schema({
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    likes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isViewed:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

module.exports= mongoose.model("Status", StatusSchema)