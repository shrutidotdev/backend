import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✅" : "❌"
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        // File uploaded successfully, remove local file
        console.log("File is uploaded on Cloudinary Successfully", response, response.url)
        return response;
        
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message || error);
        
        // Remove local file even if upload failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new Error("Cloudinary upload failed");
    }
};

export { uploadOnCloudinary };