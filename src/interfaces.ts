export interface IGamePiece {
  mesh: THREE.Mesh;
  body: CANNON.Body;
}

export interface IPosition {
  x: number;
  y: number;
  z: number;
}
