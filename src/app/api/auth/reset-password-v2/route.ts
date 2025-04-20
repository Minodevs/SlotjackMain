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
    const { token, password } = data;
    
    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Verify the token is valid and not expired
    // 2. Update the user's password in the database
    // For static export demo purposes, we'll just return a simulated success
    
    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 