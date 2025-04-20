import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Edge runtime is compatible with static export
export const runtime = 'edge';
export const dynamic = 'error';

// Supabase table name for market items
const MARKET_ITEMS_TABLE = 'market_items';

/**
 * POST handler for updating image URLs with cache busting parameters
 */
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/market/items/image-refresh - Refreshing image URLs');
    
    // Get request body
    const body = await req.json();
    const { id, imageUrl } = body;
    
    if (!id || !imageUrl) {
      console.error('Invalid request: Missing item ID or imageUrl', body);
      return NextResponse.json(
        { error: 'Item ID and imageUrl are required' },
        { status: 400 }
      );
    }
    
    console.log(`Refreshing image URL for item ID: ${id}, Current image: ${imageUrl}`);
    
    // Generate a new URL with cache busting parameter
    const timestamp = Date.now();
    let newImageUrl = imageUrl;
    
    // Remove any existing timestamp
    if (imageUrl.includes('?t=')) {
      newImageUrl = imageUrl.split('?t=')[0];
    }
    
    // Add new timestamp
    newImageUrl = `${newImageUrl}?t=${timestamp}`;
    
    // Initialize Supabase client
    const supabase = await createServerClient();
    
    // Update the image URL in the database
    const { data, error } = await supabase
      .from(MARKET_ITEMS_TABLE)
      .update({ imageUrl: newImageUrl })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating image URL in database:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update image URL',
          details: error.message
        },
        { status: 500 }
      );
    }
    
    console.log('Image URL updated successfully:', data?.[0]);
    
    return NextResponse.json({ 
      success: true,
      message: 'Image URL updated with cache busting parameter',
      item: data?.[0] || null,
      newImageUrl
    });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/market/items/image-refresh:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
} 