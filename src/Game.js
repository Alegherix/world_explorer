import * as THREE from 'three';
import CANNON, { Vec3 } from 'cannon';

// Återanvänd samma Mesh & Material, i så hög utsträckning man kan, dvs om vi ska ta fram en ny fallande shape
// Använd en instans variabel av Mesh & Material,

class Game {
  constructor(scene, world, objectToUpdate, material, texture) {
    this.scene = scene;
    this.world = world;
    this.objectToUpdate = objectToUpdate;
    this.material = material;
    this.init();
  }

  init() {
    // Only instantiating a new TextureLoader temp,
    // Refactor to use the already created one.
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('textures/test/wobbly.jpg');
    this.standardMaterial = new THREE.MeshStandardMaterial({
      color: 'white',
      map: groundTexture,
    });

    // Geometries
    this.oBlockGeometry = new THREE.BoxBufferGeometry(10, 10, 10);
    this.iBlockGeometry = new THREE.BoxBufferGeometry(5, 20, 5);
  }

  createBlock(letter, position) {
    switch (letter) {
      case 'o':
        block = this.createOBlock(position);
        break;
      case 'i':
        block = new THREE.Mesh(this.iBlockGeometry, this.standardMaterial);
        break;
      default:
        break;
    }
  }

  createOBlock(position) {
    const mesh = new THREE.Mesh(this.oBlockGeometry, this.standardMaterial);
    mesh.castShadow = true;
    mesh.position.copy(position);
    this.scene.add(mesh);

    const boxShape = new CANNON.Box(new Vec3(5, 5, 5));
    const boxBody = new CANNON.Body({
      mass: 1,
      position: new Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material,
    });
    boxBody.position.copy(position);
    this.world.addBody(boxBody);

    this.objectToUpdate.push({ mesh, boxBody });
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
