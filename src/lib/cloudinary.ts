import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadImage(file: string, folder: string = 'tilago') {
  return cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
}

export async function uploadVideo(file: string, folder: string = 'tilago/videos') {
  return cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'video',
  });
}
