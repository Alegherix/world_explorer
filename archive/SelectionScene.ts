// import Stats from 'stats.js';
// import type { Vector3 } from 'three';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import type { IGamePiece } from '../src/utils/interfacesfaces';
// import Loader from '../src/utils/Loaderoader';
// import Material from '../src/utils/Materialsrials';

// class SelectionScene {
//   private previousElapsedTime: number;
//   private canvas: HTMLCanvasElement;

//   private material: Material;
//   private loader: Loader;

//   private worldCamera: THREE.PerspectiveCamera;
//   private scene: THREE.Scene;
//   private clock: THREE.Clock;
//   private renderer: THREE.WebGLRenderer;

//   private world: CANNON.World;

//   private selectedWorld: THREE.Mesh;

//   private cursor: THREE.Vector2;
//   private raycaster: THREE.Raycaster;
//   private intersects: THREE.Intersection[] = [];

//   // Stricly for debugging
//   private stats;
//   private orbitControl: OrbitControls;

//   constructor(
//     canvas: HTMLCanvasElement,
//     private updatePlanetName: (planetName: string) => void
//   ) {
//     this.canvas = canvas;
//     this.clock = new THREE.Clock();
//     this.previousElapsedTime = 0;
//     this.material = new Material();
//     this.loader = new Loader();
//     this.scene = new THREE.Scene();
//     this.scene.receiveShadow = true;

//     this.cursor = new THREE.Vector2(-1, -1);
//     this.raycaster = new THREE.Raycaster();
//     this.updatePlanetName = updatePlanetName;

//     this.initRenderer();
//     this.initCamera();
//     this.initLights();
//     this.createSpace();
//     this.createLavaPlanet(-170);
//     this.createRockPlanet(0);
//     this.createAlientPlanet(170);

//     this.stats = new Stats();
//     this.stats.showPanel(0);
//     document.body.appendChild(this.stats.dom);

//     this.orbitControl = new OrbitControls(this.worldCamera, this.canvas);
//     this.orbitControl.enableZoom = false;
//     window.addEventListener('resize', () => this.onWindowResize(), false);
//     window.addEventListener('mousemove', (event: MouseEvent) => {
//       this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
//       this.cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
//     });
//     window.addEventListener('click', this.updateClicked.bind(this));

//     this.tick();
//   }

//   // Enable the Three Renderer with soft shadows and size
//   initRenderer() {
//     this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
//     this.renderer.shadowMap.enabled = true;
//     this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     this.renderer.setPixelRatio(window.devicePixelRatio);
//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//   }

//   // Create camera and set position
//   initCamera() {
//     this.worldCamera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       1.0,
//       1000
//     );
//     this.worldCamera.position.set(2, 80, 260);
//   }

//   initLights() {
//     const light = new THREE.DirectionalLight('white');
//     light.position.set(100, 100, 100);
//     light.target.position.set(0, 0, 0);
//     light.castShadow = true;
//     light.shadow.bias = -0.01;
//     light.shadow.mapSize.width = 2048;
//     light.shadow.mapSize.height = 2048;
//     light.shadow.camera.near = 1.0;
//     light.shadow.camera.far = 500;
//     light.shadow.camera.left = 200;
//     light.shadow.camera.right = -200;
//     light.shadow.camera.top = 200;
//     light.shadow.camera.bottom = -200;
//     this.scene.add(light);

//     const ambientLight = new THREE.AmbientLight(0x404040);
//     this.scene.add(ambientLight);
//   }

//   createSpace() {
//     const cubeLoader = this.loader.getCubeTextureLoader();
//     const texture = cubeLoader.load([
//       'textures/space/px.jpg',
//       'textures/space/nx.jpg',
//       'textures/space/py.jpg',
//       'textures/space/ny.jpg',
//       'textures/space/pz.jpg',
//       'textures/space/nz.jpg',
//     ]);
//     this.scene.background = texture;
//   }

//   createRockPlanet(x: number) {
//     const color = this.loader
//       .getTextureLoader()
//       .load('/textures/rockPlanet/Rock012_1K_Color.jpg');
//     const normal = this.loader
//       .getTextureLoader()
//       .load('/textures/rockPlanet/Rock012_1K_Normal.jpg');
//     const ao = this.loader
//       .getTextureLoader()
//       .load('/textures/rockPlanet/Rock012_1K_AmbientOcclusion.jpg');
//     const displacement = this.loader
//       .getTextureLoader()
//       .load('/textures/rockPlanet/Rock012_1K_Displacement.jpg');
//     const roughness = this.loader
//       .getTextureLoader()
//       .load('/textures/rockPlanet/Rock012_1K_Roughness.jpg');
//     const emission = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');

//     let configObject = {
//       map: color,
//       normalMap: normal,
//       aoMap: ao,
//       roughnessMap: roughness,
//       displacementMap: displacement,
//       displacementScale: 0.1,
//       emissiveMap: emission,
//       emissiveIntensity: 0.5,
//       emissive: 0x209316,
//     };

//     this.createPlanet(x, configObject, 'Morghol');
//   }

//   createLavaPlanet(x: number) {
//     const color = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Color.jpg');
//     const emission = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
//     const displacement = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Displacement.jpg');
//     const normal = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Normal.jpg');
//     const roughness = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Roughness.jpg');

//     let configObject = {
//       map: color,
//       normalMap: normal,
//       roughnessMap: roughness,
//       emissive: 0x931a1a,
//       emissiveMap: emission,
//       emissiveIntensity: 5,
//       displacementMap: displacement,
//       displacementScale: 0.1,
//     };

//     this.createPlanet(x, configObject, 'Velknaz');
//   }

//   createAlientPlanet(x: number) {
//     const color = this.loader
//       .getTextureLoader()
//       .load('/textures/alienPlanet/Chip006_1K_Color.jpg');
//     const emission = this.loader
//       .getTextureLoader()
//       .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
//     const displacement = this.loader
//       .getTextureLoader()
//       .load('/textures/alienPlanet/Chip006_1K_Displacement.jpg');
//     const metalness = this.loader
//       .getTextureLoader()
//       .load('/textures/alienPlanet/Chip006_1K_Metalness.jpg');
//     const normal = this.loader
//       .getTextureLoader()
//       .load('/textures/alienPlanet/Chip006_1K_Normal.jpg');
//     const roughness = this.loader
//       .getTextureLoader()
//       .load('/textures/alienPlanet/Chip006_1K_Roughness.jpg');

//     let configObject = {
//       map: color,
//       normalMap: normal,
//       roughnessMap: roughness,
//       displacementMap: displacement,
//       displacementScale: 0.1,
//       emissiveMap: emission,
//       emissiveIntensity: 0.7,
//       emissive: 0x209316,
//       metalnessMap: metalness,
//       metalness: 0.3,
//     };

//     this.createPlanet(x, configObject, 'Zetxaru');
//   }

//   createPlanet(x: number, materialConfig: any, name: string) {
//     const geometry = new THREE.SphereBufferGeometry(50, 128, 128);
//     const material = new THREE.MeshStandardMaterial(materialConfig);
//     const planet = new THREE.Mesh(geometry, material);
//     planet.geometry.setAttribute(
//       'uv2',
//       new THREE.Float32BufferAttribute(planet.geometry.attributes.uv.array, 2)
//     );
//     planet.name = name;
//     planet.position.set(x, 0, -20);

//     this.scene.add(planet);
//   }

//   updateClicked() {
//     if (this.intersects.length > 0) {
//       this.selectedWorld = this.intersects[0]?.object as THREE.Mesh;
//       this.updatePlanetName(this.selectedWorld.name);
//     }
//   }

//   onWindowResize() {
//     this.worldCamera.aspect = window.innerWidth / window.innerHeight;
//     this.worldCamera.updateProjectionMatrix();
//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//   }

//   getPlanets(): THREE.Mesh[] {
//     return this.scene.children.filter(
//       (obj) => obj.name.length > 4
//     ) as THREE.Mesh[];
//   }

//   tick() {
//     requestAnimationFrame(() => {
//       this.stats.begin();

//       const elapsedTime = this.clock.getElapsedTime();
//       const timeDelta = elapsedTime - this.previousElapsedTime;
//       this.previousElapsedTime = elapsedTime;

//       this.raycaster.setFromCamera(this.cursor, this.worldCamera);
//       this.intersects = this.raycaster.intersectObjects(this.getPlanets());

//       // Scale planets up when hoovering
//       for (const intersect of this.intersects) {
//         if (intersect.object.scale.x <= 1.25) {
//           intersect.object.scale.x += 0.015;
//           intersect.object.scale.y += 0.015;
//           intersect.object.scale.z += 0.015;
//         }
//       }

//       // Rotate and let the planets float
//       for (const planet of this.getPlanets()) {
//         if (
//           !this.intersects.some((obj) => obj.object === planet) &&
//           planet.scale.x > 1 &&
//           planet !== this.selectedWorld
//         ) {
//           planet.scale.x -= 0.02;
//           planet.scale.y -= 0.02;
//           planet.scale.z -= 0.02;
//         }
//         planet.rotation.y -= 0.003;
//         planet.position.y = Math.sin(elapsedTime) * 2;
//       }

//       this.renderer.render(this.scene, this.worldCamera);

//       // Time calculations to figure out time since last tick

//       this.stats.end();

//       this.tick();
//     });
//   }
// }

// export default SelectionScene;
