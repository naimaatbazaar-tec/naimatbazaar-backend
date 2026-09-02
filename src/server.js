import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.io and attach it to the server with CORS support
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Real-time Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Listen for incoming live chat messages from frontend
  socket.on('send_message', (data) => {
    // Broadcast the message to all connected clients (Admin & Customer support)
    io.emit('receive_message', data);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Make io accessible globally within Express if needed via req.app.get('io')
app.set('io', io);

// Connect to Database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server with WebSockets running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});