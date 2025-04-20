import { NextRequest, NextResponse } from 'next/server';

// Configure API options for static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // For static export, return demo market items
    const demoItems = [
      {
        id: '1',
        name: 'Gold Badge',
        description: 'A premium profile badge',
        price: 1000,
        type: 'badge',
        image: '/market/badge1.png',
      },
      {
        id: '2',
        name: 'VIP Card',
        description: 'Access VIP features for 30 days',
        price: 5000,
        type: 'subscription',
        image: '/market/vip-card.png',
      },
      {
        id: '3',
        name: 'Special Ticket',
        description: 'Entry to special tournaments',
        price: 2500,
        type: 'ticket',
        image: '/market/special-ticket.png',
      },
    ];
    
    return NextResponse.json({
      success: true,
      items: demoItems
    });
  } catch (error) {
    console.error('Error in market items API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get request data for creating a new item
    const data = await req.json();
    const { name, description, price, type, image } = data;
    
    // Validate input
    if (!name || !price || !type) {
      return NextResponse.json(
        { error: 'Name, price, and type are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would create a new item in the database
    // For static export demo purposes, we'll simulate success
    
    return NextResponse.json({
      success: true,
      message: 'Item created successfully',
      item: {
        id: 'new-item-' + Date.now(),
        name,
        description,
        price,
        type,
        image: image || '/market/default.png',
      }
    });
  } catch (error) {
    console.error('Error in create market item API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 