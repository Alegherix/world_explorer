import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { SphereBufferGeometry } from 'three';
import Game from './Game';
import CANNON from 'cannon';

class World {
  constructor() {
    this.init();
  }

  init() {
    this.gui = new dat.GUI();
    this.game = new Game();

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

    this.scene = new THREE.Scene();
    this.scene.receiveShadow = true;

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

    this.oBlock = this.game.getBlock('o');
    this.oBlockPhysics = this.game.getOBlockPhysics();

    this.scene.add(this.oBlock);
    this.world.addBody(this.oBlockPhysics);

    this.gui.add(light, 'intensity').min(0).max(3).step(0.001);
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

    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.world.addBody(floorBody);

    // const planeGeometry = new SphereBufferGeometry(500, 128, 128);
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;
    this.scene.add(plane);

    this.gui.add(planeMaterial, 'displacementScale').min(0).max(50).step(0.1);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  tick() {
    requestAnimationFrame(() => {
      this.threejs.render(this.scene, this.camera);

      // Time calculations to figure out time since last tick
      const elapsedTime = this.clock.getElapsedTime();
      const timeDelta = elapsedTime - this.previousElapsedTime;
      this.previousElapsedTime = elapsedTime;

      this.oBlock.position.copy(this.oBlockPhysics.position);

      // // Update Physics world
      this.world.step(1 / 60, timeDelta, 3);

      this.tick();
    });
  }
}

export default World;
