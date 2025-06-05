import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import User from "../models/user.models";
import ApiError from "../utils/ApiError";

// This will verify if User is there our not
export const verifyJwt = asyncHandler(async(req , res, next ) => {
    try {
        // Authorization: Bearer <token> => JWT =>Postman
        const token = req.cookies?.accessToken || req.header("Authorization")?.repalce("Bearer", "")
      
        if(!token) {
          throw new ApiError(401, "Unauthorized Request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
      
        if(!user) {
          
          throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
      } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
      }
})