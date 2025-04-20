import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { UserRank } from '@/types/user';

// This endpoint allows promoting a user to admin status
// Security note: In production, this should require additional authentication
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Authenticate the current user to verify they have permission
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user exists
    const { data: userToPromote, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError || !userToPromote) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      );
    }
    
    // Update the user's rank to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ rank: UserRank.ADMIN })
      .eq('email', email);

    if (error) {
      console.error('Error updating user rank:', error);
      return NextResponse.json(
        { error: 'Failed to update user rank' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been promoted to admin`
    });
  } catch (error) {
    console.error('Unexpected error in make-admin API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 