import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request: NextRequest) {
  if (!request.cookies.has('user-id')) {
    const response = NextResponse.next();
    
    response.cookies.set('user-id', uuidv4(), {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'strict'
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/clicks', '/'],
};