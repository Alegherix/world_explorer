import { IPosition } from '../../src/shared/interfaces';
import { v4 } from 'uuid';

interface IActivePlayer {
  username: string;
  position: IPosition;
}

class GameServer {
  private sockets: Map<string, IActivePlayer>;
  private TICK_RATE = 30;

  constructor() {
    this.sockets = new Map();
  }

  addSocket(socket: string) {
    const id = v4();
    const defaultPosition: IPosition = { x: 0, y: 5, z: 0 };
    this.sockets.set(id, { username: 'anonymous', position: defaultPosition });
  }
}
