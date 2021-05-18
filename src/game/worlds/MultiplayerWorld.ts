/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import type { MeshStandardMaterialParameters, Vector3 } from 'three';
import * as THREE from 'three';
import type { IActivePlayer, IGamePiece } from '../../shared/frontendInterfaces';
import Gamestore from '../../shared/GameStore';
import { IPosition, IStateUpdate, SocketEvent } from '../../shared/interfaces';
import PlaneFactory from '../components/Plane';
import TubeFactory from '../components/Tube';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import ThirdPersonCamera from '../utils/ThirdPersonCamera';
import { getDimensions, getPosition, getTorusrDimensions } from '../utils/utils';
import cannonDebugger from 'cannon-es-debugger';

class MultiplayerWorld extends Game {
  private userName: string;
  private socket: Socket;

  private obstacleArray: IGamePiece[] = [];

  // Used for testing, and caping responses sent to the backend server.
  private counter: number = 0;
  private defaultConfig: MeshStandardMaterialParameters;
  private elapsedTime: number;

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
      // true
    );

    // cannonDebugger(this.scene, this.world.bodies);

    this.userName = get(Gamestore).username;
    // this.socket = io('ws://localhost:8000').connect();
    this.socket = io('https://world-explorer-backend.herokuapp.com/').connect();

    this.initializeTextures();
    this.listenForEvents();
    this.createStartingZone();
    this.createGameMap();
    this.createPlayer(this.userName);
  }

  initializeTextures() {
    const loader = this.loader.getTextureLoader();
    const map = loader.load('/textures/metalPlate/MetalPlates006_1K_Color.jpg');
    const normal = loader.load('/textures/metalPlate/MetalPlates006_1K_Normal.jpg');
    const displacement = loader.load('/textures/metalPlate/MetalPlates006_1K_Displacement.jpg');
    const metallic = loader.load('/textures/metalPlate/MetalPlates006_1K_Metalness.jpg');
    const roughness = loader.load('/textures/metalPlate/MetalPlates006_1K_Roughness.jpg');

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

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();

    this.controller.steer();

    for (const gamePiece of this.activeGamePieces) {
      this.move(gamePiece, this.elapsedTime);
    }

    for (const obstacle of this.obstacleArray) {
      this.rotate(obstacle, this.elapsedTime);
    }

    this.elapsedTime = new Date().getTime() / 1000;

    this.sendCurrentGameState();
    this.rewspawnIfDead();
    this.replenishBoost();
    this.world.step(1 / 100, timeDelta);
  }

  // Mesh of starting zone
  createStartingZone() {
    const planeWidth = 400;
    const planeHeight = 400;
    const planeGeometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial(this.defaultConfig);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;

    // Move just slightly to prevent Z-Fighting
    plane.position.y = -0.2;
    this.scene.add(plane);

    const floorShape = new CANNON.Box(new Vec3(planeWidth / 2, planeHeight / 2, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape);

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

  createGameMap() {
    this.createStartJump();
    this.createPillar();
    this.createFirstObstacle();
    this.createLeapOfFaith();
    this.createStraightToLoop();
  }

  createFinishZone() {
    throw new Error('Method not implemented.');
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
        speed: -0.08,
      };
      this.addToWorld(trap);
      this.obstacleArray.push(trap);
    }

    const bouncePlate = PlaneFactory.createPlane(
      getDimensions(200, 200, 1),
      this.material.getAdamantineMaterial(),
      getPosition(-1650, 200, -1200),
      this.defaultConfig
    );
    bouncePlate.movementType = {
      start: 'sin',
      distance: 200,
      positionOffset: -1200,
      speed: 0.5,
      direction: 'z',
    };
    this.addToWorld(bouncePlate);

    const landingPlate = PlaneFactory.createPlane(
      getDimensions(500, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-2300, 300, -1200),
      this.defaultConfig
    );
    this.addToWorld(landingPlate);
  }

  createLeapOfFaith() {
    const superStairs = PlaneFactory.createPlane(
      getDimensions(250, 1200, 1),
      this.material.getGlassMaterial(),
      getPosition(-3070, 600, -1200),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(superStairs);
    this.addToWorld(superStairs);

    const downStairs = PlaneFactory.createPlane(
      getDimensions(250, 1200, 1),
      this.material.getGlassMaterial(),
      getPosition(-4570, 600, -1200),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(downStairs);
    this.addToWorld(downStairs);

    const downObstacleOne = PlaneFactory.createPlane(
      getDimensions(20, 250, 40),
      this.material.getGlassMaterial(),
      getPosition(-4570, 650, -1200),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(downObstacleOne);
    downObstacleOne.mesh.rotation.z = Math.PI / 0.5;
    // downObstacleOne.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2.75);
    downObstacleOne.body.quaternion.copy(downObstacleOne.mesh.quaternion as unknown as CANNON.Quaternion);
    downObstacleOne.movementType = {
      start: 'sin',
      distance: 50,
      positionOffset: 677,
      speed: 1,
      direction: 'y',
    };
    this.addToWorld(downObstacleOne);

    const downObstacleTwo = PlaneFactory.createPlane(
      getDimensions(20, 250, 40),
      this.material.getGlassMaterial(),
      getPosition(-5000, 650, -1200),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(downObstacleTwo);
    downObstacleTwo.mesh.rotation.z = Math.PI / 0.5;
    downObstacleTwo.body.quaternion.copy(downObstacleTwo.mesh.quaternion as unknown as CANNON.Quaternion);
    downObstacleTwo.movementType = {
      start: 'cos',
      distance: 75,
      positionOffset: 450,
      speed: 1,
      direction: 'y',
    };
    this.addToWorld(downObstacleTwo);
  }

  createStraightToLoop() {
    const loopEntry = PlaneFactory.createPlane(
      getDimensions(1080, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-5620, 300, -1200),
      this.defaultConfig
    );
    this.addToWorld(loopEntry);

    const firstLoopPartOne = TubeFactory.createCustomTube(
      getTorusrDimensions(250, 150, 18, 10, 3.1),
      this.material.getGlassMaterial(),
      getPosition(-6000, 590, -1375),
      this.defaultConfig
    );
    firstLoopPartOne.mesh.rotateZ(-Math.PI * 0.5);
    firstLoopPartOne.mesh.rotateY(Math.PI * 0.25);
    firstLoopPartOne.body.quaternion.copy(firstLoopPartOne.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstLoopPartOne);

    const firstLoopPartTwo = TubeFactory.createCustomTube(
      getTorusrDimensions(250, 150, 18, 10, 3.1),
      this.material.getGlassMaterial(),
      getPosition(-6017, 589, -1725),
      this.defaultConfig
    );
    firstLoopPartTwo.mesh.rotateZ(Math.PI * 0.5);
    firstLoopPartTwo.mesh.rotateY(Math.PI * 0.25);
    firstLoopPartTwo.body.quaternion.copy(firstLoopPartTwo.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstLoopPartTwo);

    const firstLoopExit = PlaneFactory.createPlane(
      getDimensions(1000, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-6330, 300, -1900),
      this.defaultConfig
    );
    this.addToWorld(firstLoopExit);

    const secondLoop = TubeFactory.createCustomTube(
      getTorusrDimensions(250, 150, 18, 10, 1.8),
      this.material.getGlassMaterial(),
      getPosition(-6450, 380, -1650),
      this.defaultConfig
    );
    secondLoop.mesh.rotateX(Math.PI * 0.5);
    secondLoop.mesh.rotateZ(-Math.PI * 0.5);
    secondLoop.body.quaternion.copy(secondLoop.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(secondLoop);

    const secondLoopExit = PlaneFactory.createPlane(
      getDimensions(350, 1500, 1),
      this.material.getGlassMaterial(),
      getPosition(-6650, 300, -1275),
      this.defaultConfig
    );
    this.addToWorld(secondLoopExit);
    this.addToGui(secondLoopExit);

    const antiCheatWall = PlaneFactory.createPlane(
      getDimensions(1, 550, 300),
      this.material.getGlassMaterial(),
      getPosition(-6200, 300, -800)
    );
    this.addToWorld(antiCheatWall);
  }

  /*** 
   NETWORKING
   ***/

  listenForEvents() {
    this.socket.on('connect', () => {
      console.log('Connected');

      this.socket.emit('userConnected', { username: this.userName });
    });

    this.socket.on(SocketEvent.USER_CONNECTED, ({ username, id }) => {
      this.spawnOtherPlayers(username, id);
    });

    this.socket.on(SocketEvent.CURRENT_USERS, (activePlayers: IActivePlayer[]) => {
      this.spawnExistingPlayers(activePlayers);
    });

    this.socket.on(SocketEvent.USER_DISCONNECTED, (id) => this.removeDisconnectedUser(id));

    this.socket.on(SocketEvent.UPDATE_STATE, (update: IActivePlayer[]) => {
      this.updateGameState(update);
    });
  }

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
      const pieceToUpdate = this.activeGamePieces.find((piece) => piece.mesh.userData.clientId === id);
      if (pieceToUpdate) {
        pieceToUpdate.mesh.position.set(x, y, z);
        pieceToUpdate.body.angularVelocity.set(velocity.x, velocity.y, velocity.z);
        pieceToUpdate.body.position.copy(pieceToUpdate.mesh.position as unknown as Vec3);
      }
    });
  }
}

export default MultiplayerWorld;
