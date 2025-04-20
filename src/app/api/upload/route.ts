import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

// Helper function to extract image dimensions (we won't use sharp in this example)
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
  try {
    // A simple function to get image dimensions from buffer
    // This is a basic approach that reads image headers to extract dimensions
    // For PNG files
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      // PNG format: width is at offset 16, height at offset 20
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    // For JPEG files
    else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      // JPEG is more complex, we'd need to parse the markers
      // This is a simplified approach that may not work for all JPEGs
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break;
        
        const marker = buffer[offset + 1];
        const size = buffer.readUInt16BE(offset + 2);
        
        // SOF0 marker (Start Of Frame)
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        
        offset += 2 + size;
      }
    }
    
    // If we couldn't determine dimensions, return null
    return null;
  } catch (error) {
    console.error('Error extracting image dimensions:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filename = `${timestamp}-${originalName}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory', error);
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Try to get image dimensions
    const dimensions = await getImageDimensions(buffer);
    
    // Save the file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return the path to the saved file (relative to public directory)
    const fileUrl = `/uploads/banners/${filename}`;
    
    return NextResponse.json({ 
      fileUrl,
      dimensions
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 