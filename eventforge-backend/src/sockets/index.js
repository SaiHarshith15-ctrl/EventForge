const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Real-time layer: each authenticated client joins a room keyed to their user id,
// so notify() (see utils/notify.js) can push events straight to them —
// used for live notifications, check-in counters, and dashboard updates.
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const { token } = socket.handshake.auth || {};
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(`user:${decoded.id}`);
        socket.userId = decoded.id;
      } catch (e) {
        // invalid token — socket stays connected but unauthenticated (no personal room)
      }
    }

    // Staff/organizer dashboards can join an event room for live check-in counters
    socket.on('join-event', (eventId) => {
      if (eventId) socket.join(`event:${eventId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

module.exports = { initSocket };
