import type { IGamePiece } from '../../shared/frontendInterfaces';
import type ThirdPersonCamera from './ThirdPersonCamera';
import * as CANNON from 'cannon-es';
import { get } from 'svelte/store';
import GameStore from '../../shared/GameStore';

class Controller {
  private pressedKeys: string[] = [];
  private currentGamePiece: IGamePiece;
  private lastBoostUsed: number;
  private lastJumpUsed: number;

  constructor(private gameCamera: ThirdPersonCamera) {
    window.addEventListener('keydown', this.keyDownStateUpdate.bind(this));
    window.addEventListener('keyup', this.keyUpStateUpdate.bind(this));
  }

  private keyDownStateUpdate(event: KeyboardEvent) {
    if (!this.pressedKeys.includes(event.key)) {
      this.pressedKeys.push(event.key);
    }
  }

  private keyUpStateUpdate(event: KeyboardEvent) {
    const indexOfPressedKey = this.pressedKeys.indexOf(event.key);
    if (indexOfPressedKey !== -1) {
      this.pressedKeys.splice(indexOfPressedKey, 1);
    }

    // only execute these once on every keydown to prevent using all charges at once
    switch (event.key) {
      case ' ':
        this.jump();
        break;
      case 'x':
        this.boost();
        break;
    }
  }

  addPieceToSteer(gamepiece: IGamePiece) {
    this.currentGamePiece = gamepiece;
  }

  run() {
    this.steer();
    this.replenishBoost();
    this.replenishJump();
  }

  private jump() {
    let { jumps } = get(GameStore);
    if (jumps > 0) {
      console.log('Jumping');

      this.currentGamePiece.body.applyImpulse(
        new CANNON.Vec3(0, 30, 0),
        this.currentGamePiece.body.position
      );
      GameStore.update((value) => {
        return { ...value, jumps: jumps - 1 };
      });
      this.lastJumpUsed = new Date().getTime();
    }
  }

  private boost() {
    const force = 100;
    const { x, z } = this.gameCamera.getWorldDirection();
    // apply force, update store, and make sure to note when last boost was used;
    let { boosts } = get(GameStore);
    if (boosts > 0) {
      this.currentGamePiece.body.applyImpulse(
        new CANNON.Vec3(force * x * 0.8, 0, z * force * 0.8),
        this.currentGamePiece.body.position
      );
      GameStore.update((value) => {
        return { ...value, boosts: boosts - 1 };
      });
      this.lastBoostUsed = new Date().getTime();
    }
  }

  private steer() {
    const { x, z } = this.gameCamera.getWorldDirection();
    const force = 100;

    for (const pressedKey of this.pressedKeys) {
      switch (pressedKey) {
        case 'w':
          this.currentGamePiece.body.applyForce(
            new CANNON.Vec3(force * x, 0, z * force),
            this.currentGamePiece.body.position
          );
          break;

        case 'a':
          this.currentGamePiece.body.applyForce(
            new CANNON.Vec3(force * z, 0, force * -x),
            this.currentGamePiece.body.position
          );
          break;

        case 's':
          this.currentGamePiece.body.applyForce(
            new CANNON.Vec3(force * -x, 0, force * -z),
            this.currentGamePiece.body.position
          );
          break;

        case 'd':
          this.currentGamePiece.body.applyForce(
            new CANNON.Vec3(force * -z, 0, force * x),
            this.currentGamePiece.body.position
          );
          break;
      }
    }
  }

  private replenishJump() {
    const { jumps } = get(GameStore);
    if (jumps < 4) {
      const currentTime = new Date().getTime();
      if (currentTime > this.lastJumpUsed + 5000) {
        GameStore.update((val) => ({ ...val, jumps: val.jumps + 1 }));
        this.lastJumpUsed = currentTime;
      }
    }
  }

  // replenish Boost every 5 sec
  private replenishBoost() {
    const { boosts } = get(GameStore);
    if (boosts < 3) {
      const currentTime = new Date().getTime();
      if (currentTime > this.lastBoostUsed + 5000) {
        GameStore.update((val) => ({ ...val, boosts: val.boosts + 1 }));
        this.lastBoostUsed = currentTime;
      }
    }
  }
}
export default Controller;
