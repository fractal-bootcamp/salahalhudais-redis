import { getRedisClient } from '../client';
import { CacheOptions } from '../types';

export async function setCache<T>(key: string, data: T, options: CacheOptions = {}) {
  const { expirationInSeconds = 3600 } = options;
  const client = await getRedisClient();
  await client.set(key, JSON.stringify(data), { EX: expirationInSeconds });
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

export async function deleteCache(key: string): Promise<boolean> {
  const client = await getRedisClient();
  const result = await client.del(key);
  return result > 0;
}

export async function cacheExists(key: string): Promise<boolean> {
  const client = await getRedisClient();
  const result = await client.exists(key);
  return result === 1;
}