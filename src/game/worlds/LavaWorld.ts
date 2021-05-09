import cannonDebugger from 'cannon-es-debugger';
import type * as CANNON from 'cannon-es';
import type { MeshStandardMaterialParameters, Vector3 } from 'three';
/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */
import PlaneFactory from '../components/Plane';
import Ramp from '../components/Ramp';
import ScoreKeeper from '../components/ScoreKeeper';
import TubeFactory from '../components/Tube';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import ThirdPersonCamera from '../utils/ThirdPersonCamera';
import { getDimensions, getPosition } from '../utils/utils';
import type { IDimension } from './../../shared/interfaces';
import type { Vec3 } from 'cannon-es';
import PushBlock from '../components/PushBlock';

class LavaWorld extends Game {
  private scoreKeeper: ScoreKeeper;
  private defaultConfig: MeshStandardMaterialParameters;
  private bouncePadConfig: MeshStandardMaterialParameters;
  private pushBlocks: PushBlock[] = [];

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
    this.initializeTextures();
    this.createStartingZone();
    this.createPlayer();
    this.createGameMap();
    this.createTube();
    this.createElevator();
    this.createHallwayOfSuprises();
    this.createPushBlocks();
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

  createGameMap() {
    this.createStairs();
    this.createBridge();
  }

  createFinishZone() {
    throw new Error('Method not implemented.');
  }

  createStartingZone() {
    new Ramp(this.world, this.scene, this.material);
    this.createStartingPlane();
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

  createPushBlocks() {
    const pushBlock1 = new PushBlock(
      getDimensions(200, 80, 80),
      this.material,
      getPosition(2480, 640, -800),
      this.defaultConfig,
      true
    );
    this.addToWorld(pushBlock1.getBlock());
    this.pushBlocks.push(pushBlock1);

    const pushBlock2 = new PushBlock(
      getDimensions(200, 80, 80),
      this.material,
      getPosition(2480, 640, -1000),
      this.defaultConfig,
      false
    );
    this.addToWorld(pushBlock2.getBlock());
    this.pushBlocks.push(pushBlock2);
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    this.gameCamera.update();
    this.scoreKeeper.watchScore(this.currentGamePiece.mesh);
    this.updatePlaytime(elapsedTime);

    for (const pushBlock of this.pushBlocks) {
      pushBlock.moveBlock(elapsedTime);
    }

    for (const gamePiece of this.activeGamePieces) {
      gamePiece.mesh.position.copy(
        (gamePiece.body.position as unknown) as Vector3
      );
      gamePiece.mesh.quaternion.copy(
        (gamePiece.body.quaternion as unknown) as THREE.Quaternion
      );
    }
    // this.movePushBlocks(timeDelta);
    this.world.step(1 / 100, timeDelta);
  }

  createHallwayOfSuprises() {
    const hallway = PlaneFactory.createPlane(
      getDimensions(60, 500, 1),
      this.material.getGlassMaterial(),
      getPosition(2480, 600, -800),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(hallway);
  }
}

export default LavaWorld;
