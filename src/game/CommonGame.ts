import { Vec3 } from 'cannon';
import type { IGamePiece } from '../shared/interfaces';
import type Loader from './utils/Loader';
import type Material from './utils/Materials';
import ThirdPersonCamera from './utils/ThirdPersonCamera';

abstract class CommonGame {
  protected currentGamePiece: IGamePiece;

  constructor(
    protected scene: THREE.Scene,
    protected world: CANNON.World,
    protected loader: Loader,
    protected material: Material,
    protected camera: THREE.PerspectiveCamera,
    protected gameCamera: ThirdPersonCamera
  ) {
    this.scene = scene;
    this.world = world;
    this.loader = loader;
    this.material = material;
    this.gameCamera = new ThirdPersonCamera(camera);
  }

  steer(event: KeyboardEvent) {
    if (this.currentGamePiece.body.sleepState === 2)
      this.currentGamePiece.body.wakeUp();

    // Needs to cast to unknown then to Vec3, due to type constraints, the conversion is as intended.
    switch (event.key) {
      case 'w':
        this.currentGamePiece.body.applyForce(
          new Vec3(0, 0, -250),
          this.currentGamePiece.body.position
        );
        break;

      case 'a':
        this.currentGamePiece.body.applyForce(
          new Vec3(-500, 0, 0),
          this.currentGamePiece.body.position
        );
        break;

      case 's':
        this.currentGamePiece.body.applyForce(
          new Vec3(0, 0, 250),
          this.currentGamePiece.body.position
        );
        break;

      case 'd':
        this.currentGamePiece.body.applyForce(
          new Vec3(250, 0, 0),
          this.currentGamePiece.body.position
        );
        break;

      case ' ':
        this.currentGamePiece.body.applyForce(
          new Vec3(0, 2500, 0),
          this.currentGamePiece.body.position
        );
        break;
    }
  }

  // Run all game related Logic inside here
  runGameLoop() {
    this.gameCamera.update();
  }
}

export default CommonGame;
