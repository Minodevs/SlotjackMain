import { NextRequest, NextResponse } from 'next/server';

const MARKET_ITEMS_TABLE = 'market_items';

// Configure API options for static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const data = await req.json();
    const { itemId } = data;
    
    // Validate input
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete the item from a database
    // For static export demo purposes, we'll simulate success
    
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
      itemId
    });
  } catch (error) {
    console.error('Error in delete market item API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 