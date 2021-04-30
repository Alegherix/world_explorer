import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Platform {
  constructor(scene) {
    this.scene = scene;
    this.init();
  }

  init() {
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.load(
      '/models/scene.gltf',
      (gltf) => {
        console.log('Loaded');
        console.log(gltf.scene.scale.x);
        gltf.scene.scale.x = 0.2;
        gltf.scene.scale.y = 0.2;
        gltf.scene.scale.z = 0.2;
        this.scene.add(gltf.scene);
      },
      () => {
        console.log('Loading');
      },
      (err) => {
        console.log('Error', err);
      }
    );
  }
}

export default Platform;
