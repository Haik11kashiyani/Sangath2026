import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  // CLOUDINARY_URL is automatically picked up from process.env if present
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sangath',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1920, crop: 'limit' }, { fetch_format: 'webp', quality: 85 }]
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
};

export const upload = multer({ storage, fileFilter, limits });

export const optimizeImage = async (filePath) => {
  // Cloudinary handles optimization on the fly via the transformation params above.
  // We just return the filePath (which is already the Cloudinary URL).
  return filePath;
};
