import { NextResponse } from 'next/server';
import { getToken, deleteToken, isTokenExpired } from '@/utils/resetTokens';

export async function GET(request: Request) {
  // Validate token endpoint
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token parametresi gereklidir' },
      { status: 400 }
    );
  }

  // Check if token exists
  const tokenData = getToken(token);
  if (!tokenData) {
    return NextResponse.json(
      { valid: false, error: 'Geçersiz token' },
      { status: 200 }
    );
  }

  // Check if token has expired
  if (isTokenExpired(tokenData)) {
    // Remove expired token
    deleteToken(token);
    return NextResponse.json(
      { valid: false, error: 'Token süresi dolmuş' },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { valid: true, email: tokenData.email },
    { status: 200 }
  );
} 