import CANNON, { Vec3 } from 'cannon';
import * as THREE from 'three';
import type { Vector3 } from 'three';
import BlockGeometry from './BlockGeometry';
import type { IGamePiece, IPosition } from './interfaces';
import type Loader from './Loader';
import type Material from './Materials';
import config from './utils';
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
  private material: Material;
  private loader: Loader;
  private blockGeometry: BlockGeometry;
  private activeGamePieces: IGamePiece[];
  private currentGamePiece: IGamePiece;
  private scene: THREE.Scene;
  private world: CANNON.World;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    gamePieces: IGamePiece[],
    material: Material,
    loader: Loader
  ) {
    this.scene = scene;
    this.world = world;
    this.activeGamePieces = gamePieces;
    this.material = material;
    this.blockGeometry = new BlockGeometry();
    this.loader = loader;

    this.createOBlock({ x: 0, y: 150, z: 0 });
    this.createBounceArea();
    this.createWinZone();

    window.addEventListener('keydown', this.steerDebugBox.bind(this));
  }

  createOBlock(position: IPosition) {
    // Create the mesh object
    const groundTexture = this.loader
      .getTextureLoader()
      .load('textures/test/wobbly.jpg');
    const iceMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const mesh = new THREE.Mesh(this.blockGeometry.getSquare(), iceMaterial);
    mesh.castShadow = true;
    mesh.position.copy(position as Vector3);

    // Create the physics object to match the mesh object
    const boxShape = new CANNON.Box(new Vec3(5, 5, 5));
    const body = new CANNON.Body({
      mass: 1,
      position: new Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material.getIceMaterial(),
    });
    body.position.copy(position as Vec3);

    // Add entities to the world
    this.scene.add(mesh);
    this.world.addBody(body);
    this.activeGamePieces.push({ mesh, body });
    this.currentGamePiece = { mesh, body };

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
      material: this.material.getSpungeMaterial(),
    });
    body.position.copy((mesh.position as unknown) as Vec3);
    this.world.addBody(body);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
  }

  // Used for creating the target area to score gamePiece into
  createWinZone() {
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
    winMesh.position.set(-75, 5, -75);
    this.scene.add(winMesh);
  }

  steerDebugBox(event) {
    // Needs to cast to unknown then to Vec3, due to type constraints, the conversion is as intended.
    switch (event.key) {
      case 'a':
        this.currentGamePiece.mesh.position.x -= 3;
        this.currentGamePiece.body.position.copy(
          (this.currentGamePiece.mesh.position as unknown) as Vec3
        );
        break;

      case 'd':
        this.currentGamePiece.mesh.position.x += 3;
        this.currentGamePiece.body.position.copy(
          (this.currentGamePiece.mesh.position as unknown) as Vec3
        );
        break;

      case 'w':
        this.currentGamePiece.mesh.position.z -= 3;
        this.currentGamePiece.body.position.copy(
          (this.currentGamePiece.mesh.position as unknown) as Vec3
        );
        break;

      case 's':
        this.currentGamePiece.mesh.position.z += 3;
        this.currentGamePiece.body.position.copy(
          (this.currentGamePiece.mesh.position as unknown) as Vec3
        );
        break;
    }
  }
}

export default Game;
