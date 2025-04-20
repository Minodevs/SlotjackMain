import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// For static export, we'll use edge runtime
export const runtime = 'edge';
export const dynamic = 'error';

// Supabase table name for market items
const MARKET_ITEMS_TABLE = 'market_items';

/**
 * POST handler to delete market items
 */
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/market/items/delete - Starting deletion process');
    
    // Parse request body to get ID
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      console.error('No item ID provided in request body');
      return NextResponse.json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }
    
    console.log(`Attempting to delete item with ID: ${id}`);
    
    // Delete from Supabase
    try {
      console.log('Connecting to Supabase...');
      const supabase = await createClient();
      
      // First check if the item exists
      const { data: existingItem, error: checkError } = await supabase
        .from(MARKET_ITEMS_TABLE)
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking if item exists:', checkError);
        throw new Error(`Database query error: ${checkError.message}`);
      }
      
      if (!existingItem) {
        console.log(`Item with ID ${id} not found in database`);
        // Return success anyway since the end result is what the user wanted
        return NextResponse.json({
          success: true,
          message: 'Item not found, nothing to delete',
          id
        });
      }
      
      // Delete the item
      const { error: deleteError } = await supabase
        .from(MARKET_ITEMS_TABLE)
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting item:', deleteError);
        throw new Error(`Failed to delete item: ${deleteError.message}`);
      }
      
      console.log(`Successfully deleted item with ID: ${id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Item deleted successfully',
        id
      });
    } catch (supabaseError) {
      console.error('Database operation failed:', supabaseError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to delete item from database',
        details: supabaseError instanceof Error ? supabaseError.message : String(supabaseError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error processing delete request:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process deletion request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 