import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs';

// Configure the API route for app router
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout
export const fetchCache = 'force-no-store';

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'market-img');
  try {
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log('Created upload directory:', uploadDir);
    }
    return uploadDir;
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    throw new Error('Failed to access or create upload directory');
  }
}

/**
 * Generate a unique filename for an uploaded file
 */
function generateUniqueFilename(file: File) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
  return `${timestamp}-${randomString}-${safeName}`;
}

/**
 * POST - Upload a new image
 */
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/upload/market-images - Uploading new image');
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file found in form data');
      return NextResponse.json({ 
        success: false,
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json({ 
        success: false,
        error: 'File must be an image' 
      }, { status: 400 });
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Create upload directory if it doesn't exist
    const uploadDir = await ensureUploadDir();
    
    // Generate a unique filename
    const filename = generateUniqueFilename(file);
    
    // Convert the file to a buffer
    console.log('Converting file to buffer');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`Buffer created, size: ${buffer.length}`);
    
    // Save the file
    const filePath = path.join(uploadDir, filename);
    console.log(`Saving file to: ${filePath}`);
    
    try {
      await writeFile(filePath, buffer);
      console.log('File saved successfully');
    } catch (writeError: any) {
      console.error('Error writing file:', writeError);
      return NextResponse.json({ 
        success: false,
        error: `Failed to write file: ${writeError.message}` 
      }, { status: 500 });
    }
    
    // Return the path to the saved file (relative to public directory)
    const fileUrl = `/market-img/${filename}`;
    console.log(`File saved, returning URL: ${fileUrl}`);
    
    return NextResponse.json({ 
      success: true,
      fileUrl,
      message: 'Image uploaded successfully'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to upload file', 
      details: error.message || String(error)
    }, { status: 500 });
  }
}

/**
 * PUT - Update an existing image by replacing it
 */
export async function PUT(req: NextRequest) {
  try {
    console.log('PUT /api/upload/market-images - Updating existing image');
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const oldImageUrl = formData.get('oldImageUrl') as string;
    
    console.log(`Old image URL: ${oldImageUrl || 'none provided'}`);
    
    if (!file) {
      console.error('No file found in form data');
      return NextResponse.json({ 
        success: false,
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json({ 
        success: false,
        error: 'File must be an image' 
      }, { status: 400 });
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Create upload directory if it doesn't exist
    const uploadDir = await ensureUploadDir();
    
    // Generate a unique filename
    const filename = generateUniqueFilename(file);
    
    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save the new file
    const filePath = path.join(uploadDir, filename);
    console.log(`Saving new file to: ${filePath}`);
    
    try {
      await writeFile(filePath, buffer);
      console.log('New file saved successfully');
    } catch (writeError: any) {
      console.error('Error writing file:', writeError);
      return NextResponse.json({ 
        success: false,
        error: `Failed to write file: ${writeError.message}` 
      }, { status: 500 });
    }
    
    let oldFileDeleted = false;
    
    // Try to delete old file if it exists and is not a default image
    if (oldImageUrl && 
        typeof oldImageUrl === 'string' && 
        oldImageUrl.startsWith('/market-img/') && 
        !oldImageUrl.includes('default') && 
        !oldImageUrl.includes('placeholder')
    ) {
      try {
        // Clean up any query parameters
        const cleanOldImageUrl = oldImageUrl.split('?')[0];
        
        const oldFilePath = path.join(process.cwd(), 'public', cleanOldImageUrl.replace(/^\//, ''));
        console.log(`Attempting to delete old file: ${oldFilePath}`);
        
        if (fs.existsSync(oldFilePath)) {
          await unlink(oldFilePath);
          console.log(`Deleted old image: ${oldFilePath}`);
          oldFileDeleted = true;
        } else {
          console.log(`Old file does not exist: ${oldFilePath}`);
        }
      } catch (deleteError) {
        console.error('Failed to delete old image:', deleteError);
        // Continue anyway, we don't want to fail the upload if deletion fails
      }
    }
    
    // Return the path to the saved file (relative to public directory)
    const fileUrl = `/market-img/${filename}`;
    console.log(`File saved, returning URL: ${fileUrl}`);
    
    return NextResponse.json({ 
      success: true,
      fileUrl,
      oldFileDeleted,
      message: 'Image updated successfully'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('Error processing image update:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update image', 
      details: error.message || String(error)
    }, { status: 500 });
  }
} 