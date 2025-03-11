// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { getRedisSubscriber } from './src/server/redis/client.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Socket.IO setup
  const io = new Server(server);
  
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Get a dedicated subscriber client
  const redisSubscriber = await getRedisSubscriber();
  
  // Redis subscription
  await redisSubscriber.subscribe('click-updates');
  
  redisSubscriber.on('message', (channel, message) => {
    if (channel === 'click-updates' && typeof message === 'string') {
      try {
        io.emit('click-update', JSON.parse(message));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  });

  // Use a different port if 3000 is in use
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});