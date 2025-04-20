import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// The table name in Supabase
const TRANSACTIONS_TABLE = 'transactions';

/**
 * POST endpoint to bulk add transactions
 * This is primarily used for migration
 */
export async function POST(request: NextRequest) {
  console.log('Bulk transactions API called');
  
  try {
    const supabase = await createClient();
    
    // Parse transaction data from request body
    const body = await request.json();
    const transactions = body.transactions || [];
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.error('Invalid request body: transactions array is empty or not provided');
      return NextResponse.json(
        { error: 'transactions array is required' }, 
        { status: 400 }
      );
    }
    
    console.log(`Received ${transactions.length} transactions for bulk insert`);
    
    // Insert transactions in batches
    const batchSize = 50;
    let insertedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + Math.min(batchSize, transactions.length - i));
      console.log(`Processing batch ${i + 1} to ${i + batch.length} of ${transactions.length}`);
      
      try {
        const { data, error } = await supabase
          .from(TRANSACTIONS_TABLE)
          .insert(batch)
          .select('id');
        
        if (error) {
          console.error('Error inserting batch:', error);
          errorCount += batch.length;
        } else {
          console.log(`Successfully inserted ${data.length} transactions`);
          insertedCount += data.length;
        }
      } catch (batchError) {
        console.error('Batch insert failed:', batchError);
        errorCount += batch.length;
      }
    }
    
    console.log(`Bulk insert completed: ${insertedCount} succeeded, ${errorCount} failed`);
    
    return NextResponse.json({
      success: true,
      count: insertedCount,
      errors: errorCount,
      message: `Successfully processed ${insertedCount} transactions with ${errorCount} errors`
    });
  } catch (error) {
    console.error('Unhandled error in bulk transactions endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process transactions',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 