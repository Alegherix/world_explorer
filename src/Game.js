import * as THREE from 'three';
import CANNON, { Vec3 } from 'cannon';
import config from './utils';
import { CylinderBufferGeometry, MeshPhongMaterial } from 'three';
const {
  WINZONE_DEPTH,
  WINZONE_HEIGHT,
  WINZONE_WIDTH,
  BLOCK_DEPTH,
  WIN_PERCENTAGE_LIMIT,
} = config;

// Återanvänd samma Mesh & Material, i så hög utsträckning man kan, dvs om vi ska ta fram en ny fallande shape
// Använd en instans variabel av Mesh & Material,

class Game {
  constructor(scene, world, activeCubes, material, spungeMaterial) {
    this.scene = scene;
    this.world = world;
    this.activeCubes = activeCubes;
    this.material = material;
    this.spungeMaterial = spungeMaterial;
    this.init();
    this.activeCubes;
    window.addEventListener('keydown', this.steerDebugBox.bind(this));
  }

  init() {
    // Only instantiating a new TextureLoader temp,
    // Refactor to use the already created one.
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('textures/test/wobbly.jpg');
    this.standardMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    // Geometries
    this.oBlockGeometry = new THREE.BoxBufferGeometry(10, 10, BLOCK_DEPTH);
    this.iBlockGeometry = new THREE.BoxBufferGeometry(5, 20, 5);

    this.winObject = this.createWinObject();
    this.createBounceArea();
  }

  createOBlock(position) {
    const mesh = new THREE.Mesh(this.oBlockGeometry, this.standardMaterial);
    mesh.castShadow = true;
    console.log(position);
    mesh.position.copy(position);
    mesh.name = 'falling';
    this.scene.add(mesh);

    const boxShape = new CANNON.Box(new Vec3(5, 5, 5));
    const body = new CANNON.Body({
      mass: 1,
      position: new Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material,
    });
    body.position.copy(position);
    this.world.addBody(body);
    this.activeCubes.push({ mesh, body });
    this.activeCube = { mesh, body };

    // Updates cube when idle, should be used later down the road
    // For knowing when we can start generating new cubes from within Gameloop
    // body.addEventListener(
    //   'sleep',
    //   (event) => {
    //     const elementToHaveNameChanged = this.activeCubes.find(
    //       (item) => item.boxBody === event.target
    //     );
    //     elementToHaveNameChanged.mesh.name = 'idle';
    //   },
    //   { once: true }
    // );
  }

  createBounceArea() {
    const geometry = new THREE.CylinderBufferGeometry(5, 5, 4, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x49ef4,
      emissive: 0x0,
      shininess: 40,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.set(0, 2, 0);
    this.scene.add(mesh);

    const cylinderShape = new CANNON.Cylinder(5, 5, 4, 32);
    const body = new CANNON.Body({
      mass: 0,
      shape: cylinderShape,
      material: this.spungeMaterial,
    });
    body.position.copy(mesh.position);
    this.world.addBody(body);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
    // this.activeCubes.push({ mesh, body });
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

  // Used for creating a mesh and boundingBox for checking intersections
  createWinObject() {
    const winMaterial = new THREE.MeshStandardMaterial({
      color: 'rgb(80,210,65)',
      transparent: true,
      opacity: 0.4,
    });
    const winGeometry = new THREE.BoxBufferGeometry(
      WINZONE_WIDTH,
      WINZONE_HEIGHT,
      WINZONE_WIDTH,
      4,
      4
    );
    const winMesh = new THREE.Mesh(winGeometry, winMaterial);
    winGeometry.computeBoundingBox();
    winMesh.position.set(-75, 5, -75);
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

  steerDebugBox(event) {
    switch (event.key) {
      case 'a':
        this.activeCube.mesh.position.x -= 3;
        this.activeCube.body.position.copy(this.activeCube.mesh.position);
        break;
        break;

      case 'd':
        this.activeCube.mesh.position.x += 3;
        this.activeCube.body.position.copy(this.activeCube.mesh.position);
        break;

      case 'w':
        this.activeCube.mesh.position.z -= 3;
        this.activeCube.body.position.copy(this.activeCube.mesh.position);
        break;

      case 's':
        this.activeCube.mesh.position.z += 3;
        this.activeCube.body.position.copy(this.activeCube.mesh.position);
        break;
    }
  }
}

export default Game;
