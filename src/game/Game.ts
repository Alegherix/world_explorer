import { Vec3 } from 'cannon';
import type { IGamePiece, ISkybox } from '../shared/interfaces';
import type Loader from './utils/Loader';
import type Material from './utils/Materials';
import ThirdPersonCamera from './utils/ThirdPersonCamera';
import * as THREE from 'three';
import type { Vector3 } from 'three';
import CANNON from 'cannon';

abstract class CommonGame implements ISkybox {
  protected currentGamePiece: IGamePiece;
  protected activeGamePieces: IGamePiece[] = [];
  protected gamePieceTexture: THREE.Texture;
  protected gameCamera: ThirdPersonCamera;

  constructor(
    protected scene: THREE.Scene,
    protected world: CANNON.World,
    protected loader: Loader,
    protected material: Material,
    protected camera: THREE.PerspectiveCamera,
    protected playerTextureName: string,
    protected skyboxFolderName: string,
    protected skyboxExtension: string
  ) {
    this.scene = scene;
    this.world = world;
    this.loader = loader;
    this.material = material;
    this.gameCamera = new ThirdPersonCamera(camera);
    this.gamePieceTexture = this.loader
      .getTextureLoader()
      .load(`textures/playerTextures/${playerTextureName}`);
    this.createSkybox(skyboxFolderName, skyboxExtension);

    window.addEventListener('keydown', this.steer.bind(this));
  }

  abstract createGameMap();

  abstract createFinishZone();

  abstract createStartingZone();

  createSkybox(path: string, extension: string) {
    const cubeLoader = this.loader.getCubeTextureLoader();
    const texture = cubeLoader.load([
      `textures/skybox/${path}/px${extension}`,
      `textures/skybox/${path}/nx${extension}`,
      `textures/skybox/${path}/py${extension}`,
      `textures/skybox/${path}/ny${extension}`,
      `textures/skybox/${path}/pz${extension}`,
      `textures/skybox/${path}/nz${extension}`,
    ]);
    this.scene.background = texture;
  }

  createPlayer() {
    const startPosition = { x: 0, y: 150, z: 0 };
    const mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 64, 64),
      new THREE.MeshStandardMaterial({ map: this.gamePieceTexture })
    );
    mesh.castShadow = true;
    mesh.position.copy(startPosition as Vector3);

    // Create the physics object to match the mesh object
    const boxShape = new CANNON.Sphere(5);
    const body = new CANNON.Body({
      mass: 1,
      position: new Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material.getIceMaterial(),
    });
    body.position.copy(startPosition as Vec3);

    // Add entities to the world
    this.scene.add(mesh);
    this.world.addBody(body);
    this.currentGamePiece = { mesh, body };
    this.gameCamera.setTracking(this.currentGamePiece);
    this.activeGamePieces.push(this.currentGamePiece);
  }

  // Steer the currently controlled GamePiece
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

  // Creates the physical plane boundry of a Plane
  createBoundry(x1, y1, z1, x2, y2, z2, rotation, floorShape) {
    const body = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: this.material.getRockMaterial(),
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(x1, y1, z1), rotation);
    body.position = new Vec3(x2, y2, z2);
    this.world.addBody(body);
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number) {
    this.gameCamera.update();

    for (const gamePiece of this.activeGamePieces) {
      gamePiece.mesh.position.copy(
        (gamePiece.body.position as unknown) as Vector3
      );
      gamePiece.mesh.quaternion.copy(
        (gamePiece.body.quaternion as unknown) as THREE.Quaternion
      );
    }
    this.world.step(1 / 100, timeDelta);
  }
}

export default CommonGame;
