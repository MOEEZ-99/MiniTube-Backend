import { v2 as cloudinary} from "cloudinary";
// import cloudinary from "cloudinary"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config();


cloudinary.config({ 
  cloud_name: 'dxfpufccy', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


 
 export const uploadOnCloudinary = async (filePath) => { 
  const result = await cloudinary.uploader.upload(
            filePath,
            {
                resource_type: "auto", 
                public_id: "my_dog",
                overwrite: true, 
                notification_url: "https://mysite.example.com/notify_endpoint"
            }
        );

    const deleteFile = await fs.unlink(filePath, (error) => {
      console.log(`File ${filePath} deleted successfully.`);
      console.log("C:",error)
    })
      return result;
  }



export const deleteCloudinary = async (path) => {
  try {
    const result = await cloudinary.uploader.destroy(path);
    console.log("Deleted old image on cloudinary: ", result);
    return result;
  } catch (err) {
    console.error("Error deleting old image on cloudinary: ", err);
  }
};