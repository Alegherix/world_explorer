import * as THREE from 'three';
import CANNON from 'cannon';

class Game {
  constructor() {}

  getPhysicsSphere(material) {
    const sphereShape = new CANNON.Sphere(0.5);
    const sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 10, 0),
      shape: sphereShape,
      material,
    });
    return sphereBody;
  }

  getTetrisSphere() {
    const sphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 'pink',
      })
    );
    sphere.name = 'tetrisSphere';
    return sphere;
  }

  getOBlock() {
    const geometry = new THREE.Mesh(
      new THREE.BoxBufferGeometry(10, 10, 10, 2, 2),
      new THREE.MeshStandardMaterial({
        color: 'cyan',
        // wireframe: true,
      })
    );
    geometry.name = 'piece';
    geometry.position.set(5, 5, 0);
    return geometry;
  }

  getIBlock() {
    const geometry = new THREE.Mesh(
      new THREE.BoxBufferGeometry(5, 20, 5, 2, 2),
      new THREE.MeshStandardMaterial({
        color: 'purple',
        // wireframe: true,
      })
    );
    geometry.name = 'piece';
    geometry.position.set(20, 10, 0);
    return geometry;
  }

  getBounds(x) {
    const height = 160;
    const geometry = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, height, 1),
      new THREE.MeshStandardMaterial({
        color: 'red',
        transparent: true,
        opacity: 0.5,
      })
    );
    geometry.position.set(x, height / 2, 0);
    geometry.name = 'GameBounds';
    return geometry;
  }

  getTetrisPieces(scene) {
    const pieces = scene.children.filter((child) => child.name === 'piece');
    console.log(pieces);
  }
}

export default Game;
