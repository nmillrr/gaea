// @ts-nocheck
import sharp from 'sharp';
import { Buffer } from 'buffer';
import path from 'path';

interface GpsData {
  latitude: number | null;
  longitude: number | null;
}

export async function processImage(buffer: Buffer, originalname: string): Promise<{ 
  buffer: Buffer; 
  gpsData: GpsData;
  format: string;
}> {
  try {
    // Get image metadata including EXIF
    const metadata = await sharp(buffer).metadata();
    
    // Extract GPS data if available
    const gpsData = extractGpsFromExif(metadata);
    
    // Determine output format based on input
    const format = getOutputFormat(originalname, metadata);
    
    // Process the image to strip metadata and optimize
    const processedBuffer = await sharp(buffer)
      .withMetadata(false) // Strip all metadata
      .toFormat(format as any) // Convert to the determined format
      .toBuffer();
      
    return {
      buffer: processedBuffer,
      gpsData,
      format
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

function extractGpsFromExif(metadata: sharp.Metadata): GpsData {
  const gpsData = {
    latitude: null,
    longitude: null
  };
  
  try {
    // EXIF data is stored in metadata.exif
    if (metadata.exif) {
      // Parse EXIF buffer to extract GPS coordinates
      // This is a simplified approach; a real implementation would use
      // exif-parser or similar libraries to extract exact GPS data
      
      // For simplicity in this demo, we're assuming GPS data isn't directly
      // accessible through Sharp alone. In a real app, you would use
      // exifr or exif-parser libraries to properly extract this data.
      
      // In a production app, the below code would be replaced with proper
      // EXIF GPS extraction
    }
    
    return gpsData;
  } catch (error) {
    console.error('Error extracting GPS data:', error);
    return gpsData;
  }
}

function getOutputFormat(originalname: string, metadata: sharp.Metadata): string {
  // Default to jpeg if we can't determine the format
  let format = 'jpeg';
  
  // Try to determine from metadata
  if (metadata.format) {
    format = metadata.format;
  } else {
    // Try to determine from file extension
    const ext = path.extname(originalname).toLowerCase();
    if (ext === '.png') format = 'png';
    else if (ext === '.gif') format = 'gif';
    else if (ext === '.webp') format = 'webp';
    // Default to jpeg for other formats
  }
  
  return format;
}