import { NextRequest, NextResponse } from 'next/server';

// For static export, use Edge runtime
export const runtime = 'edge';
export const dynamic = 'error';

// Static list of images for the market
const STATIC_IMAGES = [
  '/market-img/sterlinbet.png',
  '/market-img/siribet.png',
  '/market-img/risebet 20$.png',
  '/market-img/Risebet 10$.png',
  '/market-img/zlot 1000t.png',
  '/market-img/baywin.png'
];

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/list-market-images - Retrieving static image list');
    
    // Return the static list - no filesystem operations required
    return NextResponse.json({ 
      images: STATIC_IMAGES,
      count: STATIC_IMAGES.length
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'Pragma': 'cache',
        'Expires': '31536000'
      }
    });
  } catch (error) {
    console.error('Error listing market images:', error);
    return NextResponse.json({ 
      error: 'Failed to list market images', 
      images: [] 
    }, { status: 500 });
  }
} 