import CANNON, { Vec3 } from 'cannon';
import Stats from 'stats.js';
import type { Vector3 } from 'three';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Game from './Game';
import type { IGamePiece } from './utils/interfaces';
import Loader from './utils/Loader';
import Material from './utils/Materials';

class World {
  private previousElapsedTime: number;
  private gamePieces: IGamePiece[];
  private canvas: HTMLCanvasElement;

  private material: Material;
  private loader: Loader;
  private game: Game;

  private worldCamera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private clock: THREE.Clock;
  private renderer: THREE.WebGLRenderer;

  private world: CANNON.World;

  // Stricly for debugging
  private stats;
  // private orbitControl: OrbitControls;

  constructor(canvas: HTMLCanvasElement, selectedWorld: string) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.previousElapsedTime = 0;
    this.material = new Material();
    this.loader = new Loader();
    this.gamePieces = [];
    this.scene = new THREE.Scene();
    this.scene.receiveShadow = true;

    // Initialize the Scene
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.createSpace();
    this.createPlanet();

    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // this.orbitControl = new OrbitControls(this.worldCamera, this.canvas);
    window.addEventListener('resize', () => this.onWindowResize(), false);

    //Creates the game Object
    this.game = new Game(
      this.scene,
      this.world,
      this.gamePieces,
      this.material,
      this.loader,
      this.worldCamera,
      this.previousElapsedTime
    );

    // Starts the actual World Loop -> Kept here and not in the game logic due to possible implementation of multiplayer later.
    this.tick();
  }

  // Enable the Three Renderer with soft shadows and size
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Create camera and set position
  initCamera() {
    this.worldCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1.0,
      1000
    );
    this.worldCamera.position.set(2, 200, 200);
  }

  initLights() {
    const light = new THREE.DirectionalLight('white');
    light.position.set(100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = 200;
    light.shadow.camera.right = -200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  createSpace() {
    const cubeLoader = this.loader.getCubeTextureLoader();
    const texture = cubeLoader.load([
      'textures/space/px.jpg',
      'textures/space/nx.jpg',
      'textures/space/py.jpg',
      'textures/space/ny.jpg',
      'textures/space/pz.jpg',
      'textures/space/nz.jpg',
    ]);
    this.scene.background = texture;

    // Create physics world of space
    this.world = new CANNON.World();
    // Updates to not check colission of objects far apart from eachother
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.gravity.set(0, -30, 0);
    this.world.addContactMaterial(this.material.getIceRockContactMaterial());
    this.world.addContactMaterial(this.material.getIceIceContactMaterial());
    this.world.addContactMaterial(this.material.getIceSpungeContactMaterial());
    this.world.addContactMaterial(this.material.getIceGlassContactMaterial());
  }

  // Creates the Plane which the player plays upon
  createPlanet() {
    const textureLoader = this.loader.getTextureLoader();
    const groundTexture = textureLoader.load('textures/test/iceTexture.jpg');

    const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;
    // Move just slightly to prevent Z-Fighting
    plane.position.y = -0.2;
    this.scene.add(plane);

    this.addInvisibleBoundries();
  }

  // Creates the physical plane boundry of the Plane
  createBoundry(x1, y1, z1, x2, y2, z2, rotation, floorShape) {
    const body = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: this.material.getRockMaterial(),
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(x1, y1, z1), rotation);
    body.position = new Vec3(x2, y2, z2);
    this.world.addBody(body);
  }

  addInvisibleBoundries() {
    const floorShape = new CANNON.Box(new Vec3(100, 100, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
  }

  onWindowResize() {
    this.worldCamera.aspect = window.innerWidth / window.innerHeight;
    this.worldCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  tick() {
    requestAnimationFrame(() => {
      this.stats.begin();

      this.renderer.render(this.scene, this.worldCamera);

      // Time calculations to figure out time since last tick
      const elapsedTime = this.clock.getElapsedTime();
      const timeDelta = elapsedTime - this.previousElapsedTime;
      this.previousElapsedTime = elapsedTime;

      // Updates every item from objects that need to be updated, both position, and
      // Needs to be kept until item is removed from game, since they're all Interactable
      for (const gamePiece of this.gamePieces) {
        gamePiece.mesh.position.copy(
          (gamePiece.body.position as unknown) as Vector3
        );
        gamePiece.mesh.quaternion.copy(
          (gamePiece.body.quaternion as unknown) as THREE.Quaternion
        );
      }

      this.game.runGameLoop();

      this.game.updateTimeDelta(timeDelta);
      this.world.step(1 / 100, timeDelta);

      this.stats.end();

      this.tick();
    });
  }
}

export default World;
