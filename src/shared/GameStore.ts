import { v4 } from 'uuid';
import { writable } from 'svelte/store';
import type { GameWorld } from './frontendInterfaces';
import type Game from '../game/Game';
import type GameScene from '../game/scenes/GameScene';

interface IScore {
  username: string;
  score: number;
  elapsedTime: number;
  world: GameWorld;
  boosts: number;
  jumps: number;
  winnerName: string;
  game: GameScene;
}

const GameStore = writable<IScore>({
  username: 'Alegherix',
  score: 0,
  elapsedTime: 0,
  world: null,
  boosts: 3,
  jumps: 4,
  winnerName: null,
  game: null,
});

export default GameStore;
