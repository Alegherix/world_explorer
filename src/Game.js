import * as THREE from 'three';
import CANNON, { Vec3 } from 'cannon';

// Återanvänd samma Mesh & Material, i så hög utsträckning man kan, dvs om vi ska ta fram en ny fallande shape
// Använd en instans variabel av Mesh & Material,

class Game {
  constructor() {
    this.init();
  }

  init() {
    this.standardMaterial = new THREE.MeshStandardMaterial({
      color: 'cyan',
    });

    // Geometries
    this.oBlockGeometry = new THREE.BoxBufferGeometry(10, 10, 10, 2, 2);
    this.iBlockGeometry = new THREE.BoxBufferGeometry(5, 20, 5, 2, 2);
  }

  // getPhysicsSphere(material) {
  //   const sphereShape = new CANNON.Sphere(0.5);
  //   const sphereBody = new CANNON.Body({
  //     mass: 1,
  //     position: new CANNON.Vec3(0, 10, 0),
  //     shape: sphereShape,
  //     material,
  //   });
  //   return sphereBody;
  // }

  // getTetrisSphere() {
  //   const sphere = new THREE.Mesh(
  //     new THREE.SphereBufferGeometry(0.5, 32, 32),
  //     new THREE.MeshStandardMaterial({
  //       color: 'pink',
  //     })
  //   );
  //   sphere.name = 'tetrisSphere';
  //   return sphere;
  // }

  getBlock(letter) {
    let block;
    switch (letter) {
      case 'o':
        block = this.getOBlock();
        break;
      case 'i':
        block = new THREE.Mesh(this.iBlockGeometry, this.standardMaterial);
        break;
      default:
        break;
    }
    block.name = 'piece';
    return block;
  }

  getOBlockPhysics() {
    const boxShape = new CANNON.Box(new Vec3(5, 5, 5));
    const boxBody = new CANNON.Body({
      mass: 1,
      position: new Vec3(5, 160, 0),
      shape: boxShape,
    });
    return boxBody;
  }

  getOBlock() {
    const geometry = new THREE.Mesh(this.oBlockGeometry, this.standardMaterial);
    geometry.name = 'piece';
    return geometry;
  }

  // Get Sets the outer edges of the playing field
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

  // Used for deciding which pieces can be removed
  getTetrisPieces(scene) {
    const pieces = scene.children.filter((child) => child.name === 'piece');
    console.log(pieces);
  }
}

export default Game;
