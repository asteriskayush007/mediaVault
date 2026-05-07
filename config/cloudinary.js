const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ── Storage for medical reports ── */
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medivault/reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  },
});

/* ── Storage for doctor credential documents ── */
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medivault/doctor-credentials',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  },
});

const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const uploadDocs = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadReport, uploadDocs };
