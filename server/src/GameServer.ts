import { IPosition, SocketEvent } from '../../src/shared/interfaces';
import { v4 } from 'uuid';
import { Socket, Server } from 'socket.io';

interface IActivePlayer {
  username: string;
  id: string;
  socket: Socket;
  position: IPosition;
}

class GameServer {
  private sockets: Map<string, IActivePlayer>;
  private TICK_RATE = 30;

  constructor() {
    this.sockets = new Map();
  }

  // Adds socket to constructor
  addSocket(socket: Socket, username: string) {
    console.log(username + ' has connected to the server');
    const defaultPosition: IPosition = { x: 0, y: 5, z: 0 };
    this.sockets.set(socket.id, {
      username,
      id: socket.id,
      socket,
      position: defaultPosition,
    });
  }

  broadcastIncomingUser(incomingSocket: Socket, username: string) {
    incomingSocket.broadcast.emit(SocketEvent.USER_CONNECTED, {
      username,
      id: incomingSocket.id,
    });

    const currentUsersArray: Partial<IActivePlayer>[] = [];
    this.sockets.forEach((activePlayer) => {
      const { socket, ...rest } = activePlayer;
      if (incomingSocket.id !== socket.id) currentUsersArray.push(rest);
    });

    if (currentUsersArray.length > 0) {
      // Send only to the given client
      console.log('Sending currentUsers to newly connected client');
      incomingSocket.emit(SocketEvent.CURRENT_USERS, currentUsersArray);
    }
  }

  removeSocket(io: Server, id: string) {
    this.sockets.delete(id);
    io.sockets.emit(SocketEvent.USER_DISCONNECTED, id);
  }
}

export default GameServer;
