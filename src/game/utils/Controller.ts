// Controller, is written in a non Class oriented way due to event listeners
// persisting when called with bind in a class, thus inducing movement bugs and memory leaks.

import type { IGamePiece } from '../../shared/frontendInterfaces';
import type ThirdPersonCamera from './ThirdPersonCamera';
import * as CANNON from 'cannon-es';
import { get } from 'svelte/store';
import GameStore from '../../shared/GameStore';

const pressedKeys: string[] = [];
let currentGamePiece: IGamePiece;
let gameCamera: ThirdPersonCamera;

export const setControllerProperties = (
  gamepiece: IGamePiece,
  camera: ThirdPersonCamera
) => {
  currentGamePiece = gamepiece;
  gameCamera = camera;
};

export const addKeyEvents = () => {
  window.addEventListener('keydown', keyDownEvent);
  window.addEventListener('keyup', keyUpEvent);
};

export const removeEventListeners = () => {
  window.removeEventListener('keydown', keyDownEvent);
  window.removeEventListener('keyup', keyUpEvent);
};

const keyUpEvent = (event: KeyboardEvent) => {
  const indexOfPressedKey = pressedKeys.indexOf(event.key);
  if (indexOfPressedKey !== -1) {
    pressedKeys.splice(indexOfPressedKey, 1);
  }
};

const keyDownEvent = (event: KeyboardEvent) => {
  if (!pressedKeys.includes(event.key)) {
    pressedKeys.push(event.key);
  }

  switch (event.key) {
    case ' ':
      jump();
      break;
    case 'x':
      boost();
      break;
  }
};

const boost = () => {
  const force = 100;
  const { x, z } = gameCamera.getWorldDirection();
  // apply force, update store, and make sure to note when last boost was used;
  let { boosts } = get(GameStore);
  if (boosts > 0) {
    currentGamePiece.body.applyImpulse(
      new CANNON.Vec3(force * x * 0.8, 0, z * force * 0.8),
      currentGamePiece.body.position
    );
    GameStore.update((value) => {
      return { ...value, boosts: boosts - 1 };
    });
    currentGamePiece.mesh.userData.lastBoost = new Date().getTime();
  }
};

const steer = () => {
  const { x, z } = gameCamera.getWorldDirection();
  const force = 60;

  for (const pressedKey of pressedKeys) {
    switch (pressedKey) {
      case 'w':
        currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * x, 0, z * force),
          currentGamePiece.body.position
        );

        break;

      case 'a':
        currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * z, 0, force * -x),
          currentGamePiece.body.position
        );
        break;

      case 's':
        currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * -x, 0, force * -z),
          currentGamePiece.body.position
        );
        break;

      case 'd':
        currentGamePiece.body.applyForce(
          new CANNON.Vec3(force * -z, 0, force * x),
          currentGamePiece.body.position
        );
        break;
    }
  }
};

const jump = () => {
  let { jumps } = get(GameStore);
  if (jumps > 0) {
    currentGamePiece.body.applyImpulse(
      new CANNON.Vec3(0, 30, 0),
      currentGamePiece.body.position
    );
    GameStore.update((value) => {
      return { ...value, jumps: jumps - 1 };
    });
    currentGamePiece.mesh.userData.lastJump = new Date().getTime();
  }
};

const replenishJump = () => {
  const { jumps } = get(GameStore);
  if (jumps < 4) {
    const currentTime = new Date().getTime();
    if (currentTime > currentGamePiece.mesh.userData.lastJump + 5000) {
      GameStore.update((val) => ({ ...val, jumps: val.jumps + 1 }));
      currentGamePiece.mesh.userData.lastJump = currentTime;
    }
  }
};

// replenish Boost every 5 sec
const replenishBoost = () => {
  const { boosts } = get(GameStore);
  if (boosts < 3) {
    const currentTime = new Date().getTime();
    if (currentTime > currentGamePiece.mesh.userData.lastBoost + 5000) {
      GameStore.update((val) => ({ ...val, boosts: val.boosts + 1 }));
      currentGamePiece.mesh.userData.lastBoost = currentTime;
    }
  }
};

export const runController = () => {
  steer();
  replenishBoost();
  replenishJump();
};
