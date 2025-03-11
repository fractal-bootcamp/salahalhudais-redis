import { NextRequest, NextResponse } from 'next/server';
import { recordClick, getClickCount } from '../../../server/redis/services/clickCounterService';
import { isRateLimited, getRemainingAttempts } from '../../../server/redis/services/rateLimitService';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';


function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function getUserId(_request: NextRequest) {
  const cookieStore = await cookies();
  let userId = cookieStore.get('user-id')?.value;
  
  if (!userId) {
    userId = uuidv4();
  }
  
  return userId;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    console.log("GET /api/clicks: Starting request");
    const count = await getClickCount();
    console.log("GET /api/clicks: Got count", count);
    return NextResponse.json({ count }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error getting click count:', error);
    // Log the full error stack
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to get click count' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get or create user ID
    const cookieStore = await cookies();
    let userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      userId = uuidv4();
    }
    
    // Check if user is rate limited
    const rateLimited = await isRateLimited(userId, {
      limit: 10,
      windowInSeconds: 10
    });
    
    if (rateLimited) {
      const remaining = await getRemainingAttempts(userId, 10);
      return NextResponse.json(
        { error: 'Rate limited', remainingAttempts: remaining },
        { status: 429, headers: corsHeaders() }
      );
    }
    
    // Record the click
    const newCount = await recordClick(userId);
    const remaining = await getRemainingAttempts(userId, 10);
    
    // Create response
    const response = NextResponse.json({ 
      count: newCount,
      remainingAttempts: remaining
    }, { headers: corsHeaders() });
    
    // Set cookie if needed
    if (!cookieStore.get('user-id')) {
      response.cookies.set('user-id', userId, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        httpOnly: true,
        sameSite: 'strict'
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error recording click:', error);
    return NextResponse.json(
      { error: 'Failed to record click' },
      { status: 500, headers: corsHeaders() }
    );
  }
}