const mongoose= require("mongoose");

const membershipSchema= new mongoose.Schema({
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    user: {
        type: moongose.Schema.TypesObjectId,
        ref: "User",
        required: true
    },
    role:{
        type: String,
        enum: ["member", "admin", "moderator"],
        default: "member",
    }

}, {
    timestamps: true,
})
membershipSchema.index({group: 1, user: 1}, {unique: true});
membershipSchema.index({user: 1});
module.exports= mongoose.model("Membership", membershipSchema)