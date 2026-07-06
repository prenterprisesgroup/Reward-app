const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fileType = require('file-type');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file, folder = 'reward-app/profile-photos') => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const publicId = `${timestamp}-${randomString}`;

    // Verify magic number using file-type
    const type = await fileType.fromBuffer(file.buffer);
    if (!type || !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type.mime)) {
      throw new Error('Spoofed file detected. Invalid binary signature.');
    }

    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: folder,
      public_id: publicId,
      transformation: [
        { width: 300, height: 300, crop: 'fill', quality: 'auto' }
      ],
      resource_type: 'image'
    });

    return result.secure_url;
  } catch (error) {
    throw new Error('Failed to upload image to Cloudinary');
  }
};

module.exports = { upload, uploadToCloudinary };
