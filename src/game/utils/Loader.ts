import * as THREE from 'three';
import { MeshStandardMaterial } from 'three';

class Loader {
  private textureLoader: THREE.TextureLoader;
  private cubeLoader: THREE.CubeTextureLoader;
  private lavaWorldConfig: THREE.MeshStandardMaterialParameters;
  private mineralWorldConfig: THREE.MeshStandardMaterialParameters;
  private multiPlayerWorldConfig: THREE.MeshStandardMaterialParameters;

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
    const color = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Color.jpg');
    const emission = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
    const displacement = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Displacement.jpg');
    const normal = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Normal.jpg');
    const roughness = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Roughness.jpg');

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

  getMineralWorldConfig(): THREE.MeshStandardMaterialParameters {
    if (this.mineralWorldConfig) return this.mineralWorldConfig;
    const color = this.getTextureLoader().load('/textures/rockPlanet/rockTextures/Rock012_1K_Color.jpg');
    const normal = this.getTextureLoader().load('/textures/rockPlanet/rockTextures/Rock012_1K_Normal.jpg');
    const ao = this.getTextureLoader().load('/textures/rockPlanet/rockTextures/Rock012_1K_AmbientOcclusion.jpg');
    const displacement = this.getTextureLoader().load('/textures/rockPlanet/rockTextures/Rock012_1K_Displacement.jpg');
    const roughness = this.getTextureLoader().load('/textures/rockPlanet/rockTextures/Rock012_1K_Roughness.jpg');
    const emission = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');

    let configObject = {
      map: color,
      normalMap: normal,
      aoMap: ao,
      roughnessMap: roughness,
      displacementMap: displacement,
      displacementScale: 1.1,
      emissiveMap: emission,
      emissiveIntensity: 0.3,
      emissive: 0x209316,
    };

    this.mineralWorldConfig = configObject;
    return this.mineralWorldConfig;
  }

  getMineralWorldPlaneConfig(): THREE.MeshStandardMaterialParameters {
    const newMaterial = {
      ...this.getMineralWorldConfig(),
      emissiveIntensity: 0.2,
      emissive: 0x209316,
      transparent: true,
      opacity: 0.7,
    };
    return newMaterial;
  }

  getMineralWorldBouncePad(): THREE.MeshStandardMaterialParameters {
    const color = this.getTextureLoader().load('/textures/rockPlanet/iceTextures/Blue_Ice_001_COLOR.jpg');
    const normal = this.getTextureLoader().load('/textures/rockPlanet/iceTextures/Blue_Ice_001_NORM.jpg');
    const ao = this.getTextureLoader().load('/textures/rockPlanet/iceTextures/Blue_Ice_001_OCC.jpg');
    const displacement = this.getTextureLoader().load('/textures/rockPlanet/iceTextures/Blue_Ice_001_DISP.png');
    const roughness = this.getTextureLoader().load('/textures/rockPlanet/iceTextures/Blue_Ice_001_ROUGH.jpg');
    const emission = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');

    const newMaterial = {
      map: color,
      normalMap: normal,
      aoMap: ao,
      roughnessMap: roughness,
      displacementMap: displacement,
      displacementScale: 0.1,
      emissiveMap: emission,
      emissiveIntensity: 0.5,
      emissive: 0x0022ff,
      transparent: true,
      opacity: 0.6,
    };
    return newMaterial;
  }

  getMultiPlayerWorldConfig(): THREE.MeshStandardMaterialParameters {
    if (this.multiPlayerWorldConfig) return this.multiPlayerWorldConfig;
    const color = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Color.jpg');
    const emission = this.getTextureLoader().load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
    const displacement = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Displacement.jpg');
    const metalness = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Metalness.jpg');
    const normal = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Normal.jpg');
    const roughness = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Roughness.jpg');

    let configObject = {
      map: color,
      normalMap: normal,
      roughnessMap: roughness,
      displacementMap: displacement,
      displacementScale: 0.1,
      emissiveMap: emission,
      emissiveIntensity: 0.7,
      emissive: 0x209316,
      metalnessMap: metalness,
      metalness: 0.3,
    };

    this.multiPlayerWorldConfig = configObject;
    return this.multiPlayerWorldConfig;
  }

  getMultiPlayerWorldPlaneConfig(): THREE.MeshStandardMaterialParameters {
    const color = this.getTextureLoader().load('/textures/metalPlate/MetalPlates006_1K_Color.jpg');
    const normal = this.getTextureLoader().load('/textures/metalPlate/MetalPlates006_1K_Normal.jpg');
    const displacement = this.getTextureLoader().load('/textures/metalPlate/MetalPlates006_1K_Displacement.jpg');
    const metalness = this.getTextureLoader().load('/textures/metalPlate/MetalPlates006_1K_Metalness.jpg');
    const roughness = this.getTextureLoader().load('/textures/metalPlate/MetalPlates006_1K_Roughness.jpg');

    const newMaterial = {
      map: color,
      normalMap: normal,
      displacementMap: displacement,
      roughnessMap: roughness,
      metalnessMap: metalness,
      transparent: true,
      opacity: 0.7,
    };

    return newMaterial;
  }

  getMultiPlayerWorldBouncePad(): THREE.MeshStandardMaterialParameters {
    const color = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Color.jpg');
    const normal = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Normal.jpg');
    const displacement = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Displacement.jpg');
    const metalness = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Metalness.jpg');
    const roughness = this.getTextureLoader().load('/textures/alienPlanet/Chip006_1K_Roughness.jpg');

    const newMaterial = {
      map: color,
      normalMap: normal,
      displacementMap: displacement,
      roughnessMap: roughness,
      metalnessMap: metalness,
      transparent: true,
      opacity: 0.7,
    };

    return newMaterial;
  }
}

export default Loader;
