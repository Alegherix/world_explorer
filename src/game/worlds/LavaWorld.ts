/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */

import type * as CANNON from 'cannon-es';
import cannonDebugger from 'cannon-es-debugger';
import type { MeshStandardMaterialParameters } from 'three';
import PlaneFactory from '../components/Plane';
import Ramp from '../components/Ramp';
import ScoreKeeper from '../components/ScoreKeeper';
import TubeFactory from '../components/Tube';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import { getDimensions, getPosition } from '../utils/utils';
import type { IDimension } from './../../shared/interfaces';

class LavaWorld extends Game {
  private scoreKeeper: ScoreKeeper;
  private defaultConfig: MeshStandardMaterialParameters;
  private bouncePadConfig: MeshStandardMaterialParameters;

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
      'lava.jpg',
      'lava',
      '.png'
      // true
    );
    cannonDebugger(this.scene, this.world.bodies);
    this.scoreKeeper = new ScoreKeeper(this.scene);

    this.createStartingZone();
    this.createGameMap();
  }

  initializeTextures() {
    const loader = this.loader.getTextureLoader();
    const map = loader.load('/textures/lavaPlanet/MP_color.jpg');
    const normal = loader.load('/textures/lavaPlanet/MP_normal.jpg');
    const displacement = loader.load('/textures/lavaPlanet/MP_height.png');
    const ambientocclusion = loader.load('/textures/lavaPlanet/MP_ao.jpg');
    const metallic = loader.load('/textures/lavaPlanet/MP_metallic.jpg');
    const roughness = loader.load('/textures/lavaPlanet/MP_roughness.jpg');

    this.bouncePadConfig = {
      map,
      normalMap: normal,
      displacementMap: displacement,
      aoMap: ambientocclusion,
      roughnessMap: roughness,
      metalnessMap: metallic,
    };
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();
    this.scoreKeeper.watchScore(this.currentGamePiece.mesh);
    this.updatePlaytime(elapsedTime);

    for (const gamePiece of this.activeGamePieces) {
      this.move(gamePiece, elapsedTime);
    }

    this.world.step(1 / 100, timeDelta);
  }

  createGameMap() {
    this.createStairs();
    this.createBridge();
    this.createTube();
    // this.createElevator();
    this.createHallwayOfSuprises();
    this.createPushBlocks();
  }

  createFinishZone() {
    throw new Error('Method not implemented.');
  }

  createStartingZone() {
    this.initializeTextures();
    this.createPlayer();
    this.createStartingPlane();
    new Ramp(this.world, this.scene, this.material);
  }

  createStartingPlane() {
    const map = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Color.jpg');
    const emissiveMap = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
    const displacementMap = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Displacement.jpg');
    const normalMap = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Normal.jpg');
    const roughnessMap = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Roughness.jpg');

    const basePlane: IDimension = { width: 200, height: 200, depth: 0.1 };
    const { mesh, body } = PlaneFactory.createPlane(
      basePlane,
      this.material.getRockMaterial(),
      { x: 0, y: 0, z: 0 },
      {
        map,
        roughnessMap,
        normalMap,
        displacementMap,
        displacementScale: 1.1,
        emissiveMap,
        emissiveIntensity: 2,
      }
    );
    this.scene.add(mesh);
    this.world.addBody(body);
    this.defaultConfig = {
      map,
      roughnessMap,
      normalMap,
      displacementMap,
      displacementScale: 1.1,
      emissiveMap,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.6,
    };
  }

  createStairs() {
    const hallway = PlaneFactory.createPlane(
      getDimensions(40, 320, 1),
      this.material.getGlassMaterial(),
      getPosition(0, 98, -505),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(hallway);

    const stairs = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-89, 138, -646),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(stairs);
    this.addToWorld(stairs);

    const firstRestPlane = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-179, 178, -646),
      this.defaultConfig
    );
    this.addToWorld(firstRestPlane);

    const secondStairs = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-179, 217, -560),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpBack(secondStairs);
    this.addToWorld(secondStairs);

    const secondRestPlane = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-179, 257, -470),
      this.defaultConfig
    );
    this.addToWorld(secondRestPlane);

    const thirdStairs = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-90, 297, -470),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(thirdStairs);
    this.addToWorld(thirdStairs);
  }

  createBridge() {
    const bridge = PlaneFactory.createPlane(
      getDimensions(220, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(90, 337, -470),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(bridge);

    const bouncePlate = PlaneFactory.createPlane(
      getDimensions(80, 80, 1),
      this.material.getAdamantineMaterial(),
      getPosition(310, 250, -470),
      this.bouncePadConfig
    );
    bouncePlate.movementType = {
      start: 'sin',
      distance: 100,
      positionOffset: -470,
      speed: 0.5,
      direction: 'z',
    };
    this.activeGamePieces.push(bouncePlate);
    this.addToWorld(bouncePlate);

    const secondBridge = PlaneFactory.createPlane(
      getDimensions(220, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(550, 337, -470),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(secondBridge);
  }

  createTube() {
    const tube = TubeFactory.createTube(
      this.material.getGlassMaterial(),
      getPosition(1400, 0, -470),
      this.defaultConfig
    );
    this.addToWorld(tube);
  }

  createElevator() {
    const backplate = PlaneFactory.createPlane(
      getDimensions(1, 360, 360),
      this.material.getGlassMaterial(),
      getPosition(2600, 300, -470),
      this.defaultConfig
    );
    this.addToWorld(backplate);

    const fallbackBlock = PlaneFactory.createPlane(
      getDimensions(80, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(2400, 240, -470),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(fallbackBlock);
    this.addToWorld(fallbackBlock);

    const jumpBlock = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getMithrilMaterial(),
      getPosition(2480, 200, -470),
      this.bouncePadConfig
    );
    this.addToWorld(jumpBlock);
  }

  createPushBlocks() {}

  createHallwayOfSuprises() {
    const hallway = PlaneFactory.createPlane(
      getDimensions(600, 60, 1),
      this.material.getGlassMaterial(),
      getPosition(2900, 200, -470),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(hallway);

    // Create 3 Blocks above the hallway
    for (let index = 1; index < 4; index++) {
      let direction: 'sin' | 'cos' = index % 2 === 0 ? 'sin' : 'cos';
      const spaceBetweenBlocks = 150;
      const pb = PlaneFactory.createPlane(
        getDimensions(80, 200, 80),
        this.material.getGlassMaterial(),
        getPosition(2600 + index * spaceBetweenBlocks, 240, -470),
        this.defaultConfig
      );
      pb.movementType = {
        start: direction,
        distance: 200,
        positionOffset: -470,
        speed: 0.5,
        direction: 'z',
      };
      this.addToWorld(pb);
      this.activeGamePieces.push(pb);
    }
  }
}

export default LavaWorld;
