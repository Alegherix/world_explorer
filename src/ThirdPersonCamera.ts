import type { IGamePiece } from './utils/interfaces';
import { Vector, Vector3 } from 'three';

class ThirdPersonCamera {
  currentPosition: Vector3;
  currentLookingAtPostion: Vector3;
  gamePiece: IGamePiece;

  constructor(private camera: THREE.Camera) {
    this.camera = camera;
    this.currentPosition = new Vector3();
    this.currentLookingAtPostion = new Vector3();
  }

  setTracking(gamepiece: IGamePiece) {
    this.gamePiece = gamepiece;
  }

  getCameraAngel(x: number, y: number, z: number): Vector3 {
    return new Vector3(x, y, z).add(this.gamePiece.mesh.position);
  }

  update() {
    const offset = this.getCameraAngel(10, 100, 200);
    const lookingAt = this.getCameraAngel(0, 10, 50);

    const lerpTime = 0.05;

    this.currentPosition.lerp(offset, lerpTime);
    this.currentLookingAtPostion.lerp(lookingAt, lerpTime);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookingAtPostion);
  }
}
export default ThirdPersonCamera;
