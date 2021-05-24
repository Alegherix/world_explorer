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
import PlatformFactory from '../components/Platform';
import TubeFactory from '../components/Tube';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import ThirdPersonCamera from '../utils/ThirdPersonCamera';
import { getDimensions, getPosition, getCylinderDimensions, getTorusrDimensions } from '../utils/utils';
import ScoreKeeper from '../components/ScoreKeeper';
import SpriteText from 'three-spritetext';

class MultiplayerWorld extends Game {
  private userName: string;
  private socket: Socket;

  // Used for testing, and caping responses sent to the backend server.
  private counter: number = 0;
  private defaultConfig: MeshStandardMaterialParameters;
  private chipConfig: MeshStandardMaterialParameters;
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
      'alien',
      '.png'
      // true
    );

    this.userName = get(Gamestore).username;
    // this.socket = io('ws://localhost:8000').connect();
    this.socket = io('https://world-explorer-backend.herokuapp.com/').connect();
    this.activeGamePieces = [];

    this.initializeTextures();
    this.listenForEvents();
    this.createStartingZone();
    this.createGameMap();
    this.createPlayer(this.userName);
    this.createFinishZone();
    this.world.gravity.set(0, -80, 0);
  }

  initializeTextures() {
    // Metal Textures
    const loader = this.loader.getTextureLoader();
    const metalColor = loader.load('/textures/metalPlate/MetalPlates006_1K_Color.jpg');
    const metalNormal = loader.load('/textures/metalPlate/MetalPlates006_1K_Normal.jpg');
    const metalDisplacement = loader.load('/textures/metalPlate/MetalPlates006_1K_Displacement.jpg');
    const metalMetalness = loader.load('/textures/metalPlate/MetalPlates006_1K_Metalness.jpg');
    const metalRoughness = loader.load('/textures/metalPlate/MetalPlates006_1K_Roughness.jpg');

    this.defaultConfig = {
      opacity: 0.7,
      transparent: true,
      map: metalColor,
      normalMap: metalNormal,
      displacementMap: metalDisplacement,
      roughnessMap: metalRoughness,
      metalnessMap: metalMetalness,
    };

    // Chip Textures
    const chipColor = loader.load('/textures/alienPlanet/Chip006_1K_Color.jpg');
    const chipNormal = loader.load('/textures/alienPlanet/Chip006_1K_Normal.jpg');
    const chipDisplacement = loader.load('/textures/alienPlanet/Chip006_1K_Displacement.jpg');
    const chipMetalness = loader.load('/textures/alienPlanet/Chip006_1K_Metalness.jpg');
    const chipRoughness = loader.load('/textures/alienPlanet/Chip006_1K_Roughness.jpg');

    this.chipConfig = {
      opacity: 0.8,
      transparent: true,
      map: chipColor,
      normalMap: chipNormal,
      displacementMap: chipDisplacement,
      roughnessMap: chipRoughness,
      metalnessMap: chipMetalness,
    };
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();

    // for (const gamePiece of this.activeGamePieces) {
    //   this.move(gamePiece, this.elapsedTime);
    // }

    // for (const obstacle of this.movingPieces) {
    //   this.rotate(obstacle, this.elapsedTime);
    // }

    this.elapsedTime = new Date().getTime() / 1000;

    this.sendCurrentGameState();
    this.runGameUpdates(timeDelta, elapsedTime, -50, 400);
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
    this.createLoopSection();
    this.createBounceSection();
    this.createHeavenlyAscend();
    this.createCorners();
    this.createHomeStrech();
  }

  createFinishZone() {
    const walls = [
      {
        x: 1950,
        y: 1350,
        z: 4560,
        h: 300,
        w: 1,
        d: 200,
      },
      {
        x: 1950,
        y: 1350,
        z: 4260,
        h: 300,
        w: 1,
        d: 200,
      },
      {
        x: 1950,
        y: 1450,
        z: 4410,
        h: 300,
        w: 300,
        d: 1,
      },
      {
        x: 2100,
        y: 1350,
        z: 4410,
        h: 1,
        w: 300,
        d: 200,
      },
      {
        x: 1800,
        y: 1350,
        z: 4271,
        h: 1,
        w: 25,
        d: 200,
      },
      {
        x: 1800,
        y: 1350,
        z: 4545,
        h: 1,
        w: 30,
        d: 200,
      },
    ];

    const platform = PlaneFactory.createPlane(
      getDimensions(300, 300, 1),
      this.material.getGlassMaterial(),
      getPosition(1950, 1250, 4410),
      this.defaultConfig
    );
    this.addToWorld(platform);

    for (const { x, y, z, h, w, d } of walls) {
      const wall = PlaneFactory.createPlane(
        getDimensions(h, w, d),
        this.material.getGlassMaterial(),
        getPosition(x, y, z),
        { color: 0x1987ee, transparent: true, opacity: 0.4 }
      );
      this.addToWorld(wall);
    }

    const scoreKeeper = new ScoreKeeper(this.scene);
    scoreKeeper.createPrize(1950, 1265, 4410);
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
      getDimensions(250, 500, 1),
      this.material.getGlassMaterial(),
      getPosition(0, 100, -1325),
      this.defaultConfig
    );
    this.addToWorld(plane);

    const text = new SpriteText('Break!', 12);
    text.position.set(0, 150, -1150);
    this.scene.add(text);

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
      getPosition(-929, 275, -1200),
      this.defaultConfig
    );
    this.addToWorld(plane);

    for (let index = 1; index < 3; index++) {
      const offset = index * 400;

      const trap = PlaneFactory.createPlane(
        getDimensions(250, 20, 20),
        this.material.getGlassMaterial(),
        getPosition(-300 - offset, 287, -1200),
        this.chipConfig
      );
      trap.movementType = {
        start: 'sin',
        direction: 'z',
        distance: 20,
        positionOffset: -1200,
        speed: -0.08,
      };
      this.addToWorld(trap);
      this.movingPieces.push(trap);
    }

    const bouncePlate = PlaneFactory.createPlane(
      getDimensions(200, 200, 1),
      this.material.getAdamantineMaterial(),
      getPosition(-1650, 200, -1200),
      this.chipConfig
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
      this.chipConfig
    );
    PlaneFactory.slopePlaneUpRight(downObstacleOne);
    downObstacleOne.mesh.rotation.z = Math.PI / 0.5;
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
      this.chipConfig
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

  createLoopSection() {
    const loopEntry = PlaneFactory.createPlane(
      getDimensions(1080, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-5620, 300, -1200),
      this.defaultConfig
    );
    this.addToWorld(loopEntry);

    const text = new SpriteText('Boost!');
    text.position.set(-5300, 325, -1200);
    this.scene.add(text);

    const loopPartOne = TubeFactory.createCustomTube(
      getTorusrDimensions(350, 130, 18, 10, 3.1),
      this.material.getGlassMaterial(),
      getPosition(-5850, 600, -1450),
      this.defaultConfig
    );
    loopPartOne.mesh.rotateZ(-Math.PI * 0.5);
    loopPartOne.mesh.rotateY(Math.PI * 0.25);
    loopPartOne.body.quaternion.copy(loopPartOne.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(loopPartOne);

    const loopPartTwo = TubeFactory.createCustomTube(
      getTorusrDimensions(350, 130, 18, 10, 3.1),
      this.material.getGlassMaterial(),
      getPosition(-5860, 600, -1945),
      this.defaultConfig
    );
    loopPartTwo.mesh.rotateZ(Math.PI * 0.5);
    loopPartTwo.mesh.rotateY(Math.PI * 0.25);
    loopPartTwo.body.quaternion.copy(loopPartTwo.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(loopPartTwo);

    const loopExit = PlaneFactory.createPlane(
      getDimensions(1300, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-6240, 300, -2190),
      this.defaultConfig
    );
    this.addToWorld(loopExit);

    const tube = TubeFactory.createCustomTube(
      getTorusrDimensions(450, 130, 18, 10, 1.65),
      this.material.getGlassMaterial(),
      getPosition(-6760, 380, -1745),
      this.defaultConfig
    );
    tube.mesh.rotateX(Math.PI * 0.5);
    tube.mesh.rotateZ(-Math.PI * 0.5);
    tube.body.quaternion.copy(tube.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(tube);

    const ramp = PlaneFactory.createPlane(
      getDimensions(220, 50, 1),
      this.material.getGlassMaterial(),
      getPosition(-6910, 287, -2175),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(ramp);
    this.addToWorld(ramp);

    const tubeExit = PlaneFactory.createPlane(
      getDimensions(250, 2000, 1),
      this.material.getGlassMaterial(),
      getPosition(-7200, 251, -833),
      this.defaultConfig
    );
    this.addToWorld(tubeExit);
  }

  createBounceSection() {
    const rampUp = PlaneFactory.createPlane(
      getDimensions(250, 1000, 1),
      this.material.getGlassMaterial(),
      getPosition(-7200, 502, 600),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpBack(rampUp);
    this.addToWorld(rampUp);

    for (let index = 1; index < 4; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenBouncePlates = 500;
      const bouncePlate = PlaneFactory.createPlane(
        getDimensions(200, 100, 1),
        this.material.getAdamantineMaterial(),
        getPosition(-7200, 700, 1400 + index * spaceBetweenBouncePlates),
        this.chipConfig
      );
      bouncePlate.movementType = {
        start: direction,
        distance: 200,
        positionOffset: -7200,
        speed: 0.7,
        direction: 'x',
      };
      this.addToWorld(bouncePlate);
    }

    const rampDown = PlaneFactory.createPlane(
      getDimensions(250, 1000, 1),
      this.material.getGlassMaterial(),
      getPosition(-7200, 502, 3900),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUp(rampDown);
    this.addToWorld(rampDown);

    const landing = PlaneFactory.createPlane(
      getDimensions(250, 1000, 1),
      this.material.getGlassMaterial(),
      getPosition(-7200, 252, 4833),
      this.defaultConfig
    );
    this.addToWorld(landing);

    for (let index = 1; index < 6; index++) {
      const offset = index * 5;
      const corner = TubeFactory.createCustomTube(
        getTorusrDimensions(250, 3, 18, 18, 1.65),
        this.material.getGlassMaterial(),
        getPosition(-7070, 252 + offset, 5080),
        this.chipConfig
      );

      corner.mesh.rotateX(-Math.PI * 0.5);
      corner.mesh.rotateZ(-Math.PI * 0.525);
      corner.body.quaternion.copy(corner.mesh.quaternion as unknown as CANNON.Quaternion);
      this.addToWorld(corner);
    }
  }

  createHeavenlyAscend() {
    const straight = PlaneFactory.createPlane(
      getDimensions(700, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-6726, 252, 5208),
      this.defaultConfig
    );
    this.addToWorld(straight);

    const ramp = PlaneFactory.createPlane(
      getDimensions(250, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(-6289, 302, 5208),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(ramp);
    this.addToWorld(ramp);

    // First set of bounce plates
    for (let index = 1; index < 4; index++) {
      const spaceBetweenBouncePlates = 300;
      const xOffset = 50;
      const bouncePlate = PlaneFactory.createPlane(
        getDimensions(250, 125, 1),
        this.material.getAdamantineMaterial(),
        getPosition(-5700 + index * xOffset, 150 + index * spaceBetweenBouncePlates, 5208),
        this.chipConfig
      );
      PlaneFactory.slopePlaneUpRight(bouncePlate);
      this.addToWorld(bouncePlate);
    }

    // Second set of bounce plates
    for (let index = 1; index < 4; index++) {
      const spaceBetweenBouncePlates = 300;
      const xOffset = 50;
      const bouncePlate = PlaneFactory.createPlane(
        getDimensions(250, 125, 1),
        this.material.getAdamantineMaterial(),
        getPosition(-6250 - index * xOffset, 300 + index * spaceBetweenBouncePlates, 5208),
        this.chipConfig
      );
      PlaneFactory.slopePlaneUpLeft(bouncePlate);
      this.addToWorld(bouncePlate);
    }
  }

  createCorners() {
    const straight = PlaneFactory.createPlane(
      getDimensions(1200, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-4800, 1250, 5208),
      this.defaultConfig
    );
    this.addToWorld(straight);

    for (let index = 1; index < 6; index++) {
      const offset = index * 5;
      const firstCorner = TubeFactory.createCustomTube(
        getTorusrDimensions(250, 3, 18, 18, 1.65),
        this.material.getGlassMaterial(),
        getPosition(-4453, 1250 + offset, 5080),
        this.chipConfig
      );

      firstCorner.mesh.rotateX(Math.PI * 0.5);
      firstCorner.mesh.rotateZ(Math.PI * 0.525);
      firstCorner.body.quaternion.copy(firstCorner.mesh.quaternion as unknown as CANNON.Quaternion);
      this.addToWorld(firstCorner);
    }

    const plane = PlaneFactory.createPlane(
      getDimensions(250, 800, 1),
      this.material.getGlassMaterial(),
      getPosition(-4325, 1250, 4683),
      this.defaultConfig
    );
    this.addToWorld(plane);

    for (let index = 1; index < 6; index++) {
      const offset = index * 5;
      const secondCorner = TubeFactory.createCustomTube(
        getTorusrDimensions(250, 3, 18, 18, 1.65),
        this.material.getGlassMaterial(),
        getPosition(-4196, 1250 + offset, 4537),
        this.chipConfig
      );

      secondCorner.mesh.rotateX(Math.PI * 0.5);
      secondCorner.mesh.rotateZ(-Math.PI * 0.525);
      secondCorner.body.quaternion.copy(secondCorner.mesh.quaternion as unknown as CANNON.Quaternion);
      this.addToWorld(secondCorner);
    }
  }

  createHomeStrech() {
    const plane = PlaneFactory.createPlane(
      getDimensions(6000, 250, 1),
      this.material.getGlassMaterial(),
      getPosition(-1200, 1250, 4408),
      this.defaultConfig
    );
    this.addToWorld(plane);

    // First set of obstacles
    for (let index = 1; index < 4; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenObstacles = 400;
      const obstacleBox = PlaneFactory.createPlane(
        getDimensions(60, 200, 50),
        this.material.getGlassMaterial(),
        getPosition(-3600 + index * spaceBetweenObstacles, 1275, 4408),
        this.chipConfig
      );
      obstacleBox.movementType = {
        start: direction,
        distance: 250,
        positionOffset: 4408,
        speed: 1 + index * 0.1,
        direction: 'z',
      };
      this.addToWorld(obstacleBox);
    }

    // Second set of obstacles
    for (let index = 1; index < 3; index++) {
      let direction: 'cos' | 'sin' = index % 2 === 0 ? 'cos' : 'sin';
      const spaceBetweenObstacles = 400;
      const obstaclePlane = PlaneFactory.createPlane(
        getDimensions(10, 250, 60),
        this.material.getGlassMaterial(),
        getPosition(-2100 + index * spaceBetweenObstacles, 1275, 4408),
        this.chipConfig
      );
      obstaclePlane.movementType = {
        start: direction,
        distance: 100,
        positionOffset: 1385,
        speed: 0.7 + index / 1.8,
        direction: 'y',
      };
      this.addToWorld(obstaclePlane);
    }

    // First set of cylinder obstacles
    for (let index = 1; index < 4; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenObstacles = 600;
      const obstacleCylinder = PlatformFactory.createCylinderPlatform(
        getCylinderDimensions(20, 20, 80, 20),
        this.material.getGlassMaterial(),
        getPosition(-1200 + index * spaceBetweenObstacles, 1275, 4290 + index * 15),
        this.chipConfig
      );
      obstacleCylinder.movementType = {
        start: direction,
        distance: 50,
        positionOffset: 1200,
        speed: 0.7 + index * 0.1,
        direction: 'y',
      };
      this.addToWorld(obstacleCylinder);
    }

    // Second set of cylinder obstacles
    for (let index = 1; index < 4; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenObstacles = 600;
      const obstacleCylinder = PlatformFactory.createCylinderPlatform(
        getCylinderDimensions(20, 20, 80, 20),
        this.material.getGlassMaterial(),
        getPosition(-1400 + index * spaceBetweenObstacles, 1275, 4530 - index * 20),
        this.chipConfig
      );
      obstacleCylinder.movementType = {
        start: direction,
        distance: 50,
        positionOffset: 1200,
        speed: 0.7 + index * 0.12,
        direction: 'y',
      };
      this.addToWorld(obstacleCylinder);
    }

    // Third set of cylinder obstacles
    for (let index = 1; index < 4; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenObstacles = 800;
      const obstacleCylinder = PlatformFactory.createCylinderPlatform(
        getCylinderDimensions(20, 20, 80, 20),
        this.material.getGlassMaterial(),
        getPosition(-1200 + index * spaceBetweenObstacles, 1275, 4420),
        this.chipConfig
      );
      obstacleCylinder.movementType = {
        start: direction,
        distance: 50,
        positionOffset: 1200,
        speed: 0.7 + index * 0.09,
        direction: 'y',
      };
      this.addToWorld(obstacleCylinder);
    }
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
      if (position && velocity) {
        const { x, y, z } = position;
        const pieceToUpdate = this.activeGamePieces.find((piece) => piece.mesh.userData.clientId === id);
        if (pieceToUpdate) {
          pieceToUpdate.mesh.position.set(x, y, z);
          pieceToUpdate.body.angularVelocity.set(velocity.x, velocity.y, velocity.z);
          pieceToUpdate.body.position.copy(pieceToUpdate.mesh.position as unknown as Vec3);
        }
      }
    });
  }
}

export default MultiplayerWorld;
