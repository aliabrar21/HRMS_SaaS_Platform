import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.APP_URL,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  logger.info(`API server started on port ${port}`);
});
