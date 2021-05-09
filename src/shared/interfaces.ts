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
