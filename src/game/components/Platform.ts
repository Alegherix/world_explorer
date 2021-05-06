import * as THREE from 'three';
import { MeshPhongMaterial, Object3D } from 'three';
import CANNON, { Vec3 } from 'cannon';
import type Material from '../utils/Materials';

class Platform {
  constructor(private world: CANNON.World, private scene: THREE.Scene, private material: Material) {
    this.world = world;
    this.scene = scene;
    this.material = material;

    this.createPlatform();
    this.createRandomPlatforms();
  }

  createPlatform() {
    const randomColor = () => {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return '#' + n.slice(0, 6);
    };

    const geometry = new THREE.CylinderBufferGeometry(20, 20, 4, 32);
    const material = new THREE.MeshPhongMaterial({
      color: randomColor(),
      emissive: 0x0,
      shininess: 40,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-150, 10, -20);

    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const shape = new CANNON.Cylinder(20, 20, 4, 32);
    const body = new CANNON.Body({
      mass: 0,
      shape,
      material: this.material.getSpungeMaterial(),
    });

    body.position.copy((mesh.position as unknown) as Vec3);
    this.world.addBody(body);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
  }

  createRandomPlatforms() {
    const randomPlatforms = new THREE.Group();
    this.scene.add(randomPlatforms);

    const randomColor = () => {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return '#' + n.slice(0, 6);
    };

    for (let i = 0; i < 40; i++) {
      const geometry = new THREE.CylinderBufferGeometry(20, 20, 4, 32);
      const material = new MeshPhongMaterial({
        color: randomColor(),
        emissive: 0x0,
        shininess: 40,
      });

      const x = Math.random() * 501 - 250;
      const y = Math.random() * 101 - 50;
      const z = Math.random() * 1100 - 1701;

      const randomPlatform = new THREE.Mesh(geometry, material);
      randomPlatform.position.set(x, y, z);
      randomPlatforms.add(randomPlatform);

      const cylinderShape = new CANNON.Cylinder(20, 20, 4, 32);
      const body = new CANNON.Body({
        mass: 0,
        shape: cylinderShape,
        material: this.material.getSpungeMaterial(),
      });
      body.position.copy((randomPlatform.position as unknown) as Vec3);
      this.world.addBody(body);
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
    }
  }
}

export default Platform;
