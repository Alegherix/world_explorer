import BaseScene from './BaseScene';
import type { GameWorld } from './utils/interfaces';

class GameScene extends BaseScene {
  private selectedWorld: GameWorld;

  constructor(canvas: HTMLCanvasElement, selectedWorld: GameWorld) {
    super(canvas);
    this.selectedWorld = selectedWorld;
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

  tick(): void {
    throw new Error('Method not implemented.');
  }
}
