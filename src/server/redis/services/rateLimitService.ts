import { getRedisClient } from '../client';
import { RateLimitOptions } from '../types';


// to dos:
// Identify users uniquely

// Enforce 10 clicks per 10 seconds rules
// Return appropriate response when rate limit is exceeded

function getRateLimitKey(identifier: string): string {
  return `ratelimit:${identifier}`;
}

export async function isRateLimited(
  identifier: string,
  options: RateLimitOptions
): Promise<boolean> {
  const { limit, windowInSeconds } = options;
  const client = await getRedisClient();
  const key = getRateLimitKey(identifier);
  
  const current = await client.get(key) || 0;
  
  if (Number(current) >= limit) {
    return true; // Rate limited
  }
  
  await client.incr(key);
  if (Number(current) === 0) {
    await client.expire(key, windowInSeconds);
  }
  
  return false; // Not rate limited
}

export async function getRemainingAttempts(
  identifier: string,
  limit: number
): Promise<number> {
  const client = await getRedisClient();
  const key = getRateLimitKey(identifier);
  
  const current = await client.get(key) || 0;
  return Math.max(0, limit - Number(current));
}

export async function resetRateLimit(identifier: string): Promise<void> {
  const client = await getRedisClient();
  await client.del(getRateLimitKey(identifier));
}