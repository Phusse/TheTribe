import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 image string to Cloudinary and returns the secure URL.
 * Includes optional aggressive compression for avatars/thumbnails to save bandwidth.
 */
export const uploadImageToCloudinary = async (
  base64String: string,
  folder: string = "thetribe"
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "image",
      quality: "auto:eco",
      fetch_format: "auto",
      width: 1200, // Maximum reasonable width
      crop: "limit",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload image file");
  }
};
