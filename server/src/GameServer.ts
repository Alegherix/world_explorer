import { IPosition, SocketEvent } from '../../src/shared/interfaces';
import { v4 } from 'uuid';
import { Socket } from 'socket.io';

interface IActivePlayer {
  username: string;
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
      socket,
      position: defaultPosition,
    });
  }

  broadcastIncomingUser(incomingSocket: Socket, username: string) {
    incomingSocket.broadcast.emit(SocketEvent.USER_CONNECTED, username);

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

  removeSocket(id: string) {
    this.sockets.delete(id);
  }
}

export default GameServer;
