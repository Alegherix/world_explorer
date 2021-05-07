import type * as CANNON from 'cannon-es';
import cannonDebugger from 'cannon-es-debugger';
import { Box3, Vector3 } from 'three';
import CoinFactory from '../components/CoinFactory';
/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */
import PlaneFactory from '../components/Plane';
import Ramp from '../components/Ramp';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import { getDimensions, getPosition } from '../utils/utils';
import type { IDimension } from './../../shared/interfaces';

class LavaWorld extends Game {
  coinFactory: CoinFactory;
  coins: THREE.Mesh[] = [];

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
    this.createStartingZone();
    this.createPlayer();
    this.createGameMap();
    this.coinFactory = new CoinFactory(this.scene);
    this.createGameCoins();
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
  }

  createStairs() {
    const hallway = PlaneFactory.createPlane(
      getDimensions(40, 320, 1),
      this.material.getGlassMaterial(),
      getPosition(0, 98, -505)
    );
    this.addToWorld(hallway);

    const stairs = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-89, 138, -646)
    );
    PlaneFactory.slopePlaneUpLeft(stairs);
    this.addToWorld(stairs);

    const firstRestPlane = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-179, 178, -646)
    );
    this.addToWorld(firstRestPlane);

    const secondStairs = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-179, 217, -560)
    );
    PlaneFactory.slopePlaneUpBack(secondStairs);
    this.addToWorld(secondStairs);

    const secondRestPlane = PlaneFactory.createPlane(
      getDimensions(40, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(-179, 257, -470)
    );
    this.addToWorld(secondRestPlane);

    const thirdStairs = PlaneFactory.createPlane(
      getDimensions(40, 160, 1),
      this.material.getGlassMaterial(),
      getPosition(-90, 297, -470)
    );
    PlaneFactory.slopePlaneUpRight(thirdStairs);
    this.addToWorld(thirdStairs);
  }

  createBridge() {
    const bridge = PlaneFactory.createPlane(
      getDimensions(220, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(90, 337, -470)
    );
    this.addToWorld(bridge);

    const bouncePlate = PlaneFactory.createPlane(
      getDimensions(80, 80, 1),
      this.material.getAdamantineMaterial(),
      getPosition(310, 250, -470)
    );
    this.addToWorld(bouncePlate);

    const secondBridge = PlaneFactory.createPlane(
      getDimensions(220, 40, 1),
      this.material.getGlassMaterial(),
      getPosition(550, 337, -470)
    );
    this.addToWorld(secondBridge);
  }

  createGameCoins() {
    for (let index = 1; index <= 10; index++) {
      this.coinFactory.createCoin(10, 10, 10 + index * 5);
      // this.coins.push(coin);
      // this.scene.add(coin);
    }
  }

  // Run all game related Logic inside here
  runGameLoop(timeDelta: number) {
    this.gameCamera.update();
    this.coinFactory.checkIfIntersects(this.currentGamePiece.mesh);
    // const coinBox = new Box3();

    // const characterBox = new Box3().setFromObject(this.currentGamePiece.mesh);
    // for (const coin of this.coins) {
    //   coinBox.setFromObject(coin);
    //   if (characterBox.intersectsBox(coinBox)) {
    //     this.scene.remove(coin);
    //   }
    // }

    for (const gamePiece of this.activeGamePieces) {
      gamePiece.mesh.position.copy(
        (gamePiece.body.position as unknown) as Vector3
      );
      gamePiece.mesh.quaternion.copy(
        (gamePiece.body.quaternion as unknown) as THREE.Quaternion
      );
    }
    this.world.step(1 / 100, timeDelta);
  }
}

export default LavaWorld;
