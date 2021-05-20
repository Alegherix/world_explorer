import { v4 } from 'uuid';
import { writable } from 'svelte/store';
import type { GameWorld } from './frontendInterfaces';

interface IScore {
  username: string;
  score: number;
  elapsedTime: number;
  world: GameWorld;
  boosts: number;
  jumps: number;
  winnerName: string;
}

const GameStore = writable<IScore>({
  username: 'Jakob',
  score: 0,
  elapsedTime: 0,
  world: 'Morghol',
  boosts: 3,
  jumps: 4,
  winnerName: null,
});

export default GameStore;
