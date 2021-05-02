import CANNON, { Vec3 } from 'cannon';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Debugger from './Debugger';
import Game from './Game';

class World {
  constructor(canvas) {
    this.canvas = canvas;
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

    this.world.gravity.set(0, -30, 0);
    this.rockMaterial = new CANNON.Material('rock');
    const iceMaterial = new CANNON.Material('ice');
    const spungeMaterial = new CANNON.Material('spunge');
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.rockMaterial, iceMaterial, {
        friction: 10,
        restitution: 0,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      })
    );
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(iceMaterial, iceMaterial, {
        friction: 15,
        restitution: 1,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      })
    );

    this.world.addContactMaterial(
      new CANNON.ContactMaterial(iceMaterial, spungeMaterial, {
        friction: 2,
        restitution: 1.5,
      })
    );

    this.game = new Game(
      this.scene,
      this.world,
      this.activeCubes,
      iceMaterial,
      spungeMaterial
    );

    this.clock = new THREE.Clock();
    this.previousElapsedTime = 0;

    // Enable the Three Renderer with soft shadows and size
    // const canvas = document.querySelector('.webgl');
    this.threejs = new THREE.WebGLRenderer({ canvas: this.canvas });
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

    new OrbitControls(this.camera, this.canvas);

    this.createSpace();
    this.createPlanet();

    this.setupDebugGUI();
    this.scene.add(this.game.getWinObject().mesh);

    new Debugger(this.gui, this.scene);

    // this.game.createOBlock({ x: 0, y: 100, z: 0 });

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

    this.baseBox;
    this.debugBox;
  }

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

  addInvisibleBoundries() {
    const floorShape = new CANNON.Box(new Vec3(100, 100, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  // Removes idle cubes not from event fired, due to event causing nullPointerExceptions
  removeIdleCubes() {
    let index = [];
    for (const cube of this.activeCubes) {
      console.log(cube.mesh.name);
      if (cube.mesh.name === 'idle') {
        this.world.removeBody(cube.boxBody);
        this.scene.remove(cube.mesh);
        index.push(this.activeCubes.indexOf(cube));
      }
    }
    if (index.length > 0) {
      this.activeCubes.splice(index[0], 1);
    }
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

    // Trying to figure out bonding boxes

    debugObject.getBoundingBox = () => {
      this.debugBox = new THREE.Box3();

      const mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(10, 10, 10),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        })
      );
      mesh.position.set(5, 5, 8);
      this.scene.add(mesh);

      // Create box from mesh
      this.debugBox.setFromObject(mesh);

      const intersectedBox = this.debugBox.intersect(this.baseBox);
      // Create Overlapping box
      console.log('BaseBox: ', this.baseBox);
      console.log('GroundBox: ', this.debugBox);

      console.log('IntersectBox: ', intersectedBox);
      const helper = new THREE.Box3Helper(intersectedBox, 'purple');
      this.scene.add(helper);
    };

    this.gui.add(debugObject, 'getBoundingBox');
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
        // console.log(object);
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
      }

      this.world.step(1 / 60, timeDelta, 3);

      this.tick();
    });
  }
}

export default World;
