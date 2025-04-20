import { NextRequest, NextResponse } from 'next/server';

// Configure API options for static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // In a real implementation, this would perform some action to refresh cached images
    // For static export demo purposes, we'll just return a success message
    
    return NextResponse.json({
      success: true,
      message: 'Market item images cache has been refreshed',
      refreshed: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in image refresh API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 