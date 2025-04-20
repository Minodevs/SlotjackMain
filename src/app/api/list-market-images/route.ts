import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Configure API options for static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // For static export, return a fixed list of images
    // In a real app, this would read from the filesystem or database
    const demoImages = [
      '/market/item1.png',
      '/market/item2.png',
      '/market/item3.png',
      '/market/badge1.png',
      '/market/badge2.png',
      '/market/profile-frame1.png',
      '/market/vip-card.png',
      '/market/special-ticket.png',
    ];
    
    return NextResponse.json({
      success: true,
      images: demoImages
    });
  } catch (error) {
    console.error('Error in list-market-images API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 