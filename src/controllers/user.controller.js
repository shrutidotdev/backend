import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";

// util fn for generate Access And RefreshToken
const generateAccessAndRefreshToken = async (userId) => {
  try {
    // 1. Find the user by ID
    const user = await User.findById(userId)

    // 2. Generate tokens using model methods
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // 3. Save refresh token to database
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    // 4. Return both tokens
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens ")
  }
}

// Register
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
  //const { coverImage, avatar } = req.files
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

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
    throw new ApiError(409, "User already exists");
  }

  // Handle image/avatar uploads - avatar(required) and coverImage
  const avatarLocalPath = req.files?.avatar?.[0]?.path
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required")
  }

  // Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }
  // Create user object and database entry
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password
  })

  // Remove password and refresh token fields from response
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ).lean()
  // Check for user creation success
  if (!createUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }
  // Return response
  return res.status(200).json(new ApiResponse(201, createUser, "User registered successfully✅"))
})

export const loginUser = asyncHandler(async (req, res) => {
  // Retrive the data from frontend 
  const { username, email, password } = req.body
  // But if  we want either one then 
  //if(!(username ||email))
  // VAlidate 
  if (!email && !username) {
    throw new ApiError(400, "Email and Username is required")
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  })

  console.log(user)

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const userPasswordMatch = await user.isPasswordMatch(password)
  if (!userPasswordMatch) {
    throw new ApiError(401, "Invalid Password")
  }

  // running generate tokes both 

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  // send cookies 
  const loggedInUser = await User.findById(user.id).select("-password -refreshToken")

  // By default cookies are editable on frontend but after this it can only get modified on server
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User Logged in successfully "
    )
  )

  //return res.json(new ApiResponse(200, user, "Logged In successfully"))
})

export const logOutUser = asyncHandler(async (req, res, next) => {
  // since we cant do {email or etc} = so we will check from milldeware that we will run from middleware 
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $set updates
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully✅"))
});

// fo rnused like res can get replaced with _

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // req.cookies.refreshToken => comming from the cookies 
  // req.body.refreshToken => comming from the mobile devices 
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required")
  }

  try {
    // Verify the incoming refresh token
    const decode = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    // Find the user
    const user = await User.findById(decode._id);

    if(!user || user.refreshToken !== incomingRefreshToken){
      throw new ApiError(403, "Invalid refresh token")
    }
     // ✅ OPTION 1: Use your utility function (recommended)
     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

     // ✅ OPTION 2: Or call individual methods directly
     // const accessToken = user.generateAccessToken();
     // const refreshToken = user.generateRefreshToken();
     // user.refreshToken = refreshToken;
     // await user.save({ validateBeforeSave: false });
 

    user.refreshToken = refreshToken;
    const options = {
      httpOnly: true,
      secure: true
    }

    await user.save()

   
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      accessToken,
      refreshToken
    } , "Access token refreshed"))
    
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token")
  }
})