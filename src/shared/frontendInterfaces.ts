import type * as CANNON from 'cannon-es';
import type { IPosition } from './interfaces';

export interface IGamePiece {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  movementType?: IMovementType;
}
export type VecIntersection = THREE.Vector3 | CANNON.Vec3;

export interface IMovementType {
  start: 'cos' | 'sin';
  distance: number;
  positionOffset: number;
  speed: number;
  direction: 'x' | 'y' | 'z';
}

export type GameWorld = 'Morghol' | 'Velknaz' | 'Zetxaru';

export interface ISkybox {
  createSkybox(path: string, extension: string);
}

export interface IActivePlayer {
  username: string;
  id: string;
  position: IPosition;
  velocity: IPosition;
}
