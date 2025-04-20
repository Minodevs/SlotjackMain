import { NextRequest, NextResponse } from 'next/server';

// Configure API options for static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const data = await req.json();
    const { transactions } = data;
    
    // Validate input
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Valid transactions array is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would process multiple transactions in a batch
    // For static export demo purposes, we'll simulate success
    
    const results = transactions.map((tx, index) => ({
      id: `TX-${Date.now()}-${index}`,
      status: 'success',
      originalTransaction: tx
    }));
    
    return NextResponse.json({
      success: true,
      message: `Processed ${transactions.length} transactions successfully`,
      results
    });
  } catch (error) {
    console.error('Error in bulk transactions API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 