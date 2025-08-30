const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const tbl_item = require('../models/Item').default;
const { SwapRequest } = require('../models/Item');

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught Exception:', error.message);
  console.log('   Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('   Server will continue running...');
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Start server immediately without waiting for MongoDB
app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket-io',
    // Performance optimizations
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
  });

  io.on('connection', (socket) => {
    socket.on('join', (room) => socket.join(room));
  });

  // Global broadcaster API via process events
  process.on('emit-event', ({ event, payload, room }) => {
    if (room) io.to(room).emit(event, payload);
    else io.emit(event, payload);
  });

  // Start server immediately
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log('> Socket.IO server ready');
  });

  // Initialize MongoDB change streams in background (non-blocking)
  const uri = process.env.MONGODB_URL;
  if (uri) {
    // Check if we're in a development environment with local MongoDB
    const isLocalDev = uri.includes('localhost') || uri.includes('127.0.0.1');
    
    if (isLocalDev) {
      console.log('⚠️  MongoDB change streams disabled for local development (requires replica set)');
      console.log('   Real-time updates will not work, but the app will function normally');
      return;
    }

    // Initialize change streams in background
    setTimeout(() => {
      try {
        const itemStream = tbl_item.watch();
        itemStream.on('change', (change) => {
          if (change.operationType === 'insert') {
            io.emit('item:created', { id: String(change.documentKey._id) });
          } else if (change.operationType === 'update' || change.operationType === 'replace') {
            io.emit('item:updated', { id: String(change.documentKey._id) });
          } else if (change.operationType === 'delete') {
            io.emit('item:deleted', { id: String(change.documentKey._id) });
          }
        });

        const swapStream = SwapRequest.watch();
        swapStream.on('change', (change) => {
          if (change.operationType === 'insert') {
            io.emit('swap:created', { id: String(change.documentKey._id) });
          } else if (change.operationType === 'update' || change.operationType === 'replace') {
            io.emit('swap:updated', { id: String(change.documentKey._id) });
          } else if (change.operationType === 'delete') {
            io.emit('swap:deleted', { id: String(change.documentKey._id) });
          }
        });
        
        console.log('✅ MongoDB change streams enabled for real-time updates');
      } catch (e) {
        console.warn('⚠️  Change streams unavailable:', e?.message || e);
        console.log('   Real-time updates will not work, but the app will function normally');
      }
    }, 1000); // Delay by 1 second to not block server startup
  }
});


