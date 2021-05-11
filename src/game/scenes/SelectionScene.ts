/**
 * @desc Used for creating the World Selection Scene, where a player decides which planet they want to play on
 */

import type { ISkybox, GameWorld } from './../../shared/frontendInterfaces';
import BaseScene from './BaseScene';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class SelectionScene extends BaseScene implements ISkybox {
  private raycaster: THREE.Raycaster;
  private cursor: THREE.Vector2;
  private intersects: THREE.Intersection[] = [];
  private selectedWorld: THREE.Mesh;

  constructor(
    protected canvas: HTMLCanvasElement,
    private updatePlanetName: (planetName: string) => void
  ) {
    super(canvas);
    this.updatePlanetName = updatePlanetName;
    this.cursor = new THREE.Vector2(-1, -1);
    this.createSkybox('space', '.jpg');
    this.raycaster = new THREE.Raycaster();
    this.createLavaPlanet(-170);
    this.createRockPlanet(0);
    this.createAlientPlanet(170);
    this.worldCamera.position.set(2, 80, 260);

    const orbitControl = new OrbitControls(this.worldCamera, this.canvas);
    orbitControl.enableZoom = false;

    // Make sure to remove when demounted to prevent memory leaks... should prob pass down from svelte to make sure to unmount properly
    window.addEventListener('mousemove', (event: MouseEvent) => {
      this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('click', this.updateClicked.bind(this));

    this.tick();
  }

  createSkybox(path: string, extension: string) {
    const cubeLoader = this.loader.getCubeTextureLoader();
    const texture = cubeLoader.load([
      `textures/skybox/${path}/px${extension}`,
      `textures/skybox/${path}/nx${extension}`,
      `textures/skybox/${path}/py${extension}`,
      `textures/skybox/${path}/ny${extension}`,
      `textures/skybox/${path}/pz${extension}`,
      `textures/skybox/${path}/nz${extension}`,
    ]);
    this.scene.background = texture;
  }

  createRockPlanet(x: number) {
    const color = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/Rock012_1K_Color.jpg');
    const normal = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/Rock012_1K_Normal.jpg');
    const ao = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/Rock012_1K_AmbientOcclusion.jpg');
    const displacement = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/Rock012_1K_Displacement.jpg');
    const roughness = this.loader
      .getTextureLoader()
      .load('/textures/rockPlanet/Rock012_1K_Roughness.jpg');
    const emission = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');

    let configObject = {
      map: color,
      normalMap: normal,
      aoMap: ao,
      roughnessMap: roughness,
      displacementMap: displacement,
      displacementScale: 0.1,
      emissiveMap: emission,
      emissiveIntensity: 0.5,
      emissive: 0x209316,
    };

    this.createPlanet(x, configObject, 'Morghol');
  }

  createLavaPlanet(x: number) {
    const color = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Color.jpg');
    const emission = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
    const displacement = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Displacement.jpg');
    const normal = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Normal.jpg');
    const roughness = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Roughness.jpg');

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

    this.createPlanet(x, configObject, 'Velknaz');
  }

  createAlientPlanet(x: number) {
    const color = this.loader
      .getTextureLoader()
      .load('/textures/alienPlanet/Chip006_1K_Color.jpg');
    const emission = this.loader
      .getTextureLoader()
      .load('/textures/lavaPlanet/Lava004_1K_Emission.jpg');
    const displacement = this.loader
      .getTextureLoader()
      .load('/textures/alienPlanet/Chip006_1K_Displacement.jpg');
    const metalness = this.loader
      .getTextureLoader()
      .load('/textures/alienPlanet/Chip006_1K_Metalness.jpg');
    const normal = this.loader
      .getTextureLoader()
      .load('/textures/alienPlanet/Chip006_1K_Normal.jpg');
    const roughness = this.loader
      .getTextureLoader()
      .load('/textures/alienPlanet/Chip006_1K_Roughness.jpg');

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

    this.createPlanet(x, configObject, 'Zetxaru');
  }

  createPlanet(x: number, materialConfig: any, name: GameWorld) {
    const geometry = new THREE.SphereBufferGeometry(50, 128, 128);
    const material = new THREE.MeshStandardMaterial(materialConfig);
    const planet = new THREE.Mesh(geometry, material);
    planet.geometry.setAttribute(
      'uv2',
      new THREE.Float32BufferAttribute(planet.geometry.attributes.uv.array, 2)
    );
    planet.name = name;
    planet.position.set(x, 0, -20);

    this.scene.add(planet);
  }

  updateClicked() {
    if (this.intersects.length > 0) {
      this.selectedWorld = this.intersects[0]?.object as THREE.Mesh;
      this.updatePlanetName(this.selectedWorld.name);
    }
  }

  getPlanets(): THREE.Mesh[] {
    return this.scene.children.filter(
      (obj) => obj.name.length > 4
    ) as THREE.Mesh[];
  }

  tick(): void {
    requestAnimationFrame(() => {
      this.stats.begin();

      const elapsedTime = this.clock.getElapsedTime();
      this.raycaster.setFromCamera(this.cursor, this.worldCamera);
      this.intersects = this.raycaster.intersectObjects(this.getPlanets());

      // Scale planets up when hoovering
      for (const intersect of this.intersects) {
        if (intersect.object.scale.x <= 1.25) {
          intersect.object.scale.x += 0.015;
          intersect.object.scale.y += 0.015;
          intersect.object.scale.z += 0.015;
        }
      }

      // Rotate and let the planets float
      for (const planet of this.getPlanets()) {
        if (
          !this.intersects.some((obj) => obj.object === planet) &&
          planet.scale.x > 1 &&
          planet !== this.selectedWorld
        ) {
          planet.scale.x -= 0.02;
          planet.scale.y -= 0.02;
          planet.scale.z -= 0.02;
        }
        planet.rotation.y -= 0.003;
        planet.position.y = Math.sin(elapsedTime) * 2;
      }

      this.renderer.render(this.scene, this.worldCamera);
      this.stats.end();

      this.tick();
    });
  }
}

export default SelectionScene;
