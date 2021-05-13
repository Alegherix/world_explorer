/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import type { MeshStandardMaterialParameters, Vector3 } from 'three';
import * as THREE from 'three';
import type {
  IActivePlayer,
  IGamePiece,
} from '../../shared/frontendInterfaces';
import Gamestore from '../../shared/GameStore';
import { IPosition, IStateUpdate, SocketEvent } from '../../shared/interfaces';
import PlaneFactory from '../components/Plane';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import ThirdPersonCamera from '../utils/ThirdPersonCamera';
import { getDimensions, getPosition } from '../utils/utils';
import * as dat from 'dat.gui';

class MultiplayerWorld extends Game {
  private userName: string;
  private socket: Socket;
  private gui;
  private obstacleArray: IGamePiece[] = [];

  // Used for testing, and caping responses sent to the backend server.
  private counter: number = 0;
  private defaultConfig: MeshStandardMaterialParameters;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    loader: Loader,
    material: Material,
    camera: THREE.PerspectiveCamera
  ) {
    super(
      scene,
      world,
      loader,
      material,
      camera,
      'mineral.jpg',
      'space',
      '.jpg',
      true
    );
    this.gui = new dat.GUI();
    this.userName = get(Gamestore).username;
    this.socket = io('ws://localhost:8000').connect();
    // this.socket = io('https://world-explorer-backend.herokuapp.com/').connect();

    this.initializeTextures();
    this.listenForEvents();
    this.createStartingZone();
    this.addPhysicalStartingZone();
    this.createGameMap();
    this.createPlayer(this.userName);
  }

  createGameMap() {
    this.createStartJump();
    this.createPillar();
    this.createFirstObstacle();
  }

  createFinishZone() {
    throw new Error('Method not implemented.');
  }

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

  createStartJump() {
    const ramp = PlaneFactory.createPlane(
      getDimensions(400, 300, 1),
      this.material.getGlassMaterial(),
      getPosition(0, 75, -330),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUp(ramp);
    this.addToWorld(ramp);
  }

  createPillar() {
    const pillar = PlaneFactory.createPlane(
      getDimensions(60, 60, 1400),
      this.material.getAdamantineMaterial(),
      getPosition(0, -600, -1200),
      this.defaultConfig
    );
    this.addToWorld(pillar);

    const plane = PlaneFactory.createPlane(
      getDimensions(250, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(0, 100, -1200),
      this.defaultConfig
    );
    this.addToWorld(plane);

    const ramp = PlaneFactory.createPlane(
      getDimensions(250, 350, 1),
      this.material.getGlassMaterial(),
      getPosition(-277, 187, -1200),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(ramp);
    this.addToWorld(ramp);
  }

  createFirstObstacle() {
    const plane = PlaneFactory.createPlane(
      getDimensions(1000, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-928, 275, -1200),
      this.defaultConfig
    );
    this.addToWorld(plane);
    this.addToGui(plane);

    for (let index = 1; index < 3; index++) {
      const offset = index * 400;

      const trap = PlaneFactory.createPlane(
        getDimensions(250, 20, 20),
        this.material.getGlassMaterial(),
        getPosition(-300 - offset, 287, -1200),
        this.defaultConfig
      );
      trap.movementType = {
        start: 'sin',
        direction: 'z',
        distance: 20,
        positionOffset: -1200,
        speed: -0.02,
      };
      this.addToWorld(trap);
      this.obstacleArray.push(trap);
    }
  }

  // Mesh of starting zone
  createStartingZone() {
    const planeGeometry = new THREE.PlaneBufferGeometry(400, 400, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial(this.defaultConfig);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;

    // Move just slightly to prevent Z-Fighting
    plane.position.y = -0.2;
    this.scene.add(plane);

    const wallProperties = [
      // left
      {
        w: 1,
        h: 400,
        d: 50,
        x: -200,
        y: 25,
        z: 0,
      },
      // right
      {
        w: 1,
        h: 400,
        d: 50,
        x: 200,
        y: 25,
        z: 0,
      },
      // back
      {
        w: 400,
        h: 1,
        d: 50,
        x: 0,
        y: 25,
        z: 200,
      },
    ];

    wallProperties.forEach(({ w, h, d, x, y, z }) => {
      this.addToWorld(
        PlaneFactory.createPlane(
          getDimensions(w, h, d),
          this.material.getAdamantineMaterial(),
          getPosition(x, y, z),
          this.defaultConfig
        )
      );
    });
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();

    for (const gamePiece of this.activeGamePieces) {
      this.move(gamePiece, elapsedTime);
    }

    for (const obstacle of this.obstacleArray) {
      this.rotate(obstacle, elapsedTime);
    }

    this.sendCurrentGameState();
    this.rewspawnIfDead();
    this.world.step(1 / 100, timeDelta);
  }

  rewspawnIfDead() {
    if (this.currentGamePiece.mesh.position.y <= -50) {
      this.currentGamePiece.body.position.set(
        (0.5 - Math.random()) * 400,
        150,
        (0.5 - Math.random()) * 400
      );
      this.currentGamePiece.body.angularVelocity.set(0, 0, 0);
      this.currentGamePiece.body.velocity.set(0, 0, 0);
    }
  }

  // Physical plane of starting zone
  addPhysicalStartingZone() {
    const floorShape = new CANNON.Box(new Vec3(200, 200, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
  }

  listenForEvents() {
    this.socket.on('connect', () => {
      console.log('Connected');

      this.socket.emit('userConnected', { username: this.userName });
    });

    this.socket.on(SocketEvent.USER_CONNECTED, ({ username, id }) => {
      this.spawnOtherPlayers(username, id);
    });

    this.socket.on(
      SocketEvent.CURRENT_USERS,
      (activePlayers: IActivePlayer[]) => {
        this.spawnExistingPlayers(activePlayers);
      }
    );

    this.socket.on(SocketEvent.USER_DISCONNECTED, (id) =>
      this.removeDisconnectedUser(id)
    );

    this.socket.on(SocketEvent.UPDATE_STATE, (update: IActivePlayer[]) => {
      this.updateGameState(update);
    });
  }

  // need to pass position etc
  spawnExistingPlayers(activePlayers: IActivePlayer[]) {
    activePlayers.forEach(({ username, id }) => {
      this.spawnOtherPlayers(username, id);
    });
  }

  spawnOtherPlayers(username: string, id: string) {
    console.log(username, 'should be added to the scene');

    const startPosition = { x: 0, y: 180, z: 0 };
    const mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 64, 64),
      new THREE.MeshStandardMaterial({ map: this.gamePieceTexture })
    );
    mesh.castShadow = true;
    mesh.position.copy(startPosition as Vector3);
    mesh.name = username;
    mesh.userData.clientId = id;

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
    this.activeGamePieces.push({ mesh, body });
  }

  removeDisconnectedUser(id: string) {
    for (let index = 0; index < this.activeGamePieces.length; index++) {
      const gamepiece = this.activeGamePieces[index];
      if (gamepiece.mesh.userData.clientId === id) {
        this.activeGamePieces.splice(index, 1);
        this.scene.remove(gamepiece.mesh);
        this.world.removeBody(gamepiece.body);
        break;
      }
    }
  }

  // Send Updates of current gamepiece to server
  sendCurrentGameState() {
    this.counter++;
    if (this.socket.connected && this.counter % 2 === 0) {
      const updateMsg: IStateUpdate = {
        position: {
          x: this.currentGamePiece.mesh.position.x,
          y: this.currentGamePiece.mesh.position.y,
          z: this.currentGamePiece.mesh.position.z,
        },
        velocity: this.currentGamePiece.body.angularVelocity as IPosition,
      };
      this.socket.emit(SocketEvent.UPDATE_STATE, updateMsg);
    }
  }

  // Updates the world based on Server Response
  updateGameState(update: IActivePlayer[]) {
    update.forEach(({ id, position, velocity }) => {
      const { x, y, z } = position;
      const pieceToUpdate = this.activeGamePieces.find(
        (piece) => piece.mesh.userData.clientId === id
      );
      if (pieceToUpdate) {
        pieceToUpdate.mesh.position.set(x, y, z);
        pieceToUpdate.body.angularVelocity.set(
          velocity.x,
          velocity.y,
          velocity.z
        );
        pieceToUpdate.body.position.copy(
          pieceToUpdate.mesh.position as unknown as Vec3
        );
      }
    });
  }

  initializeTextures() {
    const loader = this.loader.getTextureLoader();
    const map = loader.load('/textures/metalPlate/MetalPlates006_1K_Color.jpg');
    const normal = loader.load(
      '/textures/metalPlate/MetalPlates006_1K_Normal.jpg'
    );
    const displacement = loader.load(
      '/textures/metalPlate/MetalPlates006_1K_Displacement.jpg'
    );
    const metallic = loader.load(
      '/textures/metalPlate/MetalPlates006_1K_Metalness.jpg'
    );
    const roughness = loader.load(
      '/textures/metalPlate/MetalPlates006_1K_Roughness.jpg'
    );

    this.defaultConfig = {
      opacity: 0.6,
      transparent: true,
      map,
      normalMap: normal,
      displacementMap: displacement,
      roughnessMap: roughness,
      metalnessMap: metallic,
    };
  }
}

export default MultiplayerWorld;
