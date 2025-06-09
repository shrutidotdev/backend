import mongoose, { Schema } from "mongoose";

const commentschema = new Schema({
    content: {
        type: String,
        required: [true, "Content is required for commeting"]
    },
    videos: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
    owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
}, {timestamps: true})

export const Comment = mongoose.model("Comment", commentschema)