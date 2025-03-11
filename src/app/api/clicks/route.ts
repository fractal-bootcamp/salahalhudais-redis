import { NextRequest, NextResponse } from 'next/server';
import { recordClick, getClickCount } from '@/server/redis/services/clickCounterService';
import { isRateLimited, getRemainingAttempts } from '@/server/redis/services/rateLimitService';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

async function getUserId(_request: NextRequest) {
  const cookieStore = await cookies();
  let userId = cookieStore.get('user-id')?.value;
  
  if (!userId) {
    userId = uuidv4();
  }
  
  return userId;
}

export async function GET() {
  try {
    const count = await getClickCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting click count:', error);
    return NextResponse.json(
      { error: 'Failed to get click count' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    const rateLimited = await isRateLimited(userId, {
      limit: 10,
      windowInSeconds: 10
    });
    
    if (rateLimited) {
      const remaining = await getRemainingAttempts(userId, 10);
      return NextResponse.json(
        { error: 'Rate limited', remainingAttempts: remaining },
        { status: 429 }
      );
    }
    
    // Record the click
    const newCount = await recordClick(userId);
    const remaining = await getRemainingAttempts(userId, 10);
    
    return NextResponse.json({ 
      count: newCount,
      remainingAttempts: remaining
    });
  } catch (error) {
    console.error('Error recording click:', error);
    return NextResponse.json(
      { error: 'Failed to record click' },
      { status: 500 }
    );
  }
}