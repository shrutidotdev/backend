import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";

// This will verify if User is there our not
export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    // Authorization: Bearer <token> => JWT =>Postman
    const token = req.cookies?.accessToken || req.header("Authorization")?.repalce("Bearer ", "")

    if (!token) {
      throw new ApiError(401, "Unauthorized Request")
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    // decodedToken?._id = userSchema.methods.generateAccessToken = function () {
    // return jwt.sign(
    //   {
    //       _id: this._id,
    //       email: this.email
    //   },
    //   process.env.ACCESS_TOKEN_SECRET,
    //   {
    //       algorithm: "HS256",
    //       expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    //   })

    if (!user) {

      throw new ApiError(401, "Invalid Access Token")
    }

    req.user = user;

    next();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
})


// for unused like  res can get replaced with _