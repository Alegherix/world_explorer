import http from 'http';
import { Server } from 'socket.io';
import {
  IConnected,
  IStateUpdate,
  SocketEvent,
} from '../../src/shared/interfaces';
import GameServer from './GameServer';
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const port = process.env.PORT || 8000;

const gameServer = new GameServer(io);

io.on('connection', (socket) => {
  socket.on('userConnected', (message: IConnected) => {
    gameServer.addSocket(socket, message.username);
    gameServer.broadcastIncomingUser(socket, message.username);
  });

  socket.on('disconnect', () => {
    console.log('Recived a disconnect event from ', socket.id);

    gameServer.removeSocket(socket.id);
  });

  socket.on(SocketEvent.UPDATE_STATE, (state: IStateUpdate) => {
    gameServer.updateState(socket.id, state);
  });
});

httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
