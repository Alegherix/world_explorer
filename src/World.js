import CANNON, { Vec3 } from 'cannon';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Game from './Game';
import Platform from './Platform';
import './style.css';

class World {
  constructor() {
    this.init();
  }

  init() {
    this.activeCubes = [];
    this.scene = new THREE.Scene();
    this.scene.receiveShadow = true;
    this.gui = new dat.GUI();
    this.world = new CANNON.World();
    // Updates to not check colission of objects far apart from eachother
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

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

    this.game = new Game(this.scene, this.world, this.activeCubes, iceMaterial);

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

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  // Removes idle cubes not from event fired, due to event causing nullPointerExceptions
  removeIdleCubes() {
    let index = [];
    for (const object of this.activeCubes) {
      console.log(object.mesh.name);
      if (object.mesh.name === 'idle') {
        this.world.removeBody(object.boxBody);
        this.scene.remove(object.mesh);
        index.push(this.activeCubes.indexOf(object));
      }
    }
    if (index.length > 0) {
      this.activeCubes.splice(index[0], 1);
    }
  }

  // Creates invisible physical boundries
  createBoundry(x1, y1, z1, x2, y2, z2, rotation, floorShape) {
    const body = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: this.rockMaterial,
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(x1, y1, z1), rotation);
    body.position = new Vec3(x2, y2, z2);
    this.world.addBody(body);
  }

  // Adds each invisible boundry to the scene
  addInvisibleBoundries() {
    // Keep here as not to reinstantiate plane object
    const floorShape = new CANNON.Plane();

    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
    this.createBoundry(0, 1, 0, -60, 0, 0, Math.PI * 0.5, floorShape); // Left
    this.createBoundry(0, -1, 0, 60, 0, 0, Math.PI * 0.5, floorShape); // Right
    this.createBoundry(0, 0, 1, 0, 0, -30, Math.PI * 0.5, floorShape); // Back
    this.createBoundry(0, 1, 0, 0, 0, 30, Math.PI, floorShape); // Back
  }

  setupDebugGUI() {
    const debugObject = {};
    debugObject.createOBlock = () => {
      this.game.createOBlock({ x: (Math.random() - 0.5) * 40, y: 160, z: 0 });
    };
    this.gui.add(debugObject, 'createOBlock');

    const debugMaterial = new THREE.MeshStandardMaterial({
      color: 'red',
      wireframe: true,
    });
    const debugBox = new THREE.BoxBufferGeometry(100, 10, 10, 4, 4);
    const debugMesh = new THREE.Mesh(debugBox, debugMaterial);
    debugMesh.position.set(0, 5, 0);
    debugMesh.name = 'debugMesh';

    debugObject.showDebugMesh = () => {
      this.scene.getObjectByName('debugMesh')
        ? this.scene.remove(debugMesh)
        : this.scene.add(debugMesh);
    };
    this.gui.add(debugObject, 'showDebugMesh');
  }

  tick() {
    requestAnimationFrame(() => {
      this.threejs.render(this.scene, this.camera);

      // Time calculations to figure out time since last tick
      const elapsedTime = this.clock.getElapsedTime();
      const timeDelta = elapsedTime - this.previousElapsedTime;
      this.previousElapsedTime = elapsedTime;

      // Updates every item from objects that need to be updated, both position, and
      // Needs to be kept until item is removed from game, since they're all Interactable
      for (const object of this.activeCubes) {
        object.mesh.position.copy(object.boxBody.position);
        object.mesh.quaternion.copy(object.boxBody.quaternion);
      }

      // this.removeIdleCubes();

      this.world.step(1 / 60, timeDelta, 3);

      this.tick();
    });
  }
}

export default World;
