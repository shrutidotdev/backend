import { Router } from "express";
import {
    loginUser, logOutUser, refreshAccessToken, registerUser, changePassword,
    getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

// secured route => verifyJwt middleware whicch runs because of next() to run forward to logOutUser
router.route("/logout").post(verifyJwt, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").patch(verifyJwt, changePassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar)
router.route("/coverImage").patch(verifyJwt, upload.single("coverImage"), updateCoverImage)
// bcuz we have used req.params
router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
router.route("/history").get(verifyJwt, getWatchHistory)
export default router;



// upload.single => to upload 1 file
// upload.array => to upload multiple files under one field
// upload.fields => to upload different files in diffrent fields
// upload.none() => Accept text-only form (error if upload any files)
// upload.any() => Accept any number of files from any field( use carefully )