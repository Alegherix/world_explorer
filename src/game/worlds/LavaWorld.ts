import type { IDimension } from './../../shared/interfaces';
/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */

import PlaneFactory from '../components/Plane';
import Ramp from '../components/Ramp';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';
import type * as CANNON from 'cannon-es';
import cannonDebugger from 'cannon-es-debugger';
import { getDimensions, getPosition } from '../utils/utils';

class LavaWorld extends Game {
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
  }

  createGameMap() {
    this.createStairs();
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
  }
}

export default LavaWorld;
