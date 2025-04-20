import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// The table name in Supabase
const TRANSACTIONS_TABLE = 'transactions';

/**
 * GET endpoint to fetch all transactions
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Parse query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 100;
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
    const type = url.searchParams.get('type');
    
    // Build query
    let query = supabase
      .from(TRANSACTIONS_TABLE)
      .select('*')
      .order('timestamp', { ascending: false });
    
    // Apply filters if provided
    if (userId) {
      query = query.eq('userId', userId);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' }, 
        { status: 500 }
      );
    }
    
    // Return transactions
    return NextResponse.json({
      transactions: data,
      meta: {
        page,
        limit,
        total: count,
        hasMore: data.length === limit,
      }
    });
  } catch (error) {
    console.error('Error handling transaction request:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to add a new transaction
 */
export async function POST(request: Request) {
  try {
    console.log('POST /api/transactions - Starting request processing');
    const supabase = await createClient();
    
    // Parse transaction data from request body
    const transactionData = await request.json();
    console.log('Transaction data received:', transactionData);
    
    // Validate required fields
    if (!transactionData.userId || !transactionData.userEmail || !transactionData.amount === undefined || 
        !transactionData.type || !transactionData.description) {
      console.error('Missing required fields in transaction data:', transactionData);
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Add timestamp if not provided
    if (!transactionData.timestamp) {
      transactionData.timestamp = Date.now();
    }
    
    console.log('Inserting transaction into Supabase:', transactionData);
    
    // Insert transaction
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .insert([transactionData])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error adding transaction to Supabase:', error);
      return NextResponse.json(
        { error: `Failed to add transaction: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    console.log('Transaction added successfully:', data);
    
    // Return the created transaction
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unhandled error in transaction POST request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 