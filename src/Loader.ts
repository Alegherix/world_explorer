import { CubeTextureLoader, TextureLoader } from 'three';

// Used for creating Loaders such as TextureLoaders, CubeLoaders etc...
class Loader {
  private textureLoader: THREE.TextureLoader;
  private cubeLoader: THREE.CubeTextureLoader;

  getTextureLoader(): THREE.TextureLoader {
    if (this.textureLoader) return this.textureLoader;
    else {
      this.textureLoader = new TextureLoader();
      return this.textureLoader;
    }
  }

  getCubeTextureLoader(): THREE.CubeTextureLoader {
    if (this.cubeLoader) return this.cubeLoader;
    else {
      this.cubeLoader = new CubeTextureLoader();
      return this.cubeLoader;
    }
  }
}

export default Loader;
