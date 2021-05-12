// import express from 'express';
// const app = express();
// import http from 'http';
// const server = http.createServer();
// import { Server } from 'socket.io';
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   },
// });
import http from 'http';
import { Server } from 'socket.io';
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('userConnected', (message) => {
    console.log(message);
    io.emit('userConnected', message);
  });
});

httpServer.listen(8000, () => {
  console.log('Listening on http://localhost:8000');
});
