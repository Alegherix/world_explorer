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

export interface IClientUpdate extends IConnected {
  position: IPosition;
}

export interface ITorusDimension {
  radius: number;
  tube: number;
  radialSegments: number;
  tubularSegments: number;
  arc: number;
}
