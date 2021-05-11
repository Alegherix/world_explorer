import type * as CANNON from 'cannon-es';

export interface IGamePiece {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  movementType?: IMovementType;
  // move?: (movementType: IMovementType, estimatedTime: number) => number;
}
export type VecIntersection = THREE.Vector3 | CANNON.Vec3;

export interface IMovementType {
  start: 'cos' | 'sin';
  distance: number;
  positionOffset: number;
  speed: number;
  direction: 'x' | 'y' | 'z';
}

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

export type GameWorld = 'Morghol' | 'Velknaz' | 'Zetxaru';

export interface ISkybox {
  createSkybox(path: string, extension: string);
}

// This is the same as in the socket server, can't rly share
// Since they won't share same hosting and codebase in prod
export interface ISocketMessage {
  msg: 'currentUsers' | 'connected' | 'update';
}

export type Update = { username: string; position: IPosition };

export interface ICurrentUsers extends ISocketMessage {
  users: string[];
}

export interface IConnected extends ISocketMessage {
  username: string;
}

export interface IUpdate extends ISocketMessage {
  update: Update[];
}
