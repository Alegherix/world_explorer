import { writable } from 'svelte/store';
import type { GameWorld } from './interfaces';

interface IScore {
  username: string;
  score: number;
  elapsedTime: number;
  world: GameWorld;
}

const GameStore = writable<IScore>({
  score: 0,
  elapsedTime: 0,
  world: null,
  username: null,
});

export default GameStore;
