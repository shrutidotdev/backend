import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

export const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  // Get user details from frontend
  // Perform validation (checking for non-empty fields)
  // Check if user already exists (username, email)
  // Handle image/avatar uploads
  // Upload images to Cloudinary
  // Create user object and database entry
  // Remove password and refresh token fields from response
  // Check for user creation success
  // Return response
  const { username, email, fullname, password } = req.body;
  console.log(req.body)

  // Perform validation (checking for non-empty fields)
  //    if(!email || !password) {
  //     return new ApiError(400, null, "Email and password are required").send(res);
  //    }
  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists (username, email)
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return new ApiError(409, "User already exists");
  }

  // Handle image/avatar uploads - avatar(required) and coverImage
  const avatarLocalPath = req.files?.avatar[0]?.path
  console.log(req.files)
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required")
  }

  // Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }
  // Create user object and database entry
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username,
    email,
    password
  })

  // Remove password and refresh token fields from response
  const createUser =  await User.findById(user._id).select(
    "-password -refreshToken"
  )
  // Check for user creation success
  if(!createUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }
  // Return response
  return new ApiResponse(200, createUser, "User registered successfully✅").send(res)
})
