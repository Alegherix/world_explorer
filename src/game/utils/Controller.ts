import type { IGamePiece } from '../../shared/frontendInterfaces';
import type ThirdPersonCamera from './ThirdPersonCamera';
import * as CANNON from 'cannon-es';
import { get } from 'svelte/store';
import GameStore from '../../shared/GameStore';

class Controller {
  private pressedKeys: string[] = [];
  private currentGamePiece: IGamePiece;

  constructor(private gameCamera: ThirdPersonCamera) {
    window.addEventListener('keydown', this.keyDownStateUpdate.bind(this));
    window.addEventListener('keyup', this.keyUpStateUpdate.bind(this));
  }

  private keyDownStateUpdate(event: KeyboardEvent) {
    if (!this.pressedKeys.includes(event.key)) {
      this.pressedKeys.push(event.key);
    }
    console.log('Currently active Keys: ', JSON.stringify(this.pressedKeys));
  }

  private keyUpStateUpdate(event: KeyboardEvent) {
    const indexOfPressedKey = this.pressedKeys.indexOf(event.key);
    if (indexOfPressedKey !== -1) {
      this.pressedKeys.splice(indexOfPressedKey, 1);
    }
    console.log('Currently active Keys: ', JSON.stringify(this.pressedKeys));
  }

  addPieceToSteer(gamepiece: IGamePiece) {
    this.currentGamePiece = gamepiece;
  }

  steer() {
    const { x, z } = this.gameCamera.getWorldDirection();
    const force = 120;

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
            new CANNON.Vec3(force * z * 3, 0, force * -x * 3),
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
            new CANNON.Vec3(force * -z * 3, 0, force * x * 3),
            this.currentGamePiece.body.position
          );
          break;

        case ' ':
          this.currentGamePiece.body.applyImpulse(
            new CANNON.Vec3(0, 50, 0),
            this.currentGamePiece.body.position
          );
          break;

        case 'x':
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
            //   this.lastBoostUsed = new Date().getTime();
          }
          break;
      }
    }
  }
}
export default Controller;
