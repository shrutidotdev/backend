import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoschema = new mongoose.Schema({
    video: {
        type: String,
        required: [true, "Video URL is required"],
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail URL is required"],
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Owner is required"]
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [3, "Title must be at least 3 characters long"],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [500, "Description must not exceed 500 characters"]
    },
    duration:{
        type: Number,
        min: [0, "Duration cannot be negative"],
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true});

videoschema.plugin(mongooseAggregatePaginate);


export const Video = mongoose.model("Video", videoschema)