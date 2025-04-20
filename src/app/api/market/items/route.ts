import { NextRequest, NextResponse } from 'next/server';
import { MarketItem, MARKET_ITEMS_STORAGE_KEY } from '@/types/market';
import { cookies } from 'next/headers';

// We'll use runtime edge to handle cookie access without static export issues
export const runtime = 'edge';
export const dynamic = 'error';

// Default items as fallback
function getDefaultItems(): MarketItem[] {
  return [
    { 
      id: '1', 
      name: 'Sterlinbet 1000₺', 
      points: 3500,
      category: 'betting',
      description: 'Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Sterlinbet kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: '/market-img/sterlinbet.png',
      stock: -1,
      featured: true,
      virtual: true,
    },
    { 
      id: '2', 
      name: 'Siribet 1000₺', 
      points: 3500,
      category: 'betting',
      description: 'Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Siribet kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: '/market-img/siribet.png',
      stock: -1,
      featured: true,
      virtual: true,
    },
    { 
      id: '3', 
      name: 'Risebet 20$', 
      points: 3000,
      category: 'betting',
      description: 'Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Risebet kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: '/market-img/risebet 20$.png',
      stock: -1,
      featured: true,
      virtual: true,
    },
    { 
      id: '4', 
      name: 'Risebet 10$', 
      points: 2500,
      category: 'betting',
      description: 'Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Risebet kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: '/market-img/Risebet 10$.png',
      stock: -1,
      featured: false,
      virtual: true,
    },
    { 
      id: '5', 
      name: 'Zlot 1000₺', 
      points: 3500,
      category: 'betting',
      description: 'Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Zlot kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: '/market-img/zlot 1000t.png',
      stock: -1,
      featured: true,
      virtual: true,
    },
    { 
      id: '6', 
      name: 'Baywin 1000₺', 
      points: 3500,
      category: 'betting',
      description: 'Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Baywin kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: '/market-img/baywin.png',
      stock: -1,
      featured: true,
      virtual: true,
    }
  ];
}

// Helper to retrieve items from cookie/localStorage
function getMarketItemsFromCookie(): MarketItem[] {
  try {
    const cookieStore = cookies();
    const marketItemsCookie = cookieStore.get(MARKET_ITEMS_STORAGE_KEY);
    
    if (marketItemsCookie?.value) {
      const items = JSON.parse(marketItemsCookie.value);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
    
    return getDefaultItems();
  } catch (error) {
    console.error('Error reading market items from cookie:', error);
    return getDefaultItems();
  }
}

/**
 * GET - Retrieve all market items
 */
export async function GET(request: NextRequest) {
  console.log('GET /api/market/items');
  
  try {
    const items = getMarketItemsFromCookie();
    
    return NextResponse.json({ 
      success: true, 
      items
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching market items:', error);
    
    // Return default items on error
    return NextResponse.json({ 
      success: true, 
      items: getDefaultItems(),
      source: 'defaults',
      error: error instanceof Error ? error.message : String(error)
    }, { 
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * POST - Create or update all market items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request: items array is required' 
      }, { status: 400 });
    }
    
    // Set cookie with items
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    cookies().set({
      name: MARKET_ITEMS_STORAGE_KEY,
      value: JSON.stringify(items),
      expires: Date.now() + oneWeek,
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Market items updated successfully',
      items
    });
  } catch (error) {
    console.error('Error in POST market items:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server error processing market items', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * PATCH - Update a single market item
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { item } = body;
    
    if (!item || !item.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request: item with id is required' 
      }, { status: 400 });
    }
    
    // Get current items
    const currentItems = getMarketItemsFromCookie();
    
    // Update the item in the array
    const updatedItems = currentItems.map(existing => 
      existing.id === item.id ? {...item, updatedAt: new Date().toISOString()} : existing
    );
    
    // If item doesn't exist, add it
    if (!currentItems.some(existing => existing.id === item.id)) {
      updatedItems.push({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Save updated items
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    cookies().set({
      name: MARKET_ITEMS_STORAGE_KEY,
      value: JSON.stringify(updatedItems),
      expires: Date.now() + oneWeek,
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Error in PATCH market item:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server error processing market item update', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * DELETE - Delete a market item
 */
export async function DELETE(request: NextRequest) {
  try {
    // Parse the URL to get item ID
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'No item ID provided'
      }, { status: 400 });
    }
    
    // Get current items
    const currentItems = getMarketItemsFromCookie();
    
    // Filter out the item to delete
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    // If no items were removed, the ID didn't exist
    if (updatedItems.length === currentItems.length) {
      return NextResponse.json({
        success: true,
        message: 'Item not found, nothing to delete',
        id
      });
    }
    
    // Save updated items
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    cookies().set({
      name: MARKET_ITEMS_STORAGE_KEY,
      value: JSON.stringify(updatedItems),
      expires: Date.now() + oneWeek,
      path: '/'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
      id
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Unexpected error processing delete request:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process deletion request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 