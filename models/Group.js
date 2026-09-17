const mongoose =  require("mongoose");

const GroupSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
        maxLength: 300,
    },
    avatar: {
        type: String,
        default: "",   
    },
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    privacy: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    memberCount:{
        type: Number,
        default: 0,
    },
    postCount:{
        type: Number,
        default: 0,
    }

},
{timestamp: true})

GroupSchema.index({name: "text", description: "text"});

module.exports= mongoose.model("Group", GroupSchema)