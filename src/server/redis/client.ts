import { createClient } from 'redis';

// Environment variables for configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Singleton pattern to reuse connection
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    client = createClient({ url: redisUrl });
    
    client.on('error', (err) => console.error('Redis Client Error', err));
    
    await client.connect();
  }
  
  return client;
}