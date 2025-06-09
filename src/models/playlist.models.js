import mongoose, { Schema } from "mongoose";

const playlistschema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters long"],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [300, "Description must not exceed 300 characters"]
    },
    videos: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true});


export const Playlist = mongoose.model("Playlist", playlistschema)