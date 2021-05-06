/**
 * @desc Used for creating the Lava game world, hopefully something pretty cool with fire?
 */

// import CANNON from 'cannon';
// import * as THREE from 'three';
import PlaneFactory from '../components/Plane';
import Ramp from '../components/Ramp';
import Game from '../Game';
import type Loader from '../utils/Loader';
import type Material from '../utils/Materials';

class LavaWorld extends Game {
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
    const { mesh, body } = PlaneFactory.createPlane(
      200,
      200,
      0.1,
      {
        map,
        roughnessMap,
        normalMap,
        displacementMap,
        displacementScale: 1.1,
        emissiveMap,
        emissiveIntensity: 2,
      },
      this.material.getRockMaterial()
    );
    this.scene.add(mesh);
    this.world.addBody(body);
  }

  createStairs() {
    const { mesh, body } = PlaneFactory.createPlane(
      40,
      320,
      1,
      { color: 'rgb(0,12,64)', transparent: true, opacity: 0.4 },
      this.material.getGlassMaterial(),
      { x: 0, y: 98, z: -505 }
    );
    console.log(body);

    this.scene.add(mesh);
    this.world.addBody(body);
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
    this.createGameMap();
  }
}

export default LavaWorld;
