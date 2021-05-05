import CANNON, { Vec3 } from 'cannon';
import * as THREE from 'three';
import { Vector3, SphereBufferGeometry } from 'three';
import BlockGeometry from './BlockGeometry';
import type { IGamePiece, IPosition } from './interfaces';
import type Loader from './Loader';
import type Material from './Materials';
import Ramp from './Ramp';
import ThirdPersonCamera from './ThirdPersonCamera';
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
  private blockGeometry: BlockGeometry;
  private currentGamePiece: IGamePiece;
  private startPosition: IPosition;
  private gamePieceTexture: THREE.Texture;
  private gamePieceMaterial: THREE.MeshStandardMaterial;
  private thirdPersonCamera: ThirdPersonCamera;

  constructor(
    private scene: THREE.Scene,
    private world: CANNON.World,
    private activeGamePieces: IGamePiece[],
    private material: Material,
    private loader: Loader,
    private camera: THREE.PerspectiveCamera,
    private timeDelta: number
  ) {
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.activeGamePieces = activeGamePieces;
    this.material = material;
    this.blockGeometry = new BlockGeometry();
    this.loader = loader;
    this.startPosition = { x: 0, y: 150, z: 0 };
    this.gamePieceTexture = this.loader
      .getTextureLoader()
      .load('textures/test/wobbly.jpg');
    this.gamePieceMaterial = new THREE.MeshStandardMaterial({
      map: this.gamePieceTexture,
    });

    this.thirdPersonCamera = new ThirdPersonCamera(this.camera);
    this.createOBlock();
    // this.createBounceArea();
    // this.createWinZone();

    window.addEventListener('keydown', this.steerDebugBox.bind(this));
  }

  createOBlock() {
    const mesh = new THREE.Mesh(
      new SphereBufferGeometry(5, 64, 64),
      this.gamePieceMaterial
    );
    mesh.castShadow = true;
    mesh.position.copy(this.startPosition as Vector3);

    // Create the physics object to match the mesh object
    const boxShape = new CANNON.Sphere(5);
    const body = new CANNON.Body({
      mass: 1,
      position: new Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material.getIceMaterial(),
    });
    body.position.copy(this.startPosition as Vec3);

    // Add entities to the world
    this.scene.add(mesh);
    this.world.addBody(body);
    this.activeGamePieces.push({ mesh, body });
    this.currentGamePiece = { mesh, body };
    const ramp = new Ramp(this.world, this.scene, this.material);

    this.thirdPersonCamera.setTracking({ mesh, body });

    // Updates cube when idle, should be used later down the road
    // For knowing when we can start generating new cubes from within Gameloop
    // body.addEventListener('sleep', () => (mesh.name = 'idle'));
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

  getCurrentGamePiece(): IGamePiece {
    return this.currentGamePiece;
  }

  updateTimeDelta(delta: number) {
    this.timeDelta = delta;
  }

  steerDebugBox(event) {
    // console.log(this.currentGamePiece);
    // console.log(this.currentGamePiece.body.sleepState === 2){}
    if (this.currentGamePiece.body.sleepState === 2)
      this.currentGamePiece.body.wakeUp();

    // Needs to cast to unknown then to Vec3, due to type constraints, the conversion is as intended.
    switch (event.key) {
      case 'w':
        this.currentGamePiece.body.applyForce(
          new Vec3(0, 0, -250),
          this.currentGamePiece.body.position
        );
        break;

      case 'a':
        this.currentGamePiece.body.applyForce(
          new Vec3(-250, 0, 0),
          this.currentGamePiece.body.position
        );
        break;

      case 's':
        this.currentGamePiece.body.applyForce(
          new Vec3(0, 0, 250),
          this.currentGamePiece.body.position
        );
        break;

      case 'd':
        this.currentGamePiece.body.applyForce(
          new Vec3(250, 0, 0),
          this.currentGamePiece.body.position
        );
        break;

      case ' ':
        this.currentGamePiece.body.applyForce(
          new Vec3(0, 2500, 0),
          this.currentGamePiece.body.position
        );
        break;
    }
  }

  runGameLoop() {
    this.thirdPersonCamera.update();
  }
}

export default Game;
