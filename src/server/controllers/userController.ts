// src/server/controllers/userController.ts
import { getCache, setCache } from '../redis/services/cacheService';
import { isRateLimited } from '../redis/services/rateLimitService';

export async function getUserProfile(userId: string) {
  const cacheKey = `user:${userId}:profile`;
  const cachedProfile = await getCache(cacheKey);
  
  if (cachedProfile) {
    return cachedProfile;
  }
  const profile = await fetchUserProfileFromDB(userId);
  
  await setCache(cacheKey, profile, { expirationInSeconds: 300 }); // Cache for 5 minutes
  
  return profile;
}

async function fetchUserProfileFromDB(userId: string) {
  return { id: userId, name: 'Example User' };
}

export async function attemptLogin(username: string, ip: string) {
  const isLimited = await isRateLimited(`login:${ip}`, {
    limit: 5,  // 5 attempts
    windowInSeconds: 300 // in 5 minutes
  });
  
  if (isLimited) {
    throw new Error('Too many login attempts. Please try again later.');
  }
}