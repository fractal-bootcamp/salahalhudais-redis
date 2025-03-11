import { getRedisClient } from '../client';
import { CacheOptions } from '../types';

export async function setCache(key: string, data: any, options: { expirationInSeconds?: number } = {}) {
  const { expirationInSeconds = 3600 } = options;
  const client = await getRedisClient();
  
  await client.set(key, JSON.stringify(data), 'EX', expirationInSeconds);
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const data = await client.get(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error parsing cached data:', error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  const client = await getRedisClient();
  await client.del(key);
}

export async function cacheExists(key: string): Promise<boolean> {
  const client = await getRedisClient();
  const result = await client.exists(key);
  return result === 1;
}