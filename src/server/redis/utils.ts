import { getRedisClient } from './client';

export async function cacheData<T>(key: string, data: T, expirationInSeconds = 3600) {
  const client = await getRedisClient();
  await client.set(key, JSON.stringify(data), { EX: expirationInSeconds });
}

export async function getCachedData(key: string) {
  const client = await getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}


export async function rateLimit(identifier: string, limit: number, windowInSeconds: number) {
  const client = await getRedisClient();
  const key = `ratelimit:${identifier}`;
  
  const current = await client.get(key) || 0;
  
  if (Number(current) >= limit) {
    return false;
  }
  
  await client.incr(key);
  if (current === 0) {
    await client.expire(key, windowInSeconds);
  }
  
  return true; 
}