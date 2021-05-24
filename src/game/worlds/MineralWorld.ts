import type { IDimension } from './../../shared/interfaces';
/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import type * as CANNON from 'cannon-es';
import { get } from 'svelte/store';
import type { MeshStandardMaterialParameters } from 'three';
import GameStore from '../../shared/GameStore';
import PlaneFactory from '../components/Plane';
import PlatformFactory from '../components/Platform';
import TubeFactory from '../components/Tube';
import ScoreKeeper from '../components/ScoreKeeper';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import { getDimensions, getCylinderDimensions, getTorusrDimensions, getPosition } from '../utils/utils';
import SpriteText from 'three-spritetext';

class MineralWorld extends Game {
  private scoreKeeper: ScoreKeeper;
  private defaultConfig: MeshStandardMaterialParameters;
  private iceTextureConfig: MeshStandardMaterialParameters;
  private boxTextureConfig: MeshStandardMaterialParameters;
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
  }

  initializeTextures() {
    const loader = this.loader.getTextureLoader();

    // Ice Textures
    const iceColorTexture = loader.load('/textures/rockPlanet/iceTextures/Blue_Ice_001_COLOR.jpg');
    const iceAmbientOcclusionTexture = loader.load('/textures/rockPlanet/iceTextures/Blue_Ice_001_OCC.jpg');
    const iceDisplacementTexture = loader.load('/textures/rockPlanet/iceTextures/Blue_Ice_001_DISP.png');
    const iceNormalTexture = loader.load('/textures/rockPlanet/iceTextures/Blue_Ice_001_NORM.jpg');
    const iceRoughnessTexture = loader.load('/textures/rockPlanet/iceTextures/Blue_Ice_001_ROUGH.jpg');

    this.iceTextureConfig = {
      map: iceColorTexture,
      aoMap: iceAmbientOcclusionTexture,
      displacementMap: iceDisplacementTexture,
      displacementScale: 0.01,
      normalMap: iceNormalTexture,
      roughnessMap: iceRoughnessTexture,
      transparent: true,
      opacity: 0.6,
    };

    // Box Textures
    const boxAmbientOcclusionTexture = loader.load(
      '/textures/rockPlanet/woodTextures/Wood_Crate_001_ambientOcclusion.jpg'
    );
    const boxColorTexture = loader.load('/textures/rockPlanet/woodTextures/Wood_Crate_001_basecolor.jpg');
    const boxDisplacementTexture = loader.load('/textures/rockPlanet/woodTextures/Wood_Crate_001_height.png');
    const boxNormalTexture = loader.load('/textures/rockPlanet/woodTextures/Wood_Crate_001_normal.jpg');
    const boxRoughnessTexture = loader.load('/textures/rockPlanet/woodTextures/Wood_Crate_001_roughness.jpg');

    this.boxTextureConfig = {
      map: boxColorTexture,
      aoMap: boxAmbientOcclusionTexture,
      displacementMap: boxDisplacementTexture,
      displacementScale: 0.01,
      normalMap: boxNormalTexture,
      roughnessMap: boxRoughnessTexture,
      transparent: true,
      opacity: 0.8,
    };
  }

  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();
    this.scoreKeeper.watchScore(this.currentGamePiece.mesh);
    this.updatePlaytime(elapsedTime);
    this.runGameUpdates(timeDelta, elapsedTime, -350, 200);
  }

  createStartingZone() {
    this.createStartingPlane();
    this.initializeTextures();
    this.createPlayer(get(GameStore).username);
  }

  createGameMap() {
    this.createEaseIn();
    this.createBounceClimb();
    this.createMaze();
    this.createTubingAlong();
    this.createLastClimb();
    this.createBounceToVictory();
  }

  createFinishZone() {
    const walls = [
      // Front
      {
        x: -1756,
        y: 0,
        z: 4350,
        h: 300,
        w: 1,
        d: 200,
      },
      //Back
      {
        x: -1756,
        y: 0,
        z: 4650,
        h: 300,
        w: 1,
        d: 200,
      },
      // Left
      {
        x: -1606,
        y: 0,
        z: 4500,
        h: 1,
        w: 300,
        d: 200,
      },
      // Right
      {
        x: -1906,
        y: 0,
        z: 4500,
        h: 1,
        w: 300,
        d: 200,
      },
    ];

    const platform = PlaneFactory.createPlane(
      getDimensions(300, 300, 1),
      this.material.getGlassMaterial(),
      getPosition(-1756, -100, 4500),
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

    this.scoreKeeper.createPrize(-1756, -85, 4500);
  }

  createStartingPlane() {
    // Rock Textures
    const rockAmbientOcclusionTexture = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/rockTextures/Rock012_1K_AmbientOcclusion.jpg');
    const rockColorTexture = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/rockTextures/Rock012_1K_Color.jpg');
    const rockDisplacementTexture = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/rockTextures/Rock012_1K_Displacement.jpg');
    const rockNormalTexture = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/rockTextures/Rock012_1K_Normal.jpg');
    const rockRoughnessTexture = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/rockTextures/Rock012_1K_Roughness.jpg');

    const plane: IDimension = { width: 200, height: 200, depth: 0.1 };
    const { mesh, body } = PlaneFactory.createPlane(
      plane,
      this.material.getRockMaterial(),
      { x: 0, y: 0, z: 0 },
      {
        map: rockColorTexture,
        aoMap: rockAmbientOcclusionTexture,
        displacementMap: rockDisplacementTexture,
        displacementScale: 1.1,
        normalMap: rockNormalTexture,
        roughnessMap: rockRoughnessTexture,
      }
    );

    this.scene.add(mesh);
    this.world.addBody(body);
    this.defaultConfig = {
      map: rockColorTexture,
      aoMap: rockAmbientOcclusionTexture,
      displacementMap: rockDisplacementTexture,
      displacementScale: 0.01,
      normalMap: rockNormalTexture,
      roughnessMap: rockRoughnessTexture,
      transparent: true,
      opacity: 0.6,
    };
  }

  createEaseIn() {
    const firstStraight = PlaneFactory.createPlane(
      getDimensions(40, 500, 1),
      this.material.getGlassMaterial(),
      getPosition(0, -1, -350),
      this.defaultConfig
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

    const firstBounceCorner = PlaneFactory.createPlane(
      getDimensions(45, 1, 10),
      this.material.getAdamantineMaterial(),
      getPosition(5, 5, -580),
      this.iceTextureConfig
    );
    firstBounceCorner.mesh.rotateZ(-Math.PI * 0.3);
    firstBounceCorner.body.quaternion.copy(firstBounceCorner.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(firstBounceCorner);

    const bounceText1 = new SpriteText('Bounce!', 5);
    bounceText1.position.set(0, 15, -580);
    this.scene.add(bounceText1);

    const secondStraight = PlaneFactory.createPlane(
      getDimensions(400, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-220, -1, -580),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(secondStraight);

    const ThirdStraight = PlaneFactory.createPlane(
      getDimensions(40, 430, 1),
      this.material.getGlassMaterial(),
      getPosition(-440, 0 - 1, -385),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(ThirdStraight);

    const secondLongGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 430, 20),
      this.material.getGlassMaterial(),
      getPosition(-460, 10, -385)
    );
    this.addToWorld(secondLongGlassWall);

    const secondBounceCorner = PlaneFactory.createPlane(
      getDimensions(45, 1, 10),
      this.material.getAdamantineMaterial(),
      getPosition(-441, 5, -586),
      this.iceTextureConfig
    );
    secondBounceCorner.mesh.rotateZ(Math.PI * 0.2);
    secondBounceCorner.body.quaternion.copy(secondBounceCorner.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(secondBounceCorner);

    const bounceText2 = new SpriteText('Bounce!', 5);
    bounceText2.position.set(-440, 15, -585);
    this.scene.add(bounceText2);

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

  createBounceClimb() {
    const climb = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-351, 40, -220),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(climb);
    this.addToWorld(climb);

    const firstStraight = PlaneFactory.createPlane(
      getDimensions(180, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-192, 80, -220),
      this.defaultConfig
    );
    this.addToWorld(firstStraight);

    const firstRamp = PlaneFactory.createPlane(
      getDimensions(40, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(-93, 85, -220),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(firstRamp);
    this.addToWorld(firstRamp);

    const bouncePad = PlatformFactory.createCylinderPlatform(
      getCylinderDimensions(20, 20, 2, 30),
      this.material.getAdamantineMaterial(),
      getPosition(80, 90, -220),
      this.iceTextureConfig
    );
    this.addToWorld(bouncePad);

    const secondRamp = PlaneFactory.createPlane(
      getDimensions(40, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(401, 75, -220),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(secondRamp);
    this.addToWorld(secondRamp);

    const secondStraight = PlaneFactory.createPlane(
      getDimensions(180, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(500, 70, -220),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(secondStraight);

    const firstElevatorGlassWall = PlaneFactory.createPlane(
      getDimensions(1, 40, 20),
      this.material.getGlassMaterial(),
      getPosition(591, 79, -220)
    );
    this.addToWorld(firstElevatorGlassWall);

    const secondElevatorGlassWall = PlaneFactory.createPlane(
      getDimensions(40, 1, 20),
      this.material.getGlassMaterial(),
      getPosition(571, 79, -200)
    );
    this.addToWorld(secondElevatorGlassWall);

    const elevator = PlaneFactory.createPlane(
      getDimensions(40, 40, 10),
      this.material.getGlassMaterial(),
      getPosition(570, 150, -260),
      this.boxTextureConfig
    );
    elevator.movementType = {
      start: 'sin',
      distance: 75,
      positionOffset: 140,
      speed: 0.8,
      direction: 'y',
    };
    this.addToWorld(elevator);
  }

  createMaze() {
    const walls = [
      // Front
      {
        x: 530,
        y: 310,
        z: -320,
        h: 160,
        w: 1,
        d: 180,
      },
      // Left
      {
        x: 449,
        y: 310,
        z: -499,
        h: 1,
        w: 360,
        d: 180,
      },
      // Right
      {
        x: 650,
        y: 310,
        z: -499,
        h: 1,
        w: 360,
        d: 180,
      },
      // Back
      {
        x: 590,
        y: 310,
        z: -680,
        h: 120,
        w: 1,
        d: 180,
      },
      // Roof
      {
        x: 550,
        y: 400,
        z: -499,
        h: 200,
        w: 360,
        d: 1,
      },
      // Exit 1
      {
        x: 490,
        y: 310,
        z: -721,
        h: 80,
        w: 1,
        d: 180,
      },
      // Exit 2
      {
        x: 530,
        y: 310,
        z: -701,
        h: 1,
        w: 40,
        d: 180,
      },
    ];

    for (const { x, y, z, h, w, d } of walls) {
      const wall = PlaneFactory.createPlane(
        getDimensions(h, w, d),
        this.material.getGlassMaterial(),
        getPosition(x, y, z),
        { color: 0x1987ee, transparent: true, opacity: 0.2 }
      );
      this.addToWorld(wall);
    }

    const mazeEntrance = PlaneFactory.createPlane(
      getDimensions(100, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(600, 219, -300),
      this.iceTextureConfig
    );
    this.addToWorld(mazeEntrance);

    const text = new SpriteText('Coin is king!', 6);
    text.position.set(575, 250, -300);
    this.scene.add(text);

    const firstCorridor = PlaneFactory.createPlane(
      getDimensions(40, 360, 1),
      this.material.getGlassMaterial(),
      getPosition(630, 219, -500),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(firstCorridor);

    const secondCorridor = PlaneFactory.createPlane(
      getDimensions(40, 360, 1),
      this.material.getGlassMaterial(),
      getPosition(590, 219, -500),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(secondCorridor);

    for (let i = 1; i < 5; i++) {
      const offset = i * 40;
      const longMazeWall = PlaneFactory.createPlane(
        getDimensions(120, 40, 1),
        this.material.getGlassMaterial(),
        getPosition(510, 219, -500 + offset),
        this.defaultConfig,
        this.scoreKeeper
      );
      this.addToWorld(longMazeWall);
    }

    const exitPlane = PlaneFactory.createPlane(
      getDimensions(120, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(510, 219, -580),
      this.defaultConfig
    );
    this.addToWorld(exitPlane);
    this.addToGui(exitPlane);

    // First set of maze walls
    for (let i = 1; i < 3; i++) {
      const offset = i * 40;
      const longMazeWall = PlaneFactory.createPlane(
        getDimensions(1, 320, 180),
        this.material.getGlassMaterial(),
        getPosition(530 + offset, 310, -560 + offset),
        this.defaultConfig
      );
      this.addToWorld(longMazeWall);
    }

    // Second set of maze walls
    for (let i = 1; i < 3; i++) {
      const offset = i * 40;
      const shortMazeWall = PlaneFactory.createPlane(
        getDimensions(80, 1, 180),
        this.material.getGlassMaterial(),
        getPosition(450 + offset, 310, -440 + offset),
        this.defaultConfig
      );
      this.addToWorld(shortMazeWall);
    }

    // Third set of maze walls
    for (let i = 1; i < 3; i++) {
      const offset = i * 40;
      const shortMazeWall = PlaneFactory.createPlane(
        getDimensions(80, 1, 180),
        this.material.getGlassMaterial(),
        getPosition(450 + offset, 310, -520 + offset),
        this.defaultConfig
      );
      this.addToWorld(shortMazeWall);
    }

    // Fourth set of maze walls
    for (let i = 1; i < 3; i++) {
      const offset = i * 40;
      const longMazeWall = PlaneFactory.createPlane(
        getDimensions(1, 160, 180),
        this.material.getGlassMaterial(),
        getPosition(450 + offset, 310, -640 + offset),
        this.defaultConfig
      );
      this.addToWorld(longMazeWall);
    }

    const secretShortCut = PlaneFactory.createPlane(
      getDimensions(40, 1, 80),
      this.material.getGlassMaterial(),
      getPosition(510, 260, -680),
      this.defaultConfig
    );
    this.addToWorld(secretShortCut);

    const mazeExit = PlaneFactory.createPlane(
      getDimensions(80, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(490, 219, -700),
      this.iceTextureConfig
    );
    this.addToWorld(mazeExit);
  }

  createTubingAlong() {
    const climb = PlaneFactory.createPlane(
      getDimensions(40, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(363, 270, -700),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(climb);
    this.addToWorld(climb);

    const obstacle = PlaneFactory.createPlane(
      getDimensions(20, 60, 20),
      this.material.getGlassMaterial(),
      getPosition(120, 390, -700),
      this.boxTextureConfig
    );
    obstacle.movementType = {
      start: 'sin',
      distance: 75,
      positionOffset: -700,
      speed: 1.2,
      direction: 'z',
    };
    this.addToWorld(obstacle);

    const plane = PlaneFactory.createPlane(
      getDimensions(600, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(-400, 375, -700),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(plane);

    for (let index = 1; index < 5; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenObstacles = 150;
      const obstacleCylinder = PlatformFactory.createCylinderPlatform(
        getCylinderDimensions(10, 10, 25, 20),
        this.material.getGlassMaterial(),
        getPosition(-800 + index * spaceBetweenObstacles, 400, -700),
        this.iceTextureConfig
      );
      obstacleCylinder.movementType = {
        start: direction,
        distance: 50,
        positionOffset: 350,
        speed: 0.8 + index * 0.1,
        direction: 'y',
      };
      this.addToWorld(obstacleCylinder);
    }

    const tube = TubeFactory.createCustomTube(
      getTorusrDimensions(100, 10, 18, 10, 3),
      this.material.getGlassMaterial(),
      getPosition(-675, 485, -700),
      this.defaultConfig
    );
    tube.mesh.rotateZ(-Math.PI * 0.5);
    tube.body.quaternion.copy(tube.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(tube);

    const secondPlane = PlaneFactory.createPlane(
      getDimensions(400, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(-420, 565, -700),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(secondPlane);

    const secondTube = TubeFactory.createCustomTube(
      getTorusrDimensions(100, 10, 18, 10, 3),
      this.material.getGlassMaterial(),
      getPosition(-230, 675, -700),
      this.defaultConfig
    );
    secondTube.mesh.rotateZ(Math.PI * 0.5);
    secondTube.body.quaternion.copy(secondTube.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(secondTube);

    const thirdPlane = PlaneFactory.createPlane(
      getDimensions(400, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(-500, 760, -700),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(thirdPlane);

    const thirdTubePartOne = TubeFactory.createCustomTube(
      getTorusrDimensions(100, 10, 18, 10, 1.65),
      this.material.getGlassMaterial(),
      getPosition(-690, 870, -700),
      this.defaultConfig
    );
    this.addToWorld(thirdTubePartOne);

    const thirdTubePartTwo = TubeFactory.createCustomTube(
      getTorusrDimensions(100, 10, 18, 10, 1.65),
      this.material.getGlassMaterial(),
      getPosition(-790, 875, -600),
      this.defaultConfig
    );
    thirdTubePartTwo.mesh.rotateZ(-Math.PI * 0.5);
    thirdTubePartTwo.mesh.rotateX(-Math.PI * 0.5);
    thirdTubePartTwo.body.quaternion.copy(thirdTubePartTwo.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(thirdTubePartTwo);

    const fourthPlane = PlaneFactory.createPlane(
      getDimensions(20, 400, 1),
      this.material.getGlassMaterial(),
      getPosition(-790, 950, -300),
      this.defaultConfig
    );
    this.addToWorld(fourthPlane);

    const thirdTube = TubeFactory.createCustomTube(
      getTorusrDimensions(100, 10, 18, 10, 1.65),
      this.material.getGlassMaterial(),
      getPosition(-890, 959, -100),
      this.defaultConfig
    );
    thirdTube.mesh.rotateY(Math.PI * 1.5);
    thirdTube.mesh.rotateX(Math.PI * 0.5);
    thirdTube.body.quaternion.copy(thirdTube.mesh.quaternion as unknown as CANNON.Quaternion);
    this.addToWorld(thirdTube);

    const fifthPlane = PlaneFactory.createPlane(
      getDimensions(300, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(-1030, 948, 0),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(fifthPlane);

    const ramp = PlaneFactory.createPlane(
      getDimensions(20, 20, 1),
      this.material.getGlassMaterial(),
      getPosition(-1189, 953, 0),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(ramp);
    this.addToWorld(ramp);
  }

  createLastClimb() {
    const firstRamp = PlaneFactory.createPlane(
      getDimensions(40, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(-1650, 1010, 0),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(firstRamp);
    this.addToWorld(firstRamp);

    const plane = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-1756, 1060, 0),
      this.defaultConfig
    );
    this.addToWorld(plane);

    const secondRamp = PlaneFactory.createPlane(
      getDimensions(40, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(-1756, 1110, 107),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpBack(secondRamp);
    this.addToWorld(secondRamp);

    const secondPlane = PlaneFactory.createPlane(
      getDimensions(40, 80, 1),
      this.material.getGlassMaterial(),
      getPosition(-1756, 1160, 234),
      this.defaultConfig
    );
    this.addToWorld(secondPlane);
  }

  createBounceToVictory() {
    const jump = PlaneFactory.createPlane(
      getDimensions(40, 30, 1),
      this.material.getGlassMaterial(),
      getPosition(-1756, 1168, 287),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpBack(jump);
    this.addToWorld(jump);

    for (let index = 1; index < 5; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenBouncePads = 400;
      const bouncePad = PlatformFactory.createCylinderPlatform(
        getCylinderDimensions(40, 40, 2, 30),
        this.material.getAdamantineMaterial(),
        getPosition(-1756, 1100, 170 + index * spaceBetweenBouncePads),
        this.iceTextureConfig
      );
      bouncePad.movementType = {
        start: direction,
        distance: 100,
        positionOffset: -1756,
        speed: 0.5,
        direction: 'x',
      };
      this.addToWorld(bouncePad);

      const tube = TubeFactory.createCustomTube(
        getTorusrDimensions(300, 30, 20, 10, 2.5),
        this.material.getGlassMaterial(),
        getPosition(-1756, 800, 2600),
        this.iceTextureConfig
      );
      tube.mesh.rotateY(Math.PI * 0.5);
      tube.body.quaternion.copy(tube.mesh.quaternion as unknown as CANNON.Quaternion);
      this.addToWorld(tube);
    }
  }
}

export default MineralWorld;
