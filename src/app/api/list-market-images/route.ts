import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Path to the market images in the public directory
    const imagesDirectory = path.join(process.cwd(), 'public', 'market-img');
    
    // Check if directory exists
    if (!fs.existsSync(imagesDirectory)) {
      console.error(`Directory not found: ${imagesDirectory}`);
      return NextResponse.json({ 
        error: 'Image directory not found', 
        images: [] 
      }, { status: 404 });
    }
    
    // Read directory contents
    const files = fs.readdirSync(imagesDirectory);
    
    // Filter for image files and format paths
    const imageFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
      })
      .map(file => `/market-img/${file}`);
    
    return NextResponse.json({ 
      images: imageFiles,
      count: imageFiles.length
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error listing market images:', error);
    return NextResponse.json({ 
      error: 'Failed to list market images', 
      images: [] 
    }, { status: 500 });
  }
} 