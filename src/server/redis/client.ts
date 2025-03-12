import Redis from 'ioredis';

// Environment variables for configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Separate clients for different purposes
let commandClient: Redis | null = null;
let subscriberClient: Redis | null = null;

export async function getRedisClient() {
  if (!commandClient) {
    console.log(`Connecting to Redis at ${redisUrl}`);
    commandClient = new Redis(redisUrl);
    
    commandClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    
    commandClient.on('connect', () => {
      console.log('Connected to Redis');
    });
    
    // Test the connection
    try {
      await commandClient.ping();
      console.log('Redis connection test successful');
    } catch (error) {
      console.error('Redis connection test failed:', error);
      commandClient = null;
      throw error;
    }
  }
  
  return commandClient;
}

export async function getRedisSubscriber() {
  if (!subscriberClient) {
    console.log(`Connecting to Redis Subscriber at ${redisUrl}`);
    subscriberClient = new Redis(redisUrl);
    
    subscriberClient.on('error', (err) => {
      console.error('Redis Subscriber Error', err);
    });
    
    subscriberClient.on('connect', () => {
      console.log('Connected to Redis Subscriber');
    });
  }
  
  return subscriberClient;
}