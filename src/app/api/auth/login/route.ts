import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addTransaction } from '@/services/TransactionsService';

/**
 * POST /api/auth/login
 * Handle user login
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    const { email, password } = await request.json();
    
    // For demo purposes, any login succeeds
    // In a real app, you would validate the credentials
    
    // Create a mock user
    const user = {
      id: uuidv4(),
      email,
      name: email.split('@')[0],
      jackPoints: 1000
    };
    
    // Create a login transaction to test transaction system
    try {
      console.log('Creating login transaction in API for user:', user);
      const transaction = await addTransaction({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount: 25,
        description: 'Login bonus (API)',
        timestamp: Date.now(),
        type: 'bonus'
      });
      console.log('Transaction created successfully:', transaction);
    } catch (txError) {
      console.error('Failed to create login transaction in API:', txError);
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      user,
      token: `mock-token-${uuidv4()}`
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication failed' 
      },
      { status: 401 }
    );
  }
} 