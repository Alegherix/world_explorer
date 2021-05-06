import CANNON, { Vec3 } from 'cannon';
import * as THREE from 'three';
import type Material from '../utils/Materials';

class Ramp {
  constructor(
    private world: CANNON.World,
    private scene: THREE.Scene,
    private material: Material
  ) {
    this.world = world;
    this.scene = scene;
    this.material = material;

    this.createRamp();
    this.createRampLights(-50);
    this.createRampLights(50);
    this.createRampMiddleLight(20, -135);
    this.createRampMiddleLight(49, -185);
    this.createRampMiddleLight(78, -235);
  }

  createRamp() {
    const geometry = new THREE.BoxBufferGeometry(100, 200, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 'rgb(0,12,64)',
      transparent: true,
      opacity: 0.4,
    });
    const ramp = new THREE.Mesh(geometry, material);
    ramp.position.set(0, 48, -185);
    ramp.rotation.x = -Math.PI / 3;
    this.scene.add(ramp);

    const shape = new CANNON.Box(new Vec3(50, 100, 1));
    const body = new CANNON.Body({
      mass: 0,
      shape,
      material: this.material.getGlassMaterial(),
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 3);
    body.position.copy((ramp.position as unknown) as Vec3);
    this.world.addBody(body);
  }

  createRampLights(x: number) {
    const geometry = new THREE.BoxBufferGeometry(5, 200, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0xddc707,
      transparent: true,
      opacity: 0.8,
    });
    const light = new THREE.Mesh(geometry, material);
    light.position.set(x, 49, -185);
    light.rotation.x = -Math.PI / 3;

    this.scene.add(light);
  }

  createRampMiddleLight(y: number, z: number) {
    const geometry = new THREE.BoxBufferGeometry(5, 20, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xddc707,
      transparent: true,
      opacity: 0.8,
    });
    const light = new THREE.Mesh(geometry, material);
    light.position.set(0, y, z);
    light.rotation.x = -Math.PI / 3;

    this.scene.add(light);
  }
}

export default Ramp;
