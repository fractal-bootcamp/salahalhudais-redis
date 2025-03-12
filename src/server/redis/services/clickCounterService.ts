// Increment global counter in redis
// Ad click events to a queue
// retreive the current count
import { getRedisClient } from '../client';

export async function recordClick(userId: string) {
  const client = await getRedisClient();
  
  // Add to queue for analytics/processing
  const clickData = JSON.stringify({
    userId,
    timestamp: Date.now()
  });
  await client.lPush('clicks:queue', clickData);
  
  // Increment the global counter
  return await client.incr('clicks:counter');
}

export async function getClickCount() {
  const client = await getRedisClient();
  const count = await client.get('clicks:counter');
  return parseInt(count || '0', 10);
}


export async function processClickBatch(batchSize = 10) {
  const client = await getRedisClient();
  const processed = [];
  
  for (let i = 0; i < batchSize; i++) {
    const click = await client.rPop('clicks:queue');
    if (!click) break;
    
    processed.push(JSON.parse(click));
  }
  
  return processed;
}