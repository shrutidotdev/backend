import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        fs.unlinkSync(localFilePath)

        console.log("file is uploaded on cloudinary ", response.url);
        console.log("✅ Cloudinary Upload Successful");
        console.log("📦 Response:", response);
        console.log("📁 Local File Path:", localFilePath);
        console.log("🌐 Uploaded URL:", response.secure_url);


        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.error("❌ Cloudinary Upload Failed", error);
        return null;
    }
}



export { uploadOnCloudinary }