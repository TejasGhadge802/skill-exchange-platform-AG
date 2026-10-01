const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const setupChatSocket = require('./sockets/chatHandler');
const { setIO } = require('./services/notificationService');

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configure services & handlers
setIO(io);
setupChatSocket(io);

// Connect DB & Start Server
const startServer = async () => {
  await connectDB();

  server.listen(config.port, () => {
    console.log(`[Server] Skill Exchange API running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[Server] Health Check available at http://localhost:${config.port}/api/v1/health`);
  });
};

startServer().catch(err => {
  console.error('[Fatal Server Startup Error]:', err);
});

module.exports = { app, server, io };

