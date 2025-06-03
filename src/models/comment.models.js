import mongoose from "mongoose";

const commentschema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Content is required for commeting"]
    },
    videos: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
    owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
}, {timestamps: true})

export const Comment = mongoose.model("Comment", commentschema)