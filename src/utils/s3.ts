// @ts-nocheck
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 service object
const s3 = new AWS.S3();

// Validate file type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Generate a random filename to prevent collisions
const generateUniqueFilename = (originalname: string) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// Create date-based folder structure (YYYY/MM/DD)
const getDateBasedFolder = () => {
  const now = new Date();
  const year = now.getFullYear();
  // Months are 0-indexed in JS, so +1 for human-readable format
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// Configure multer for S3 uploads
export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || 'cosmo-photos',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = getDateBasedFolder();
      const filename = generateUniqueFilename(file.originalname);
      cb(null, `${folder}/${filename}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB in bytes
  },
  fileFilter: fileFilter
});

// Generate a signed URL for an S3 object
export const getSignedUrl = (key: string): string => {
  const bucketName = process.env.AWS_BUCKET_NAME || 'cosmo-photos';
  return s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: key,
    Expires: 60 * 60 * 24 * 7 // 7 days in seconds
  });
};

// Generate a public URL for an S3 object
export const getPublicUrl = (key: string): string => {
  const bucketName = process.env.AWS_BUCKET_NAME || 'cosmo-photos';
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};