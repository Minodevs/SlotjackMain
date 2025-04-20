import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getToken, deleteToken, isTokenExpired } from '@/utils/resetTokens';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    const tokenData = getToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      );
    }

    // Check if token has expired (1 hour expiry)
    if (isTokenExpired(tokenData)) {
      // Remove expired token
      deleteToken(token);
      return NextResponse.json(
        { error: 'Token süresi dolmuş, lütfen yeni bir şifre sıfırlama talebinde bulunun' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get user email from token data
    const { email } = tokenData;

    // In a real application, you'd reset the password using the auth API
    // For now, we'll just update a mock user in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        // In a real app, you would hash the password before storing
        password_hash: newPassword 
      })
      .eq('email', email);

    if (updateError) {
      console.error('Şifre güncelleme hatası:', updateError);
      return NextResponse.json(
        { error: 'Şifre sıfırlama sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    // Remove the used token
    deleteToken(token);

    return NextResponse.json(
      { message: 'Şifreniz başarıyla sıfırlandı' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

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