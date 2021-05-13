/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import type { Vector3 } from 'three';
import * as THREE from 'three';
import type { IActivePlayer } from '../../shared/frontendInterfaces';
import Gamestore from '../../shared/GameStore';
import { IPosition, IStateUpdate, SocketEvent } from '../../shared/interfaces';
import PlaneFactory from '../components/Plane';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import { getDimensions, getPosition } from '../utils/utils';

class MultiplayerWorld extends Game {
  private userName: string;
  private socket: Socket;

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
    this.socket = io('ws://localhost:8000').connect();
    // this.socket = io('https://world-explorer-backend.herokuapp.com/').connect();

    this.listenForEvents();
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

    const planeGeometry = new THREE.PlaneBufferGeometry(400, 400, 128, 128);
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

    const wallProperties = [
      // left
      {
        w: 1,
        h: 400,
        d: 100,
        x: -200,
        y: 50,
        z: 0,
      },
      // right
      {
        w: 1,
        h: 400,
        d: 100,
        x: 200,
        y: 50,
        z: 0,
      },
      // back
      {
        w: 400,
        h: 1,
        d: 100,
        x: 0,
        y: 50,
        z: 200,
      },
    ];

    wallProperties.forEach(({ w, h, d, x, y, z }) => {
      this.addToWorld(
        PlaneFactory.createPlane(
          getDimensions(w, h, d),
          this.material.getAdamantineMaterial(),
          getPosition(x, y, z),
          { color: 0x932ce5, transparent: true, opacity: 0.6 }
        )
      );
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

    this.sendCurrentGameState();
    this.world.step(1 / 100, timeDelta);
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
}

export default MultiplayerWorld;
