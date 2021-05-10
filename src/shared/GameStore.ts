import { writable } from 'svelte/store';
import type { GameWorld } from './interfaces';

interface IScore {
  score: number;
  elapsedTime: number;
  world: GameWorld;
}

const GameStore = writable<IScore>({
  score: 0,
  elapsedTime: 0,
  world: null,
});

export default GameStore;
