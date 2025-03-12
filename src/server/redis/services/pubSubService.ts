// server.ts
import { createServer, IncomingMessage } from 'http';
import { parse, UrlWithParsedQuery } from 'url';
import { Server } from 'socket.io';
import { getRedisClient } from '../client';

// Extend global to include our Redis publisher
declare global {
  var redisPublisher: Awaited<ReturnType<typeof getRedisClient>> | null;
}

const dev = process.env.NODE_ENV !== 'production';

/**
 * Publishes a message to a Redis channel
 * @param channel The Redis channel to publish to
 * @param message The message to publish (will be JSON stringified)
 */
export async function publishMessage(channel: string, message: any): Promise<void> {
  const client = await getRedisClient();
  await client.publish(channel, JSON.stringify(message));
}

/**
 * Creates a dedicated subscriber client for Redis pub/sub
 * Note: In Redis pub/sub, a client that subscribes to a channel
 * enters a special mode and can't be used for other commands
 */
export async function createSubscriber() {
  // Create a dedicated Redis client for subscriptions
  const Redis = (await import('ioredis')).default;
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const subscriber = new Redis(redisUrl);
  
  subscriber.on('error', (err) => {
    // Convert the error to a string before logging
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Redis Subscriber Error:', errorMessage);
  });
  
  return subscriber;
}

function handle(req: IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage> & { req: import("http").IncomingMessage; }, parsedUrl: UrlWithParsedQuery) {
  throw new Error('Function not implemented.');
}
