import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Vector3 } from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Dimensions
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  200
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

let mixer;
let action;
let monster;

const gltfLoader = new GLTFLoader();
gltfLoader.load('/resources/Monster.glb', (gltf) => {
  scene.add(gltf.scene);
  mixer = new THREE.AnimationMixer(gltf.scene);
  action = mixer.clipAction(gltf.animations[0]);
  monster = gltf.scene;
});

let forward = false;
let rotateLeft = false;
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      forward = true;
      break;
    case 'a':
      rotateLeft = true;
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
      forward = false;
      break;
    case 'a':
      rotateLeft = false;
      break;
    default:
      break;
  }
});

// Make sure to update position of model each time
function update(deltaTime) {
  if (mixer) {
    if (forward) {
      // const monster = scene.children[3];
      action.paused = false;
      action.play();
      // console.log(monster);

      monster.position.set(
        monster.position.x,
        monster.position.y,
        (monster.position.z += 0.1)
      );
    } else {
      action.paused = true;
    }

    if (rotateLeft) {
      monster.rotation.y += Math.PI * 0.02;
    }
    camera.lookAt(monster.position);
    camera.position.z = monster.position.z - 2;
    camera.position.x = monster.position.x + 2;
    camera.position.y = monster.position.y + 2;
    mixer.update(deltaTime);
  }
}

const textureLoader = new THREE.TextureLoader();
const groundNormalTexture = textureLoader.load(
  '/textures/ground/Stone_Path_006_normal.jpg'
);
const groundRoughTexture = textureLoader.load(
  '/textures/ground/Stone_Path_006_roughness.jpg'
);
const groundHeightTexture = textureLoader.load(
  '/textures/ground/Stone_Path_006_height.png'
);
const groundBaseTexture = textureLoader.load(
  '/textures/ground/Stone_Path_006_basecolor.jpg'
);
const groundAOTexture = textureLoader.load(
  '/textures/ground/Stone_Path_006_ambientOcclusion.jpg'
);

groundNormalTexture.repeat.set(10, 10);
groundNormalTexture.wrapS = THREE.RepeatWrapping;
groundNormalTexture.wrapT = THREE.RepeatWrapping;

groundRoughTexture.repeat.set(10, 10);
groundRoughTexture.wrapS = THREE.RepeatWrapping;
groundRoughTexture.wrapT = THREE.RepeatWrapping;

groundHeightTexture.repeat.set(10, 10);
groundHeightTexture.wrapS = THREE.RepeatWrapping;
groundHeightTexture.wrapT = THREE.RepeatWrapping;

groundBaseTexture.repeat.set(10, 10);
groundBaseTexture.wrapS = THREE.RepeatWrapping;
groundBaseTexture.wrapT = THREE.RepeatWrapping;

groundAOTexture.repeat.set(10, 10);
groundAOTexture.wrapS = THREE.RepeatWrapping;
groundAOTexture.wrapT = THREE.RepeatWrapping;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const softLight = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(softLight);

const pointLight = new THREE.PointLight('#fff', 2, 100);
pointLight.position.set(0, 2, 3);
pointLight.lookAt(new Vector3());
scene.add(pointLight);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    map: groundBaseTexture,
    transparent: true,
    aoMap: groundAOTexture,
    normalMap: groundNormalTexture,
    roughnessMap: groundRoughTexture,
    displacementMap: groundHeightTexture,
    displacementScale: 0.1,
  })
);
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  // Update controls
  controls.update();

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  update(deltaTime);
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
