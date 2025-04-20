import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addTransaction } from '@/services/TransactionsService';

/**
 * POST /api/auth/register
 * Handle user registration
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Register API called');
    const { email, password, name } = await request.json();
    
    // Create a mock user
    const user = {
      id: uuidv4(),
      email,
      name: name || email.split('@')[0],
      jackPoints: 500
    };
    
    // Create a registration transaction to test transaction system
    try {
      console.log('Creating registration transaction in API for user:', user);
      const transaction = await addTransaction({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount: 500,
        description: 'Registration bonus (API)',
        timestamp: Date.now(),
        type: 'bonus'
      });
      console.log('Transaction created successfully:', transaction);
    } catch (txError) {
      console.error('Failed to create registration transaction in API:', txError);
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      user,
      token: `mock-token-${uuidv4()}`
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed' 
      },
      { status: 400 }
    );
  }
} 