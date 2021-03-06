/**
 * @desc Used for creating the Game Scene, which is the scene which makes sure to render the actual game play inside
 */
import * as CANNON from 'cannon-es';
import { Clock } from 'three';
import type { GameWorld } from '../../shared/frontendInterfaces';
import type Game from '../Game';
import Material from '../utils/Materials';
import LavaWorld from '../worlds/LavaWorld';
import MineralWorld from '../worlds/MineralWorld';
import MultiplayerWorld from '../worlds/MultiplayerWorld';
import BaseScene from './BaseScene';

class GameScene extends BaseScene {
  private selectedWorld: GameWorld;
  private world: CANNON.World;
  private game: Game;
  private material: Material;
  constructor(canvas: HTMLCanvasElement, selectedWorld: GameWorld) {
    super(canvas);
    this.selectedWorld = selectedWorld;
    this.material = new Material();
    this.createPhysicsWorld();
    this.createGameWorld();
    this.tick();
  }

  createGameWorld() {
    switch (this.selectedWorld) {
      case 'Morghol':
        this.game = new MineralWorld(
          this.scene,
          this.world,
          this.loader,
          this.material,
          this.worldCamera
        );
        break;

      case 'Velknaz':
        this.game = new LavaWorld(
          this.scene,
          this.world,
          this.loader,
          this.material,
          this.worldCamera
        );
        break;

      case 'Zetxaru':
        this.game = new MultiplayerWorld(
          this.scene,
          this.world,
          this.loader,
          this.material,
          this.worldCamera
        );
        break;
    }
  }

  // Create physics world of space
  createPhysicsWorld() {
    this.world = new CANNON.World();
    // this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.gravity.set(0, -30, 0);
    this.world.addContactMaterial(this.material.getIceRockContactMaterial());
    this.world.addContactMaterial(this.material.getIceIceContactMaterial());
    this.world.addContactMaterial(this.material.getIceSpungeContactMaterial());
    this.world.addContactMaterial(this.material.getIceGlassContactMaterial());
    this.world.addContactMaterial(this.material.getIceMithrilContactMaterial());
    this.world.addContactMaterial(
      this.material.getIceAdamantineContactMaterial()
    );
  }

  tick(): void {
    requestAnimationFrame(() => {
      this.renderer.render(this.scene, this.worldCamera);

      // Time calculations to figure out time since last tick
      const elapsedTime = this.clock.getElapsedTime();
      const timeDelta = elapsedTime - this.previousElapsedTime;
      this.previousElapsedTime = elapsedTime;

      this.game?.runGameLoop(timeDelta, elapsedTime);
      this.tick();
    });
  }

  resetGame() {
    this.createGameWorld();
  }

  // Should be called when resetting the scene, to keep some objects, and dispose of others.
  resetScene() {
    this.game = null;
    this.clock = new Clock();
    this.initScene();
    this.createPhysicsWorld();
  }
}

export default GameScene;
