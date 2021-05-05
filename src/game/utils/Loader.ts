import * as THREE from 'three';

class Loader {
  private textureLoader: THREE.TextureLoader;
  private cubeLoader: THREE.CubeTextureLoader;

  getTextureLoader(): THREE.TextureLoader {
    if (!this.textureLoader) this.textureLoader = new THREE.TextureLoader();
    return this.textureLoader;
  }

  getCubeTextureLoader(): THREE.CubeTextureLoader {
    if (!this.cubeLoader) this.cubeLoader = new THREE.CubeTextureLoader();
    return this.cubeLoader;
  }
}

export default Loader;
