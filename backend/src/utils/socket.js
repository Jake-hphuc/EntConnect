const { Server } = require('socket.io');

let io;

/**
 * Initialize Socket.io server.
 * @param {http.Server} server - Node http server.
 * @param {string} clientUrl - Allowed client origin.
 * @returns {Server} io instance
 */
const initSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // Join generic room (if needed)
    socket.on('join_room', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.join(roomId);
        console.log(`📡 Socket ${socket.id} joined room: ${roomId}`);
      }
    });

    // Join personal user room for notifications
    socket.on('join_user', (data) => {
      const { userId } = data;
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`🔔 Socket ${socket.id} joined personal room: user_${userId}`);
      }
    });

    // Real‑time chat message handling
    socket.on('send_message', (data) => {
      const { roomId, text, sender, userId } = data;
      io.to(roomId).emit('receive_message', {
        roomId,
        text,
        sender,
        userId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      console.log('🔥 User disconnected');
    });
  });

  return io;
};

/**
 * Get the initialized io instance.
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Emit an event to a specific user (personal room).
 * @param {string|ObjectId} userId
 * @param {string} event
 * @param {any} payload
 */
const emitToUser = (userId, event, payload) => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  io.to(`user_${userId}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitToUser };
