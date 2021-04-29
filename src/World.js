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
    this.camera.position.set(2, 80, 300);
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
    this.scene.add(this.game.getOBlock());
    this.scene.add(this.game.getIBlock());
    // this.game.getTetrisPieces(this.scene);

    // this.sphereBody = this.game.getPhysicsSphere(iceMaterial);
    // this.tetrisSphere = this.game.getTetrisSphere();

    // this.scene.add(this.tetrisSphere);
    // this.world.addBody(this.sphereBody);

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
    const groundHeightTexture = textureLoader.load(
      'textures/test/heightMap.png'
    );

    // groundTexture.repeat.set(4, 4);
    // groundTexture.wrapS = THREE.RepeatWrapping;
    // groundTexture.wrapT = THREE.RepeatWrapping;

    // groundHeightTexture.repeat.set(8, 8);
    // groundHeightTexture.wrapS = THREE.RepeatWrapping;
    // groundHeightTexture.wrapT = THREE.RepeatWrapping;

    const planeGeometry = new THREE.PlaneBufferGeometry(600, 600, 128, 128);
    // const planeGeometry = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      displacementMap: groundHeightTexture,
      displacementScale: 0,
    });

    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: this.rockMaterial,
    });
    // floorBody.mass = 0;
    // floorBody.addShape(floorShape);
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

  // getPhysicsSphere() {
  //   const sphereShape = new CANNON.Sphere(0.5);
  //   const sphereBody = new CANNON.Body({
  //     mass: 1,
  //     position: new CANNON.Vec3(0, 10, 0),
  //     shape: sphereShape,
  //   });
  //   return sphereBody;
  // }

  // getTetrisSphere() {
  //   const sphere = new THREE.Mesh(
  //     new THREE.SphereBufferGeometry(0.5, 32, 32),
  //     new THREE.MeshStandardMaterial({
  //       color: 'pink',
  //     })
  //   );
  //   sphere.name = 'tetrisSphere';
  //   return sphere;
  // }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  tick() {
    requestAnimationFrame(() => {
      this.threejs.render(this.scene, this.camera);

      // Time calculations to figure out time since last tick
      // const elapsedTime = this.clock.getElapsedTime();
      // const timeDelta = elapsedTime - this.previousElapsedTime;
      // this.previousElapsedTime = elapsedTime;

      // this.tetrisSphere.position.copy(this.sphereBody.position);

      // // Update Physics world
      // this.world.step(1 / 60, timeDelta, 3);

      this.tick();
    });
  }
}

export default World;
