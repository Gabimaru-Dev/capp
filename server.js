const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let chatHistory = {};
let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setUsername', (username) => {
    socket.username = username;
    onlineUsers.push(username);
    io.emit('onlineUsers', onlineUsers);
  });

  socket.on('joinChat', (chatName) => {
    socket.join(chatName);

    if (chatHistory[chatName]) {
      socket.emit('chatHistory', chatHistory[chatName]);
    }
  });

  socket.on('sendMessage', (data) => {
    const { chat, message, sender } = data;

    if (!chatHistory[chat]) chatHistory[chat] = [];
    chatHistory[chat].push({ sender, message });

    io.to(chat).emit('receiveMessage', { sender, message, chat });
  });

  socket.on('typing', (data) => {
    socket.to(data.chat).emit('typing', data);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers = onlineUsers.filter(u => u !== socket.username);
      io.emit('onlineUsers', onlineUsers);
    }
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});