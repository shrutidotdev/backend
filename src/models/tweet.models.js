import mongoose, { Schema } from "mongoose";

const tweetschema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: [true, "Content is required for tweeting"],
        minlength: [1, "Content must be at least 1 character long"],
        maxlength: [280, "Content must not exceed 280 characters"]
    }
    
}, { timestamps: true});

export const Tweet = model("Tweet", tweetschema)