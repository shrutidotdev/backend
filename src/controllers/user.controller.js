import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.models.js"

export const registerUser = asyncHandler( async ( req , res ) => {
   
   const { email, password } = req.body;
   
   if(!email || !password) {
    return new ApiResponse(400, null, "Email and password are required").send(res);
   }
    
    const existingUser = await User.findOne({ email });
    if(existingUser){
        return new ApiResponse(400, null, "User already exists").send(res);
    }    
    
})
