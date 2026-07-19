// Lib — Rate limiting basique en mémoire (par IP)
// Pour production : remplacer par @upstash/ratelimit + Redis pour multi-instance

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requêtes / minute par IP sur les routes /api/generate

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, newEntry);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

// Nettoyage périodique (toutes les 5 min)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(ip);
    }
  }, 5 * 60 * 1000).unref?.();
}
