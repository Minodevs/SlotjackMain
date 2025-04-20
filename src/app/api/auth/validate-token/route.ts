import { NextRequest, NextResponse } from 'next/server';

// Configure API options for static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const data = await req.json();
    const { token } = data;
    
    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would validate the token
    // For static export demo purposes, we'll simulate validation
    
    // Example valid tokens for demo purposes
    const validTokens = [
      'example-reset-token',
      'valid-token-example',
      '123456789abcdef',
      'test-reset-token'
    ];
    
    const isValid = validTokens.includes(token);
    
    return NextResponse.json({
      success: true,
      isValid,
      message: isValid 
        ? 'Token is valid' 
        : 'Token is invalid or has expired'
    });
  } catch (error) {
    console.error('Error in validate-token API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 