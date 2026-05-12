/**
 * Upload Middleware
 * Multer + Cloudinary for image uploads
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Cloudinary storage for auction images
const auctionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bidsphere/auctions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bidsphere/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

// Upload instances
const uploadAuctionImages = multer({
  storage: auctionStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).array('images', 5); // Up to 5 images

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('profileImage');

module.exports = { uploadAuctionImages, uploadProfileImage };
