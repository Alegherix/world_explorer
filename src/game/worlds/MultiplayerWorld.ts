/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import type Material from '../utils/Materials';
import Game from '../Game';
import type Loader from '../utils/Loader';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import type { Vector3 } from 'three';
import Gamestore from '../../shared/GameStore';
import { get } from 'svelte/store';
import type {
  IConnected,
  ICurrentUsers,
  ISocketMessage,
  IUpdate,
} from '../../shared/interfaces';

class MultiplayerWorld extends Game {
  private server: WebSocket;
  private userName: string;

  // Used for testing, and making sure to only send current state to server n amount of times each second.
  private counter: number = 0;
  private haveConnectedToServer: boolean = false;

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
      '.jpg'
    );
    this.userName = get(Gamestore).username;
    this.createServerConnection();
    this.startListeningToIncomingServerEvents();
    this.createStartingZone();
    this.addPhysicalStartingZone();
    this.createPlayer(this.userName);
  }

  createGameMap() {
    throw new Error('Method not implemented.');
  }

  createFinishZone() {
    throw new Error('Method not implemented.');
  }

  // Mesh of starting zone
  createStartingZone() {
    const textureLoader = this.loader.getTextureLoader();
    const groundTexture = textureLoader.load('textures/test/iceTexture.jpg');

    const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;

    // Move just slightly to prevent Z-Fighting
    plane.position.y = -0.2;
    this.scene.add(plane);
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
    this.updateServerOfState();
    this.world.step(1 / 100, timeDelta);
  }

  // Physical plane of starting zone
  addPhysicalStartingZone() {
    const floorShape = new CANNON.Box(new Vec3(100, 100, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
  }

  // Send that the user has connected to server
  createServerConnection() {
    this.server = new WebSocket('ws://localhost:8000/ws');
    const connectionMessage = { msg: 'connected', username: this.userName };
    this.server.addEventListener(
      'open',
      () => {
        this.server.send(JSON.stringify(connectionMessage));
        this.haveConnectedToServer = true;
      },
      {
        once: true,
      }
    );
  }

  startListeningToIncomingServerEvents() {
    this.server.addEventListener('message', this.handleServerMsg.bind(this));
  }

  // Sorts Messages based on info
  handleServerMsg(event: MessageEvent) {
    const data = JSON.parse(event.data);
    const { msg }: ISocketMessage = data;

    switch (msg) {
      case 'currentUsers':
        this.spawnExistingPlayers(data);

      case 'connected':
        this.spawnOtherPlayers(data);
        break;
      case 'update':
        this.updateGameState(data);
        break;

      case 'disconnect':
        this.removeDisconnectedUser(data);
        break;

      default:
        console.log('Something went wrong');
        break;
    }
  }

  // Send Updates of current gamepiece to server
  updateServerOfState() {
    this.counter++;

    // Only send 6 updates / second
    // if (this.counter % 10 === 0) {
    if (this.haveConnectedToServer && this.counter % 2 === 0) {
      const updateMsg = {
        msg: 'update',
        username: this.userName,
        position: {
          x: this.currentGamePiece.mesh.position.x,
          y: this.currentGamePiece.mesh.position.y,
          z: this.currentGamePiece.mesh.position.z,
        },
      };
      this.server.send(JSON.stringify(updateMsg));
    }
    // }
  }

  // need to pass position etc
  spawnExistingPlayers(data: ICurrentUsers) {
    data.users.forEach((username) =>
      this.spawnOtherPlayers({ msg: 'connected', username })
    );
  }

  spawnOtherPlayers(data: IConnected) {
    // Makes sure not to spawn ball when self connecting

    if (!data.username || this.userName === data.username) return;
    console.log(data.username, 'should be added to the scene');

    const startPosition = { x: 0, y: 180, z: 0 };
    const mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 64, 64),
      new THREE.MeshStandardMaterial({ map: this.gamePieceTexture })
    );
    mesh.castShadow = true;
    mesh.position.copy(startPosition as Vector3);
    mesh.name = data.username;

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

  removeDisconnectedUser(data: IConnected) {
    console.log(
      `${data.username} has disconnected, should remove player from being rendered`
    );

    for (let index = 0; index < this.activeGamePieces.length; index++) {
      const gamepiece = this.activeGamePieces[index];
      if (gamepiece.mesh.name === data.username) {
        this.activeGamePieces.splice(index, 1);
        this.scene.remove(gamepiece.mesh);
        this.world.removeBody(gamepiece.body);
        break;
      }
    }
  }

  // Uppdatera att använda UUID ist så att inte användare med samma namn får varandras position
  updateGameState(data: IUpdate) {
    const { update } = data;

    update.forEach(({ username, position }) => {
      if (username && this.userName !== username) {
        const { x, y, z } = position;
        // console.log(`Position of ${username}: x:${x} y:${y} z:${z}`);
        const pieceToUpdate = this.activeGamePieces.find(
          (piece) => piece.mesh.name === username
        );
        pieceToUpdate?.mesh.position.set(x, y, z);
        pieceToUpdate?.body.position.copy(
          pieceToUpdate?.mesh.position as unknown as Vec3
        );
      }
    });
  }
}

export default MultiplayerWorld;
