import type { IPosition } from './../../shared/interfaces';
import type { IGamePiece } from '../../shared/interfaces';
import { Vector, Vector3 } from 'three';

class ThirdPersonCamera {
  currentPosition: Vector3;
  currentLookingAtPostion: Vector3;
  gamePiece: IGamePiece;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  currentCameraState: number;
  cameraStates: IPosition[];

  constructor(private camera: THREE.Camera) {
    this.camera = camera;
    this.currentPosition = new Vector3();
    this.currentLookingAtPostion = new Vector3();
    this.rotationX = 0;
    this.rotationY = 70;
    this.rotationZ = 140;
    this.currentCameraState = 0;

    this.cameraStates = [
      {
        x: 0,
        y: 70,
        z: 140,
      },
      {
        x: 90,
        y: 70,
        z: 50,
      },
      {
        x: 0,
        y: 70,
        z: -90,
      },

      {
        x: -90,
        y: 70,
        z: 50,
      },
    ];

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'r') {
        console.log(this.getWorldDirection());

        if (this.currentCameraState >= this.cameraStates.length - 1) {
          this.currentCameraState = 0;
        } else {
          this.currentCameraState++;
        }
      }
    });
  }

  setTracking(gamepiece: IGamePiece) {
    this.gamePiece = gamepiece;
  }

  getCameraAngel(x: number, y: number, z: number): Vector3 {
    return new Vector3(x, y, z).add(this.gamePiece.mesh.position);
  }

  getWorldDirection() {
    return this.camera.getWorldDirection(new Vector3());
  }

  update() {
    const offset = this.getCameraAngel(
      this.cameraStates[this.currentCameraState].x,
      this.cameraStates[this.currentCameraState].y,
      this.cameraStates[this.currentCameraState].z
    );
    const lookingAt = this.getCameraAngel(0, 10, 50);

    const lerpTime = 0.05;

    this.currentPosition.lerp(offset, lerpTime);
    this.currentLookingAtPostion.lerp(lookingAt, lerpTime);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookingAtPostion);
  }
}
export default ThirdPersonCamera;
