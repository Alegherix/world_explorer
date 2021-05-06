/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */

import type Material from '../utils/Materials';
import Game from '../Game';
import type Loader from '../utils/Loader';

class LavaWorld extends Game {
  createGameMap() {
    throw new Error('Method not implemented.');
  }
  createFinishZone() {
    throw new Error('Method not implemented.');
  }
  createStartingZone() {
    // throw new Error('Method not implemented.');
  }

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    loader: Loader,
    material: Material,
    camera: THREE.PerspectiveCamera
  ) {
    super(scene, world, loader, material, camera, 'lava.jpg', 'lava', '.png');
    this.createStartingZone();
    this.createPlayer();
  }
}

export default LavaWorld;
