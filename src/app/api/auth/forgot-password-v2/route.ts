import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { getToken, storeToken, deleteToken, isTokenExpired, ResetToken } from '@/utils/resetTokens';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Check if the user exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error || !data) {
      // Don't reveal if a user exists for security reasons
      return NextResponse.json(
        { message: 'Şifre sıfırlama talimatları belirtilen e-posta adresine gönderildi' },
        { status: 200 }
      );
    }

    // Generate token and create reset link
    const token = uuidv4();
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    // Store token (in production, this would be stored in a database)
    const now = new Date();
    const expires = new Date(now.getTime() + 3600000); // 1 hour expiration
    
    // Store the token using our function
    storeToken(token, {
      email,
      token,
      expires,
      createdAt: now
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Şifre sıfırlama talimatları belirtilen e-posta adresine gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama talebiniz işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  
  // Find the token in our in-memory store
  const resetToken = getToken(token);
  
  if (!resetToken || isTokenExpired(resetToken)) {
    if (resetToken) {
      deleteToken(token);
    }
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  
  return NextResponse.json({ 
    valid: true,
    email: resetToken.email
  });
} 