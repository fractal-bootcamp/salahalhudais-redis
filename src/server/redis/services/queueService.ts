// Define a queue for click processing
// Add tasks to the queue
// process tasks from the queue
import { getRedisClient } from '../client';

export async function enqueueClick(userId: string) {
  const client = await getRedisClient();
  const clickData = JSON.stringify({ userId, timestamp: Date.now() });
  await client.lpush('click:queue', clickData);
}


