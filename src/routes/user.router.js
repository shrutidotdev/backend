import { Router } from "express";
import { loginUser, logOutUser, registerUser } from "../controllers/user.controller.js";
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
router.route("/logout").post(verifyJwt , logOutUser)
export default router;



// upload.single => to upload 1 file
// upload.array => to upload multiple files under one field
// upload.fields => to upload different files in diffrent fields
// upload.none() => Accept text-only form (error if upload any files)
// upload.any() => Accept any number of files from any field( use carefully )