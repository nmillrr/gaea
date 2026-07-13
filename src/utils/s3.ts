import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';

// Local/dev S3-compatible storage (MinIO from docker-compose) when S3_ENDPOINT is set
const s3Endpoint = process.env.S3_ENDPOINT
  ? `${process.env.S3_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.S3_ENDPOINT}:${process.env.S3_PORT || 9000}`
  : undefined;

// multer-s3 v3 requires an AWS SDK v3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(s3Endpoint
    ? {
        endpoint: s3Endpoint,
        forcePathStyle: true, // MinIO requires path-style URLs
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
          secretAccessKey: process.env.S3_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin'
        }
      }
    : {})
});

const bucketName = () =>
  process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET || process.env.MINIO_BUCKET_NAME || 'cosmo-photos';

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
    bucket: bucketName(),
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

// Generate a public URL for an S3 object
export const getPublicUrl = (key: string): string => {
  if (s3Endpoint) {
    // Path-style URL served by MinIO
    return `${s3Endpoint}/${bucketName()}/${key}`;
  }
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName()}.s3.${region}.amazonaws.com/${key}`;
};
