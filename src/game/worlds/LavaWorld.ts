/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */
import type * as CANNON from 'cannon-es';
import { get } from 'svelte/store';
import type { MeshStandardMaterialParameters } from 'three';
import GameStore from '../../shared/GameStore';
import PlaneFactory from '../components/Plane';
import Ramp from '../components/Ramp';
import ScoreKeeper from '../components/ScoreKeeper';
import TubeFactory from '../components/Tube';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import { getDimensions, getPosition } from '../utils/utils';
import type { IDimension } from './../../shared/interfaces';
import SpriteText from 'three-spritetext';

import LoaderStore from '../../shared/LoaderStore';

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
    super(scene, world, loader, material, camera, 'lava.jpg', 'lava', '.png');
    this.bouncePadConfig = get(LoaderStore).loader.getLavaWorldBouncepad();
    this.defaultConfig = get(LoaderStore).loader.getLavaWorldPlaneConfig();
    this.scoreKeeper = new ScoreKeeper(this.scene);
    this.createStartingZone();
    this.createGameMap();
    this.createFinishZone();
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number, elapsedTime: number) {
    if (!this.useOrbitCamera) this.gameCamera.update();
    this.scoreKeeper.watchScore(this.currentGamePiece.mesh);
    this.updatePlaytime(elapsedTime);
    this.runGameUpdates(timeDelta, elapsedTime, -450, 200);
  }

  createGameMap() {
    this.createStairs();
    this.createBridge();
    this.createTube();
    this.createHallwayOfSuprises();
    this.createBounceWayToHeaven();
    this.createHeavenMaze();
    this.createHeavenStairway();
    this.createSpinTraps();
  }

  createFinishZone() {
    const walls = [
      {
        x: 1016,
        y: 2095,
        z: -840,
        h: 300,
        w: 1,
        d: 200,
      },
      {
        x: 1016,
        y: 2095,
        z: -540,
        h: 300,
        w: 1,
        d: 200,
      },
      {
        x: 1016,
        y: 2195,
        z: -690,
        h: 300,
        w: 300,
        d: 1,
      },
      {
        x: 866,
        y: 2095,
        z: -690,
        h: 1,
        w: 300,
        d: 200,
      },
    ];

    const platform = PlaneFactory.createPlane(
      getDimensions(300, 300, 1),
      this.material.getGlassMaterial(),
      getPosition(1016, 1995, -690),
      this.defaultConfig
    );
    this.addToWorld(platform);

    for (const { x, y, z, h, w, d } of walls) {
      const firstWall = PlaneFactory.createPlane(
        getDimensions(h, w, d),
        this.material.getGlassMaterial(),
        getPosition(x, y, z),
        { color: 0x1987ee, transparent: true, opacity: 0.4 }
      );
      this.addToWorld(firstWall);
    }

    this.scoreKeeper.createPrize(1016, 2015, -690);
  }

  createStartingZone() {
    this.createPlayer(get(GameStore).username);
    this.createStartingPlane();
    new Ramp(this.world, this.scene, this.material);
  }

  createStartingPlane() {
    const basePlane: IDimension = { width: 200, height: 200, depth: 0.1 };
    const { mesh, body } = PlaneFactory.createPlane(
      basePlane,
      this.material.getRockMaterial(),
      { x: 0, y: 0, z: 0 },
      this.bouncePadConfig
    );
    this.scene.add(mesh);
    this.world.addBody(body);
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
    }

    const hallwayStairs = PlaneFactory.createPlane(
      getDimensions(60, 180, 1),
      this.material.getGlassMaterial(),
      getPosition(3275, 245, -470),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpRight(hallwayStairs);
    this.addToWorld(hallwayStairs);

    const bouncePlate = PlaneFactory.createPlane(
      getDimensions(80, 80, 1),
      this.material.getAdamantineMaterial(),
      getPosition(3395, 290, -470),
      this.bouncePadConfig
    );
    this.addToWorld(bouncePlate);

    const text = new SpriteText('Bounce', 12);
    text.position.set(3395, 300, -470);
    this.scene.add(text);
  }

  createBounceWayToHeaven() {
    const platform = PlaneFactory.createPlane(
      getDimensions(100, 100, 1),
      this.material.getAdamantineMaterial(),
      getPosition(3400, 550, -700),
      this.defaultConfig
    );
    this.addToWorld(platform);

    const platform2 = PlaneFactory.createPlane(
      getDimensions(100, 100, 1),
      this.material.getAdamantineMaterial(),
      getPosition(3200, 800, -700),
      this.defaultConfig
    );
    this.addToWorld(platform2);

    const platform3 = PlaneFactory.createPlane(
      getDimensions(100, 100, 1),
      this.material.getGlassMaterial(),
      getPosition(2700, 1200, -700),
      this.defaultConfig
    );
    this.addToWorld(platform3);
  }

  createHeavenMaze() {
    // getPosition(2700, 1200, -700),
    const platform = PlaneFactory.createPlane(
      getDimensions(50, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(2700, 1200, -850),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(platform);

    const platform2 = PlaneFactory.createPlane(
      getDimensions(300, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(2575, 1200, -1000),
      this.defaultConfig,
      this.scoreKeeper
    );
    this.addToWorld(platform2);

    const elevator = PlaneFactory.createPlane(
      getDimensions(40, 40, 250),
      this.material.getGlassMaterial(),
      getPosition(2400, 1200, -1000),
      this.defaultConfig
    );
    elevator.movementType = {
      start: 'sin',
      direction: 'y',
      distance: 200,
      positionOffset: 1272,
      speed: 0.4,
    };
    this.addToWorld(elevator);
  }

  // Create config object and loop out from it instead
  createHeavenStairway() {
    const platform = PlaneFactory.createPlane(
      getDimensions(50, 50, 1),
      this.material.getGlassMaterial(),
      getPosition(2355, 1595, -1000),
      this.defaultConfig
    );
    this.addToWorld(platform);

    const stairway = PlaneFactory.createPlane(
      getDimensions(50, 300, 1),
      this.material.getGlassMaterial(),
      getPosition(2355, 1670, -845),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpBack(stairway);
    this.addToWorld(stairway);

    const platform2 = PlaneFactory.createPlane(
      getDimensions(50, 50, 1),
      this.material.getGlassMaterial(),
      getPosition(2355, 1745, -690),
      this.defaultConfig
    );
    this.addToWorld(platform2);

    const stairway2 = PlaneFactory.createPlane(
      getDimensions(50, 300, 1),
      this.material.getGlassMaterial(),
      getPosition(2200, 1820, -690),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(stairway2);
    this.addToWorld(stairway2);

    const platform3 = PlaneFactory.createPlane(
      getDimensions(50, 50, 1),
      this.material.getGlassMaterial(),
      getPosition(2045, 1895, -690),
      this.defaultConfig
    );
    this.addToWorld(platform3);
  }

  createSpinTraps() {
    for (let index = 1; index < 4; index++) {
      const positionOffset = index * 200;
      const platform = PlaneFactory.createPlane(
        getDimensions(200, 50, 1),
        this.material.getGlassMaterial(),
        getPosition(2120 - positionOffset, 1895, -690),
        this.defaultConfig
      );
      platform.movementType = {
        start: 'sin',
        direction: 'z',
        distance: 20,
        positionOffset: -690,
        speed: 0.02,
      };
      platform.mesh.name = 'test';
      this.movingPieces.push(platform);
      this.addToWorld(platform);
    }

    const platform = PlaneFactory.createPlane(
      getDimensions(80, 100, 1),
      this.material.getGlassMaterial(),
      getPosition(1380, 1895, -690),
      this.defaultConfig
    );
    this.addToWorld(platform);

    const stairs = PlaneFactory.createPlane(
      getDimensions(40, 200, 1),
      this.material.getGlassMaterial(),
      getPosition(1253, 1945, -690),
      this.defaultConfig
    );
    PlaneFactory.slopePlaneUpLeft(stairs);
    this.addToWorld(stairs);
  }
}

export default LavaWorld;
