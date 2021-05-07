import type * as CANNON from 'cannon-es';

export interface IGamePiece {
  mesh: THREE.Mesh;
  body: CANNON.Body;
}
export type VecIntersection = THREE.Vector3 | CANNON.Vec3;

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
