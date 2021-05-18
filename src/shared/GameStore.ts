import { v4 } from 'uuid';
import { writable } from 'svelte/store';
import type { GameWorld } from './frontendInterfaces';
const users = [
  'Kimball',
  'Alegherix',
  'TestUser',
  'WhateverFace',
  'Something',
  'else',
];

interface IScore {
  username: string;
  score: number;
  elapsedTime: number;
  world: GameWorld;
  boosts: number;
  jumps: number;
}

const GameStore = writable<IScore>({
  score: 0,
  elapsedTime: 0,
  world: 'Velknaz',
  username: 'Kimball',
  boosts: 3,
  jumps: 4,
});

// 'Zetxaru'
// users[Math.floor(Math.random() * users.length)]
export default GameStore;
