import { Server, Socket } from 'socket.io';
import {
  IPosition,
  IStateUpdate,
  SocketEvent,
} from '../../src/shared/interfaces';

interface IActivePlayer {
  username: string;
  id: string;
  socket: Socket;
  position: IPosition;
  velocity: IPosition;
}

class GameServer {
  private sockets: Map<string, IActivePlayer>;
  private TICK_RATE = 15;
  private elapsedTime: number;
  private server: Server;
  private syncronizedTime: number;

  constructor(server: Server) {
    this.sockets = new Map();
    this.elapsedTime = new Date().getTime();
    this.server = server;
  }

  // Adds socket to constructor
  addSocket(socket: Socket, username: string) {
    console.log(username + ' has connected to the server');
    const defaultPosition: IPosition = { x: 0, y: 5, z: 0 };
    const velocity: CANNON.Vec3 = null;
    this.sockets.set(socket.id, {
      username,
      id: socket.id,
      socket,
      position: defaultPosition,
      velocity,
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

  removeSocket(id: string) {
    this.sockets.delete(id);
    this.server.sockets.emit(SocketEvent.USER_DISCONNECTED, id);
  }

  updateState(id: string, { position, velocity }: IStateUpdate) {
    const player = this.sockets.get(id);
    player.position = position;
    player.velocity = velocity;
    this.broadcastStateUpdates();
  }

  // // Broadcasts state updates every 30ms, and only if >1 player on server
  private broadcastStateUpdates() {
    const currentTime = new Date().getTime();
    if (
      currentTime > this.elapsedTime + this.TICK_RATE &&
      this.sockets.size > 1
    ) {
      const updateArray: Partial<IActivePlayer>[] = [];
      this.sockets.forEach((player) => {
        const { socket, ...rest } = player;
        updateArray.push(rest);
      });
      this.server.sockets.emit(SocketEvent.UPDATE_STATE, updateArray);
      this.elapsedTime = currentTime;
    }
  }
}

export default GameServer;
