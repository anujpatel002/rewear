const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const tbl_item = require('../models/Item').default;
const { SwapRequest } = require('../models/Item');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket-io',
  });

  io.on('connection', (socket) => {
    socket.on('join', (room) => socket.join(room));
  });

  // Global broadcaster API via process events
  process.on('emit-event', ({ event, payload, room }) => {
    if (room) io.to(room).emit(event, payload);
    else io.emit(event, payload);
  });

  // MongoDB change streams (optional; requires replica set)
  const uri = process.env.MONGODB_URL;
  if (uri) {
    mongoose.connection.on('connected', () => {
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
      } catch (e) {
        console.warn('Change streams unavailable:', e?.message || e);
      }
    });
  }

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});


