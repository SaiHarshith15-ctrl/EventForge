const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

// Attach Socket.io for real-time notifications, check-in feeds, and live dashboards
const io = initSocket(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`EventForge API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
