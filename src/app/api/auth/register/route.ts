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
    const { email, password, name } = data;
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would register the user
    // For static export demo purposes, we'll just return a simulated success
    
    return NextResponse.json({
      success: true,
      user: {
        id: 'new-user-id',
        email,
        name,
      },
      message: 'Registration successful. You can now log in.'
    });
  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 