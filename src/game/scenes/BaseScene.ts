/**
 * @desc Used for creating the Base scene which the SelectionScene & GameScene extends their shared properties from.
 */

import Stats from 'stats.js';
import * as THREE from 'three';
import Loader from '../utils/Loader';

abstract class BaseScene {
  protected previousElapsedTime: number;
  protected canvas: HTMLCanvasElement;
  protected loader: Loader;

  protected worldCamera: THREE.PerspectiveCamera;
  protected scene: THREE.Scene;
  protected clock: THREE.Clock;
  protected renderer: THREE.WebGLRenderer;

  // Stricly for debugging
  protected stats;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.previousElapsedTime = 0;
    this.loader = new Loader();
    this.scene = new THREE.Scene();
    this.scene.receiveShadow = true;

    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.createSpace();

    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // this.tick();
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
    this.worldCamera.position.set(2, 80, 260);
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

  // TODO - Might wanna make this generic aswell
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
  }

  onWindowResize() {
    this.worldCamera.aspect = window.innerWidth / window.innerHeight;
    this.worldCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  abstract tick(): void;
}

export default BaseScene;
