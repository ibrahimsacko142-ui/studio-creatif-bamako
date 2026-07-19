// Middleware Next.js — Rate limiting global sur les routes /api/generate
// Anti-abus pour le plan gratuit

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export function middleware(req: NextRequest) {
  // Appliquer seulement sur les routes de génération IA
  if (!req.nextUrl.pathname.startsWith('/api/generate')) {
    return NextResponse.next();
  }

  const ip = getClientIP(req);
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Réessaie dans 1 minute.',
        retry_after: Math.ceil((resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetAt),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '10');
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(resetAt));
  return response;
}

export const config = {
  matcher: ['/api/generate/:path*'],
};
