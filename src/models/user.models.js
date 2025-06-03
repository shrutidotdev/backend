import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        minlength: [2, "Username must be at least 2 characters long"],
        maxlength: [10, "Username must not exceed 10 characters"],
        match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
        index : true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, "Please enter a valid email address"],
    },
    fullname: {
       type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,//cloudinary URL
        default: "https://res.cloudinary.com/dz1qj3x8h/image/upload/v1707261234/avatars/default-avatar.png",
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, "Please enter a valid image URL"],
        required: true
    },
    coverImage: {
        type: String, // cloudinary URL
        default: "https://res.cloudinary.com/dz1qj3x8h/image/upload/v1707261234/avatars/default-avatar.png",
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, "Please enter a valid image URL"]
    },
    watchHistory: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videos"
    }
],
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false // Exclude password from queries by default
    },
    refreshToken : {
        type: String,
        select: false
    },
    hasAccess: {
        type: Boolean,
        default: false
    }

}, { timestamps: true})

userSchema.pre("save", async function(next) {
   if(!this.isModified("password")) return next();

   this.password = await bcrypt.hash(this.password, 10)
   next()
})

userSchema.methods.isPasswordMatch = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        _id = this._id,
        email = this.email
    ),
    process.env.ACCESS_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
}
userSchema.methods.generateRefreshToken = function() {
     return jwt.sign(
        _id = this._id,
        email = this.email
    ),
    process.env.REFRESH_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//        issuer: process.env.REFRESH_TOKEN_ISSUER

    }
}
export const User = mongoose.model("User", userSchema)