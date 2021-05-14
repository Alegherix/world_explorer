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
}

const GameStore = writable<IScore>({
  score: 0,
  elapsedTime: 0,
  world: 'Zetxaru',
  username: users[Math.floor(Math.random() * users.length)],
  boosts: 3,
});

export default GameStore;
