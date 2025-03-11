// Increment global counter in redis
// Ad click events to a queue
// retreive the current count
import { getRedisClient } from '../client';
import { publishMessage } from './pubSubService';

const CLICK_COUNT_KEY = 'clicks:counter';
const CLICK_QUEUE_KEY = 'clicks:queue';

export async function recordClick(userId: string): Promise<number> {
  const client = await getRedisClient();
  
  // Add to queue for analytics/processing
  const clickData = JSON.stringify({
    userId,
    timestamp: Date.now()
  });
  await client.lpush(CLICK_QUEUE_KEY, clickData);
  
  // Increment the global counter
  const newCount = await client.incr(CLICK_COUNT_KEY);
  
  // Publish update to Redis channel
  await publishMessage('click-updates', {
    count: newCount,
    userId
  });
  
  return newCount;
}

export async function getClickCount(): Promise<number> {
  const client = await getRedisClient();
  const count = await client.get(CLICK_COUNT_KEY);
  return parseInt(count || '0', 10);
}

export async function processClickBatch(batchSize = 10) {
  const client = await getRedisClient();
  const processed = [];
  
  for (let i = 0; i < batchSize; i++) {
    const click = await client.rpop(CLICK_QUEUE_KEY);
    if (!click) break;
    
    processed.push(JSON.parse(click));
    // Do additional processing here if needed
  }
  
  return processed;
}