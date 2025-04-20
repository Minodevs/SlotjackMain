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
    const { email, password } = data;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would authenticate the user
    // For static export demo purposes, we'll just return a simulated success
    
    return NextResponse.json({
      success: true,
      user: {
        id: 'example-user-id',
        email,
        name: 'Demo User',
      },
      token: 'example-auth-token'
    });
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 