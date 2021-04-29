import CANNON from 'cannon';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Game from './Game';
import './style.css';

class World {
  constructor() {
    this.init();
  }

  init() {
    this.objectsToUpdate = [];
    this.scene = new THREE.Scene();
    this.scene.receiveShadow = true;
    this.gui = new dat.GUI();
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.rockMaterial = new CANNON.Material('rock');
    const iceMaterial = new CANNON.Material('ice');
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.rockMaterial, iceMaterial, {
        friction: 5,
        restitution: 0,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      })
    );
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(iceMaterial, iceMaterial, {
        friction: 15,
        restitution: 0,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      })
    );

    this.game = new Game(
      this.scene,
      this.world,
      this.objectsToUpdate,
      iceMaterial
    );

    this.clock = new THREE.Clock();
    this.previousElapsedTime = 0;

    // Enable the Three Renderer with soft shadows and size
    const canvas = document.querySelector('.webgl');
    this.threejs = new THREE.WebGLRenderer({ canvas });
    this.threejs.shadowMap.enabled = true;
    this.threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs.setPixelRatio(window.devicePixelRatio);
    this.threejs.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => this.onWindowResize(), false);

    // Create camera and set position
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1.0,
      1000
    );
    this.camera.position.set(2, 200, 200);
    // this.camera.position.set(1, 2, 10);

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

    new OrbitControls(this.camera, canvas);

    this.createSpace();
    this.createPlanet();
    this.scene.add(this.game.getBounds(-50));
    this.scene.add(this.game.getBounds(50));

    // Initial Falling block
    this.game.createOBlock({ x: 0, y: 140, z: 0 });

    this.setupDebugGUI();

    this.tick();
  }

  createSpace() {
    const cubeLoader = new THREE.CubeTextureLoader();
    const texture = cubeLoader.load([
      'textures/space/px.jpg',
      'textures/space/nx.jpg',
      'textures/space/py.jpg',
      'textures/space/ny.jpg',
      'textures/space/pz.jpg',
      'textures/space/nz.jpg',
    ]);
    this.scene.background = texture;
  }

  createPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('textures/test/iceTexture.jpg');

    const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: this.rockMaterial,
    });

    // Rotates the physical floor to match the mesh plane
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.world.addBody(floorBody);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;
    this.scene.add(plane);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  setupDebugGUI() {
    const debugObject = {};
    debugObject.createOBlock = () => {
      this.game.createOBlock({ x: 0, y: 160, z: 0 });
    };
    this.gui.add(debugObject, 'createOBlock');
  }

  tick() {
    requestAnimationFrame(() => {
      this.threejs.render(this.scene, this.camera);

      // Time calculations to figure out time since last tick
      const elapsedTime = this.clock.getElapsedTime();
      const timeDelta = elapsedTime - this.previousElapsedTime;
      this.previousElapsedTime = elapsedTime;

      // Updates every item from objects that need to be updated,
      // Needs to be kept until item is removed from game, since they're all
      // Interactable
      for (const object of this.objectsToUpdate) {
        object.mesh.position.copy(object.boxBody.position);
      }
      this.world.step(1 / 60, timeDelta, 3);

      this.tick();
    });
  }
}

export default World;
