import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
/**
 * @desc Used for creating the Game Scene, which is the scene which makes sure to render the actual game play inside
 */

import CANNON, { Vec3 } from 'cannon';
import * as THREE from 'three';
import type { Vector3 } from 'three/src/math/Vector3';
import BaseScene from './BaseScene';
import Game from '../Game';
import type { GameWorld, IGamePiece } from '../../shared/interfaces';
import Material from '../utils/Materials';

class GameScene extends BaseScene {
  private selectedWorld: GameWorld;
  private gamePieces: IGamePiece[];

  private world: CANNON.World;
  private game: Game;
  private material: Material;

  constructor(canvas: HTMLCanvasElement, selectedWorld: GameWorld) {
    super(canvas);
    this.selectedWorld = selectedWorld;
    this.material = new Material();
    this.gamePieces = [];
    this.createPhysicsWorld();
    this.createPlanet();

    this.game = new Game(
      this.scene,
      this.world,
      this.gamePieces,
      this.material,
      this.loader,
      this.worldCamera,
      this.previousElapsedTime
    );

    this.tick();
  }

  createGameWorld() {
    switch (this.selectedWorld) {
      case 'Morghol':
        break;

      case 'Velknaz':
        break;

      case 'Zetxaru':
        break;
    }
  }

  createSpace() {
    const cubeLoader = this.loader.getCubeTextureLoader();
    const texture = cubeLoader.load([
      'skybox/lava/px.png',
      'skybox/lava/nx.png',
      'skybox/lava/py.png',
      'skybox/lava/ny.png', // Jobbig
      'skybox/lava/pz.png',
      'skybox/lava/nz.png',
    ]);
    this.scene.background = texture;
  }

  createPhysicsWorld() {
    // Create physics world of space
    this.world = new CANNON.World();
    // Updates to not check colission of objects far apart from eachother
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.gravity.set(0, -30, 0);
    this.world.addContactMaterial(this.material.getIceRockContactMaterial());
    this.world.addContactMaterial(this.material.getIceIceContactMaterial());
    this.world.addContactMaterial(this.material.getIceSpungeContactMaterial());
    this.world.addContactMaterial(this.material.getIceGlassContactMaterial());
  }

  // Creates the Plane which the player plays upon
  createPlanet() {
    const textureLoader = this.loader.getTextureLoader();
    const groundTexture = textureLoader.load('textures/test/iceTexture.jpg');

    const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;
    // Move just slightly to prevent Z-Fighting
    plane.position.y = -0.2;
    this.scene.add(plane);

    this.addInvisibleBoundries();
  }

  // Creates the physical plane boundry of the Plane
  createBoundry(x1, y1, z1, x2, y2, z2, rotation, floorShape) {
    const body = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: this.material.getRockMaterial(),
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(x1, y1, z1), rotation);
    body.position = new Vec3(x2, y2, z2);
    this.world.addBody(body);
  }

  addInvisibleBoundries() {
    const floorShape = new CANNON.Box(new Vec3(100, 100, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
  }

  tick(): void {
    requestAnimationFrame(() => {
      this.stats.begin();

      this.renderer.render(this.scene, this.worldCamera);

      // Time calculations to figure out time since last tick
      const elapsedTime = this.clock.getElapsedTime();
      const timeDelta = elapsedTime - this.previousElapsedTime;
      this.previousElapsedTime = elapsedTime;

      // Updates every item from objects that need to be updated, both position, and
      // Needs to be kept until item is removed from game, since they're all Interactable
      for (const gamePiece of this.gamePieces) {
        gamePiece.mesh.position.copy(
          (gamePiece.body.position as unknown) as Vector3
        );
        gamePiece.mesh.quaternion.copy(
          (gamePiece.body.quaternion as unknown) as THREE.Quaternion
        );
      }

      this.game.runGameLoop();

      this.game.updateTimeDelta(timeDelta);
      this.world.step(1 / 100, timeDelta);

      this.stats.end();

      this.tick();
    });
  }
}

export default GameScene;
