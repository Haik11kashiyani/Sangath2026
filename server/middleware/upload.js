import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  // CLOUDINARY_URL is automatically picked up from process.env if present
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype && file.mimetype.startsWith('video/');
    if (isVideo) {
      return {
        folder: 'sangath/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'webm', 'ogg', 'mov']
      };
    }
    return {
      folder: 'sangath/images',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1920, crop: 'limit' }, { fetch_format: 'webp', quality: 85 }]
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm|ogg|mov)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF images and MP4, WebM, OGG, MOV videos are allowed.'), false);
  }
};

const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 30 * 1024 * 1024 // 30MB max limit
};

export const upload = multer({ storage, fileFilter, limits });

export const optimizeImage = async (filePath) => {
  return filePath;
};
