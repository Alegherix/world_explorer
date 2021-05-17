export interface IPosition {
  x: number;
  y: number;
  z: number;
}

export interface IDimension {
  width: number;
  height: number;
  depth: number;
}

export enum SocketEvent {
  USER_CONNECTED = 'userConnected',
  CURRENT_USERS = 'currentUsers',
  USER_DISCONNECTED = 'userDisconnect',
  UPDATE_STATE = 'updateState',
  PLAYER_DIED = 'playerDied',
}

export interface ICurrentUsers {
  users: string[];
}

export interface IStateUpdate {
  position: IPosition;
  velocity: IPosition;
}

export interface IConnected {
  username: string;
}

export interface ICylinderDimension {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
}

// This is the same as in the socket server, can't rly share
// Since they won't share same hosting and codebase in prod
export interface ISocketMessage {
  msg: 'currentUsers' | 'connected' | 'update' | 'disconnect';
}