import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import type { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { ISkybox, IGamePiece } from '../shared/frontendInterfaces';
import type Loader from './utils/Loader';
import type Material from './utils/Materials';
import ThirdPersonCamera from './utils/ThirdPersonCamera';
import GameStore from '../shared/GameStore';
import type { Vec3 } from 'cannon-es';
import * as dat from 'dat.gui';

abstract class Game implements ISkybox {
  protected currentGamePiece: IGamePiece;
  protected activeGamePieces: IGamePiece[] = [];
  protected gamePieceTexture: THREE.Texture;
  protected gameCamera: ThirdPersonCamera;
  protected orbitCamera: OrbitControls;
  private gui: dat.GUI;

  constructor(
    protected scene: THREE.Scene,
    protected world: CANNON.World,
    protected loader: Loader,
    protected material: Material,
    protected camera: THREE.PerspectiveCamera,
    protected playerTextureName: string,
    protected skyboxFolderName: string,
    protected skyboxExtension: string,
    protected useOrbitCamera?: boolean
  ) {
    this.scene = scene;
    this.world = world;
    this.loader = loader;
    this.material = material;
    this.gui = new dat.GUI();
    if (this.useOrbitCamera) {
      this.orbitCamera = new OrbitControls(
        this.camera,
        document.querySelector('canvas')
      );
    } else {
      this.gameCamera = new ThirdPersonCamera(camera);
    }

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

  createPlayer(name?: string) {
    const startPosition = { x: -1300, y: 380, z: -1200 };
    // const startPosition = { x: 490, y: 340, z: -470 };
    const mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 64, 64),
      new THREE.MeshStandardMaterial({ map: this.gamePieceTexture })
    );
    mesh.castShadow = true;
    mesh.position.copy(startPosition as Vector3);
    mesh.name = name ? name : '';
    console.log('Created mesh with name: ', mesh.name);

    // Create the physics object to match the mesh object
    const boxShape = new CANNON.Sphere(5);
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material.getIceMaterial(),
    });
    body.position.copy(startPosition as CANNON.Vec3);

    // Add entities to the world
    this.scene.add(mesh);
    this.world.addBody(body);
    this.currentGamePiece = { mesh, body };
    this.activeGamePieces.push(this.currentGamePiece);
    if (!this.useOrbitCamera)
      this.gameCamera.setTracking(this.currentGamePiece);
  }

  addToWorld(gamePiece: IGamePiece) {
    this.scene.add(gamePiece.mesh);
    this.world.addBody(gamePiece.body);
    if (gamePiece.movementType) this.activeGamePieces.push(gamePiece);
  }

  //
  addToGui(gamepiece: IGamePiece) {
    this.gui.add(gamepiece.mesh.position, 'x').step(1);
    this.gui.add(gamepiece.mesh.position, 'y').step(1);
    this.gui.add(gamepiece.mesh.position, 'z').step(1);
    this.camera.position.set(
      gamepiece.mesh.position.x,
      gamepiece.mesh.position.y,
      gamepiece.mesh.position.z
    );
    this.camera.lookAt(gamepiece.mesh.position);
  }

  rewspawnIfDead(limit: number = -50) {
    if (this.currentGamePiece.mesh.position.y <= limit) {
      this.currentGamePiece.body.position.set(
        (0.5 - Math.random()) * 400,
        150,
        (0.5 - Math.random()) * 400
      );
      this.currentGamePiece.body.angularVelocity.set(0, 0, 0);
      this.currentGamePiece.body.velocity.set(0, 0, 0);
    }
  }

  // Used to move a gamepiece
  move = (gamePiece: IGamePiece, estimatedTime: number): void => {
    if (!gamePiece.movementType) {
      gamePiece.mesh.position.copy(
        gamePiece.body.position as unknown as Vector3
      );
      gamePiece.mesh.quaternion.copy(
        gamePiece.body.quaternion as unknown as THREE.Quaternion
      );
    } else {
      const { start, distance, speed, positionOffset, direction } =
        gamePiece.movementType;
      const movement =
        start === 'sin'
          ? Math.sin(estimatedTime * speed) * distance + positionOffset
          : Math.cos(Math.PI / 2 + estimatedTime * speed) * distance +
            positionOffset;

      switch (direction) {
        case 'x':
          gamePiece.mesh.position.x = movement;
          gamePiece.body.position.x = movement;
          break;
        case 'y':
          gamePiece.mesh.position.y = movement;
          gamePiece.body.position.y = movement;
          break;

        case 'z':
          gamePiece.mesh.position.z = movement;
          gamePiece.body.position.z = movement;
          break;
      }
    }
  };

  rotate = (gamePiece: IGamePiece, estimatedTime: number): void => {
    if (!gamePiece.movementType) {
      gamePiece.mesh.position.copy(
        gamePiece.body.position as unknown as Vector3
      );
      gamePiece.mesh.quaternion.copy(
        gamePiece.body.quaternion as unknown as THREE.Quaternion
      );
    } else {
      const { distance, speed, positionOffset, direction } =
        gamePiece.movementType;
      const movement =
        Math.sin(estimatedTime * speed) * distance + positionOffset;

      switch (direction) {
        case 'x':
          gamePiece.mesh.rotation.x = movement;
          break;
        case 'y':
          gamePiece.mesh.rotation.y = movement;
          break;

        case 'z':
          gamePiece.mesh.rotation.z = movement;
          break;
      }
      gamePiece.body.quaternion.copy(
        gamePiece.mesh.quaternion as unknown as CANNON.Quaternion
      );
    }
  };

  // Steer the currently controlled GamePiece
  steer(event: KeyboardEvent) {
    const { x, z } = this.gameCamera.getWorldDirection();
    const force = 120;

    switch (event.key) {
      case 'w':
        this.currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * x, 0, z * force),
          this.currentGamePiece.body.position
        );
        break;

      case 'a':
        this.currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * z, 0, force * -x),
          this.currentGamePiece.body.position
        );
        break;

      case 's':
        this.currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * -x, 0, force * -z),
          this.currentGamePiece.body.position
        );
        break;

      case 'd':
        this.currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * -z, 0, force * x),
          this.currentGamePiece.body.position
        );
        break;

      case ' ':
        this.currentGamePiece.body.applyForce(
          new CANNON.Vec3(0, 2500, 0),
          this.currentGamePiece.body.position
        );
        break;

      case 'x':
        this.currentGamePiece.body.applyImpulse(
          new CANNON.Vec3(force * x * 0.8, 0, z * force * 0.8),
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
    body.position = new CANNON.Vec3(x2, y2, z2);
    this.world.addBody(body);
  }

  // Used for keeping score of how long a game have been running
  updatePlaytime(elapsedTime: number) {
    GameStore.update((store) => {
      return { ...store, elapsedTime };
    });
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();

    for (const gamePiece of this.activeGamePieces) {
      gamePiece.mesh.position.copy(
        gamePiece.body.position as unknown as Vector3
      );
      gamePiece.mesh.quaternion.copy(
        gamePiece.body.quaternion as unknown as THREE.Quaternion
      );
    }
    this.world.step(1 / 100, timeDelta);
  }
}

export default Game;
