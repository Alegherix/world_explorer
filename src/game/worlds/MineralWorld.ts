import type { IDimension } from './../../shared/interfaces';
/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import type * as CANNON from 'cannon-es';
import { Mesh, MeshStandardMaterialParameters, OctahedronBufferGeometry, MeshPhongMaterial } from 'three';

import PlaneFactory from '../components/Plane';
import PlatformFactory from '../components/Platform';
import TubeFactory from '../components/Tube';
import ScoreKeeper from '../components/ScoreKeeper';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import cannonDebugger from 'cannon-es-debugger';
import { getDimensions, getCylinderDimensions, getPosition, getTorusrDimensions } from '../utils/utils';

class MineralWorld extends Game {
  private scoreKeeper: ScoreKeeper;
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
      'moon.jpg',
      'space',
      '.jpg'
      // true
    );

    // cannonDebugger(this.scene, this.world.bodies);
    this.scoreKeeper = new ScoreKeeper(this.scene);

    this.createStartingZone();
    this.createGameMap();
    this.createFinishZone();
    console.log(this.scene.children);
    this.scene.remove(this.scene.children[3]);
  }

  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();
    this.scoreKeeper.watchScore(this.currentGamePiece.mesh);
    this.updatePlaytime(elapsedTime);

    for (const gamePiece of this.activeGamePieces) {
      this.move(gamePiece, elapsedTime);
    }

    this.world.step(1 / 100, timeDelta);
  }

  createStartingZone() {
    this.createPlayer();
    this.createStartingPlane();
  }

  createGameMap() {
    this.createFirstPart();
    this.createSecondPart();
    this.createMaze();
    this.createMovingStairs();
    this.createThirdPart();
  }

  createFinishZone() {
    const finishPlatform = PlatformFactory.createCylinderPlatform(
      getCylinderDimensions(100, 100, 1, 30),
      this.material.getGlassMaterial(),
      getPosition(-320, -100, 1400),
      this.defaultConfig
    );
    this.addToWorld(finishPlatform);

    const walls = TubeFactory.createCustomTube(
      getTorusrDimensions(388, 98, 30, 10, 0.1),
      this.material.getGlassMaterial(),
      getPosition(-380, -65, 1020),
      this.defaultConfig
    );
    walls.mesh.rotateY(-Math.PI * 0.55);
    walls.body.quaternion.copy(walls.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(walls);

    const lootGeometry = new OctahedronBufferGeometry(12, 0);
    const lootMaterial = new MeshPhongMaterial({
      color: 0x98b1c4,
      emissive: 0x0,
      emissiveIntensity: 0.2,
      shininess: 52,
    });
    const lootMesh = new Mesh(lootGeometry, lootMaterial);
    lootMesh.receiveShadow = true;
    lootMesh.castShadow = true;
    lootMesh.position.set(-320, -85, 1400);
    this.scene.add(lootMesh);
  }

  createStartingPlane() {
    // Textures
    const colorTexture = this.loader.getTextureLoader().load('/textures/rockPlanet/Rock012_1K_Color.jpg');
    const ambientOcclusionTexture = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/Rock012_1K_AmbientOcclusion.jpg');
    const displacementTexture = this.loader.getTextureLoader().load('/textures/rockPlanet/Rock012_1K_Displacement.jpg');
    const normalTexture = this.loader.getTextureLoader().load('/textures/rockPlanet/Rock012_1K_Normal.jpg');
    const roughnessTexture = this.loader.getTextureLoader().load('/textures/rockPlanet/Rock012_1K_Roughness.jpg');

    // Physical Plane
    const plane: IDimension = { width: 200, height: 200, depth: 0.1 };
    const { mesh, body } = PlaneFactory.createPlane(
      plane,
      this.material.getRockMaterial(),
      { x: 0, y: 0, z: 0 },
      {
        map: colorTexture,
        aoMap: ambientOcclusionTexture,
        displacementMap: displacementTexture,
        displacementScale: 1.1,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
      }
    );

    this.scene.add(mesh);
    this.world.addBody(body);
  }

  createFirstPart() {
    const firstStraight = PlatformFactory.createPlanePlatform(
      getDimensions(40, 1, 500),
      this.material.getRockMaterial(),
      getPosition(0, -1, -350)
    );
    this.addToWorld(firstStraight);

    const firstShortGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 80, 20),
      this.material.getGlassMaterial(),
      getPosition(20, 10, -560)
    );
    this.addToWorld(firstShortGlassWall);

    const firstLongGlassWall = PlaneFactory.createPlane(
      getDimensions(480, 1, 20),
      this.material.getGlassMaterial(),
      getPosition(-220, 10, -600)
    );
    this.addToWorld(firstLongGlassWall);

    const firstBounceCorner = PlatformFactory.createPlanePlatform(
      getDimensions(1, 20, 40),
      this.material.getSpungeMaterial(),
      getPosition(4, 0, -580)
    );
    firstBounceCorner.mesh.rotateY(Math.PI * 0.2);
    firstBounceCorner.body.quaternion.copy(firstBounceCorner.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstBounceCorner);

    const secondStraight = PlatformFactory.createPlanePlatform(
      getDimensions(400, 1, 40),
      this.material.getRockMaterial(),
      getPosition(-220, -1, -580),
      this.defaultConfig,
      0,
      this.scoreKeeper
    );
    this.addToWorld(secondStraight);

    const ThirdStraight = PlatformFactory.createPlanePlatform(
      getDimensions(40, 1, -430),
      this.material.getRockMaterial(),
      getPosition(-440, 0 - 1, -385)
    );
    this.addToWorld(ThirdStraight);

    const secondLongGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 430, 20),
      this.material.getGlassMaterial(),
      getPosition(-460, 10, -385)
    );
    this.addToWorld(secondLongGlassWall);

    const secondBounceCorner = PlatformFactory.createPlanePlatform(
      getDimensions(1, 20, 40),
      this.material.getSpungeMaterial(),
      getPosition(-440, 0, -584)
    );
    secondBounceCorner.mesh.rotateY(-Math.PI * 0.31);
    secondBounceCorner.body.quaternion.copy(secondBounceCorner.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(secondBounceCorner);

    const secondShortGlassWall = PlaneFactory.createPlane(
      getDimensions(40, 1, 20),
      this.material.getGlassMaterial(),
      getPosition(-440, 10, -170)
    );
    this.addToWorld(secondShortGlassWall);

    const thirdShortGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 30, 20),
      this.material.getGlassMaterial(),
      getPosition(-420, 10, -185)
    );
    this.addToWorld(thirdShortGlassWall);
  }

  createSecondPart() {
    const firstClimb = PlatformFactory.createPlanePlatform(
      getDimensions(150, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(-346, 10, -220)
    );
    firstClimb.mesh.rotateZ(0.15);
    firstClimb.body.quaternion.copy(firstClimb.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstClimb);

    const firstStraight = PlatformFactory.createPlanePlatform(
      getDimensions(180, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(-182, 21, -220),
      this.defaultConfig,
      0,
      this.scoreKeeper
    );
    this.addToWorld(firstStraight);

    const firstRamp = PlatformFactory.createPlanePlatform(
      getDimensions(20, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(-83, 25, -220)
    );
    firstRamp.mesh.rotateZ(0.45);
    firstRamp.body.quaternion.copy(firstRamp.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstRamp);

    const bouncePad = PlaneFactory.createPlane(
      getDimensions(40, 40, 2),
      this.material.getAdamantineMaterial(),
      getPosition(10, 30, -220)
    );
    this.addToWorld(bouncePad);

    const secondRamp = PlatformFactory.createPlanePlatform(
      getDimensions(20, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(80, 39, -220)
    );
    secondRamp.mesh.rotateZ(-0.5);
    secondRamp.body.quaternion.copy(secondRamp.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(secondRamp);

    const secondStraight = PlatformFactory.createPlanePlatform(
      getDimensions(140, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(159, 34, -220),
      this.defaultConfig,
      0,
      this.scoreKeeper
    );
    this.addToWorld(secondStraight);

    const firstElevatorGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 40, 20),
      this.material.getGlassMaterial(),
      getPosition(230, 45, -220)
    );
    this.addToWorld(firstElevatorGlassWall);

    const secondElevatorGlassWall = PlaneFactory.createPlane(
      getDimensions(40, 1, 20),
      this.material.getGlassMaterial(),
      getPosition(210, 45, -200)
    );
    this.addToWorld(secondElevatorGlassWall);

    const elevator = PlatformFactory.createPlanePlatform(
      getDimensions(40, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(210, 34, -260)
    );
    elevator.movementType = {
      start: 'sin',
      distance: 75,
      positionOffset: 110,
      speed: 0.5,
      direction: 'y',
    };

    this.addToWorld(elevator);
  }

  createMaze() {
    const mazeEntrance = PlatformFactory.createPlanePlatform(
      getDimensions(100, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(240, 185, -300),
      this.defaultConfig,
      0,
      this.scoreKeeper
    );
    this.addToWorld(mazeEntrance);

    const entranceRamp = PlatformFactory.createPlanePlatform(
      getDimensions(40, 10, 1),
      this.material.getGlassMaterial(),
      getPosition(270, 189, -324)
    );
    entranceRamp.mesh.rotateX(-Math.PI * 0.3);
    entranceRamp.body.quaternion.copy(entranceRamp.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(entranceRamp);

    const mazePlane = PlatformFactory.createPlanePlatform(
      getDimensions(100, 1, 360),
      this.material.getRockMaterial(),
      getPosition(240, 185, -500)
    );
    this.addToWorld(mazePlane);

    for (let i = 1; i < 3; i++) {
      const xOffset = 100;
      const outerWalls = PlaneFactory.createPlane(
        getDimensions(1, 400, 50),
        this.material.getGlassMaterial(),
        getPosition(90 + i * xOffset, 210, -480)
      );
      this.addToWorld(outerWalls);
    }

    for (let i = 1; i < 5; i++) {
      const zOffset = 100;
      const leftSideMazeWalls = PlaneFactory.createPlane(
        getDimensions(60, 1, 50),
        this.material.getGlassMaterial(),
        getPosition(220, 210, -720 + i * zOffset)
      );
      this.addToWorld(leftSideMazeWalls);
    }

    for (let i = 1; i < 6; i++) {
      const zOffset = 100;
      const rightSideMazeWalls = PlaneFactory.createPlane(
        getDimensions(60, 1, 50),
        this.material.getGlassMaterial(),
        getPosition(260, 210, -780 + i * zOffset)
      );
      this.addToWorld(rightSideMazeWalls);
    }

    const roof = PlaneFactory.createPlane(
      getDimensions(100, 400, 1),
      this.material.getGlassMaterial(),
      getPosition(240, 235, -480)
    );
    this.addToWorld(roof);

    const mazeExit = PlatformFactory.createPlanePlatform(
      getDimensions(300, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(80, 185, -700),
      this.defaultConfig,
      0,
      this.scoreKeeper
    );
    this.addToWorld(mazeExit);

    const firstExitGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 40, 50),
      this.material.getGlassMaterial(),
      getPosition(230, 210, -700)
    );
    this.addToWorld(firstExitGlassWall);

    const secondExitGlassWall = PlaneFactory.createPlane(
      getDimensions(40, 1, 50),
      this.material.getGlassMaterial(),
      getPosition(210, 210, -720)
    );
    this.addToWorld(secondExitGlassWall);

    const exitRoof = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(210, 235, -700)
    );
    this.addToWorld(exitRoof);
  }

  createMovingStairs() {
    const firstStep = PlatformFactory.createPlanePlatform(
      getDimensions(40, 20, 60),
      this.material.getGlassMaterial(),
      getPosition(-90, 205, -700)
    );
    firstStep.movementType = {
      start: 'sin',
      distance: 10,
      positionOffset: 185,
      speed: 1,
      direction: 'y',
    };
    this.addToWorld(firstStep);

    const secondStep = PlatformFactory.createPlanePlatform(
      getDimensions(40, 20, 60),
      this.material.getGlassMaterial(),
      getPosition(-130, 220, -700)
    );
    secondStep.movementType = {
      start: 'cos',
      distance: 10,
      positionOffset: 205,
      speed: 1,
      direction: 'y',
    };
    this.addToWorld(secondStep);

    const thirdStep = PlatformFactory.createPlanePlatform(
      getDimensions(40, 20, 60),
      this.material.getGlassMaterial(),
      getPosition(-170, 240, -700)
    );
    thirdStep.movementType = {
      start: 'sin',
      distance: 10,
      positionOffset: 225,
      speed: 1,
      direction: 'y',
    };
    this.addToWorld(thirdStep);
  }

  createThirdPart() {
    const safePlatform = PlatformFactory.createPlanePlatform(
      getDimensions(150, 1, 40),
      this.material.getGlassMaterial(),
      getPosition(-265, 244, -700),
      this.defaultConfig,
      0,
      this.scoreKeeper
    );
    this.addToWorld(safePlatform);

    const firstSafeGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 40, 20),
      this.material.getGlassMaterial(),
      getPosition(-340, 254, -700)
    );
    this.addToWorld(firstSafeGlassWall);

    const secondSafeGlassWall = PlaneFactory.createPlane(
      getDimensions(40, 1, 20),
      this.material.getGlassMaterial(),
      getPosition(-320, 254, -720)
    );
    this.addToWorld(secondSafeGlassWall);

    const blockElevator = PlatformFactory.createPlanePlatform(
      getDimensions(40, 60, 40),
      this.material.getGlassMaterial(),
      getPosition(-320, 280, -660)
    );
    blockElevator.movementType = {
      start: 'cos',
      distance: 75,
      positionOffset: 288,
      speed: 0.5,
      direction: 'y',
    };
    this.addToWorld(blockElevator);

    const elevatorPlane = PlatformFactory.createPlanePlatform(
      getDimensions(100, 1, 100),
      this.material.getGlassMaterial(),
      getPosition(-320, 390, -590)
    );
    this.addToWorld(elevatorPlane);

    const firstTube = TubeFactory.createCustomTube(
      getTorusrDimensions(250, 20, 20, 10, 2.6),
      this.material.getGlassMaterial(),
      getPosition(-320, 390, -280),
      this.defaultConfig
    );
    firstTube.mesh.rotateY(Math.PI * 0.5);
    firstTube.body.quaternion.copy(firstTube.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstTube);

    const secondTube = TubeFactory.createCustomTube(
      getTorusrDimensions(300, 40, 20, 10, 2.7),
      this.material.getGlassMaterial(),
      getPosition(-320, 150, 600),
      this.defaultConfig
    );
    secondTube.mesh.rotateY(Math.PI * 0.5);
    secondTube.body.quaternion.copy(secondTube.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(secondTube);
  }
}

export default MineralWorld;
