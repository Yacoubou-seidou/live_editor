// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('A user connected.');

  // Listen for code updates from a client
  socket.on('code-update', (code) => {
    // Broadcast the code update to all connected clients
    socket.broadcast.emit('receive-code', code);
  });

  // Listen for cursor position updates
  socket.on('cursor-position', (position) => {
    // Broadcast the cursor position to all connected clients
    socket.broadcast.emit('receive-cursor-position', position);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
