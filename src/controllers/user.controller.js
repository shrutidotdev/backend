import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
  return res.status(201).json(new ApiResponse(201, createUser, "User registered successfully✅"))
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

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(403, "Invalid refresh token")
    }
    // ✅ OPTION 1: Use your utility function (recommended)
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // ✅ OPTION 2: Or call individual methods directly
    // const accessToken = user.generateAccessToken();
    // const refreshToken = user.generateRefreshToken();
    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });


    //user.refreshToken = refreshToken;
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
      }, "Access token refreshed"))

  } catch (error) {
    throw new ApiError(401, "Invalid refresh token")
  }
})

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  // SInce this action can be only perrformed when the user is logged in => req.user?._id is comming from middleware auth
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordMatch(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password")
  }

  user.password = newPassword

  await user.save({ validateBeforeSave: false })

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.find(req.user)

  return res.status(200).json(200, user, "User info fetched successfully")
})


export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email, username } = req.body
  if (!fullname || !email || !username) {
    throw new ApiError(400, "All fields are required")
  }

  const updatedInfoUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email,
        username
      }
    },
    // new : true ==> Means that the updates info is going to be returned
    { new: true }
  ).select("-password")

  return res.status(200).json(new ApiResponse(200, updatedInfoUser, "Account details updated Successfully✅"))
})

export const updateAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath)
    if (!newAvatar) {
      throw new ApiError(401, "Error while uploading the avatar file")
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: newAvatar.url
        }
      },
      { new: true }
    ).select("-password")

    return res.status(200).json("Successfully updated the avatar file ✅")
  } catch (error) {
    throw new ApiError(400, error, "Something went wrong while uploading the image")
  }

});
// req.file = {
//   fieldname: 'avatar',
//   originalname: 'photo.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: './uploads',
//   filename: 'avatar-123456.jpg',
//   path: './uploads/avatar-123456.jpg',  // ← This is a STRING
//   size: 12345
// }
export const updateCoverImage = asyncHandler(async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image file is missing")
    }

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!newCoverImage) {
      throw new ApiError(401, "Error while uploading the cover file")
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: newCoverImage.url
        }
      },
      { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, "Successfully updated the Cover Image file ✅"))

  } catch (error) {
    throw new ApiError(400, error, "Something went wrong while uploading the image")
  }

})

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing")
  }
  // aggreation pipeline it always return arrays => Process and transform  data in stages> Used for Filtering , Grouping , Sorting , Joining Collections , etc.
  // Each stage the pipeline transforms the data and passess to next stage
  // |  STAGE     | PURPOSE                                       |
  // | `$match`   | Filter documents (like `find()`)              |
  // | `$group`   | Group documents and perform aggregations      |
  // | `$sort`    | Sort the results                              |
  // | `$project` | Reshape each document (select/modify fields)  |
  // | `$limit`   | Limit the number of documents                 |
  // | `$skip`    | Skip a number of documents                    |
  // | `$lookup`  | Join with another collection (like SQL join)  |
  // | `$unwind`  | Deconstruct an array field into multiple docs |

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      // subscriptions because in db it gets saved in plural and lowercase
      $lookup: {
        from: "subscriptions", // Look in the "subscriptions" table database
        localField: "_id", // userId ("userId67")
        foreignField: "channel", // Match where "channel = userId67"
        as: "subscribers" //Store results in "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    // Above we collected all the fields now it's time to create one doc for this
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])
  console.log(channel)
  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exits")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User channel fetched successfully✅")
    )
})

export const getWatchHistory = asyncHandler(async (req, res) => {
  // aggregation pipeline
  const user = await User.aggregate([  
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        // From where to lookup
        from: "videos",
        // field name
        localField: "watchHistory",
        foreignField: "_id",
        // call it by 
        as: "watchHistory",
        // Subpipeline -Now im inside of videos
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "videos",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
    200,
    user[0].watchHistory ,
    "Watch history fetched successfully✅"
  ))
})