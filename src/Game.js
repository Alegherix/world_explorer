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

    this.winObject = this.createWinObject();
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
    mesh.name = 'falling';
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

    // Updates cube when idle, should be used later down the road
    // For knowing when we can start generating new cubes from within Gameloop
    boxBody.addEventListener(
      'sleep',
      (event) => {
        const elementToHaveNameChanged = this.objectToUpdate.find(
          (item) => item.boxBody === event.target
        );
        elementToHaveNameChanged.mesh.name = 'idle';
      },
      { once: true }
    );
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

  createWinObject() {
    const winMaterial = new THREE.MeshStandardMaterial({
      color: 'rgb(80,210,65',
      transparent: true,
      opacity: 0.4,
    });
    const winGeometry = new THREE.BoxBufferGeometry(100, 10, 10, 4, 4);
    const winMesh = new THREE.Mesh(winGeometry, winMaterial);
    winGeometry.computeBoundingBox();
    winMesh.position.set(0, 5, 0);
    winMesh.name = 'winMesh';

    const box = new THREE.Box3();
    box.setFromObject(winMesh);

    const winObject = {
      mesh: winMesh,
      box,
    };
    return winObject;
  }

  getWinObject() {
    return this.winObject;
  }
}

export default Game;

// TODO -> Gör så att när alla delar är idle, så startar själva gameloopens uträkningar
// TODO -> Uträkningar är b.la Kolla om Deras bounding box ligger inuti winZoneBox,
// TODO -> Om så är fallet, Beräkna den totala volymen av varje Box som ligger inuti Winzone,
// TODO -> Därefter om volymen > 80% av winzone, gör en clean removal av alla objekt som ligger inuti winzone,
// TODO -> Uppdatera sedan score till antalet objekt som fanns inuti winzone innan vi tog bort dem
