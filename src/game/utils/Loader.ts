import * as THREE from 'three';
import { MeshStandardMaterial } from 'three';

class Loader {
  private textureLoader: THREE.TextureLoader;
  private cubeLoader: THREE.CubeTextureLoader;
  private lavaWorldConfig: THREE.MeshStandardMaterialParameters;

  constructor() {
    this.textureLoader = this.getTextureLoader();
  }

  getTextureLoader(): THREE.TextureLoader {
    if (!this.textureLoader) {
      this.textureLoader = new THREE.TextureLoader();
    }

    return this.textureLoader;
  }

  getCubeTextureLoader(): THREE.CubeTextureLoader {
    if (!this.cubeLoader) this.cubeLoader = new THREE.CubeTextureLoader();
    return this.cubeLoader;
  }

  getLavaWorldConfig(): THREE.MeshStandardMaterialParameters {
    if (this.lavaWorldConfig) return this.lavaWorldConfig;
    const color = this.getTextureLoader().load(
      '/textures/lavaPlanet/Lava004_1K_Color.jpg'
    );
    const emission = this.getTextureLoader().load(
      '/textures/lavaPlanet/Lava004_1K_Emission.jpg'
    );
    const displacement = this.getTextureLoader().load(
      '/textures/lavaPlanet/Lava004_1K_Displacement.jpg'
    );
    const normal = this.getTextureLoader().load(
      '/textures/lavaPlanet/Lava004_1K_Normal.jpg'
    );
    const roughness = this.getTextureLoader().load(
      '/textures/lavaPlanet/Lava004_1K_Roughness.jpg'
    );

    let configObject = {
      map: color,
      normalMap: normal,
      roughnessMap: roughness,
      emissive: 0x931a1a,
      emissiveMap: emission,
      emissiveIntensity: 5,
      displacementMap: displacement,
      displacementScale: 0.1,
    };

    this.lavaWorldConfig = configObject;
    return this.lavaWorldConfig;
  }

  getLavaWorldBouncepad(): THREE.MeshStandardMaterialParameters {
    const newMaterial = {
      ...this.getLavaWorldConfig(),
      emissiveIntensity: 0,
      emissive: 0,
    };
    return newMaterial;
  }

  getLavaWorldPlaneConfig(): THREE.MeshStandardMaterialParameters {
    const newMaterial = {
      ...this.getLavaWorldConfig(),
      emissiveIntensity: 0,
      emissive: 0,
      transparent: true,
      opacity: 0.6,
    };
    return newMaterial;
  }
}

export default Loader;
