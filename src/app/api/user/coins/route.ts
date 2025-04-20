import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { addTransaction } from '@/services/TransactionsService';

// Supabase table name for user profiles
const PROFILES_TABLE = 'profiles';

/**
 * GET handler to retrieve a user's current coin balance
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = await createServerClient();
    
    // Authenticate the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Retrieve the user profile
    const { data: profile, error } = await supabase
      .from(PROFILES_TABLE)
      .select('id, jackPoints, lastUpdated')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user coins' },
        { status: 500 }
      );
    }
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: profile.id,
      jackPoints: profile.jackPoints,
      lastUpdated: profile.lastUpdated
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/user/coins:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to update a user's coin balance
 */
export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    
    // Validate request body
    if (!body.userId || typeof body.amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. Required fields: userId, amount' },
        { status: 400 }
      );
    }
    
    const { userId, amount, description, type } = body;
    
    // Create a Supabase client
    const supabase = await createServerClient();
    
    // Check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('jackPoints, name, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate new balance
    const currentPoints = userData.jackPoints || 0;
    const newPoints = currentPoints + amount;
    
    // Don't allow negative balance
    if (newPoints < 0) {
      return NextResponse.json(
        { error: 'Insufficient coins balance' },
        { status: 400 }
      );
    }
    
    // Update user's jackPoints
    const { error: updateError } = await supabase
      .from('users')
      .update({ jackPoints: newPoints })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user coins:', updateError);
      return NextResponse.json(
        { error: 'Failed to update coins balance' },
        { status: 500 }
      );
    }
    
    // Create transaction record
    try {
      await addTransaction({
        userId,
        userEmail: userData.email,
        userName: userData.name || userData.email.split('@')[0],
        amount,
        description: description || (amount > 0 ? 'Coins added' : 'Coins spent'),
        timestamp: Date.now(),
        type: type || (amount > 0 ? 'earn' : 'spend')
      });
    } catch (txError) {
      console.error('Error creating transaction record:', txError);
      // Continue execution - don't block the update due to transaction recording failure
    }
    
    return NextResponse.json({
      success: true,
      previousBalance: currentPoints,
      newBalance: newPoints,
      difference: amount
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/user/coins:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 