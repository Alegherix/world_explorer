<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import GameScene from '../game/scenes/GameScene';
  import { removeEventListeners } from '../game/utils/Controller';
  import GameStore from '../shared/GameStore';
  import BoostComponent from './BoostComponent.svelte';
  import ControllerComponent from './ControllerComponent.svelte';
  import JumpComponent from './JumpComponent.svelte';

  let canvas;
  let gameScene: GameScene;

  $: elapsedTime = $GameStore.elapsedTime;

  onMount(() => {
    if (!gameScene) {
      gameScene = new GameScene(canvas, $GameStore.world);
    }
  });

  onDestroy(() => {
    gameScene = null;
  });

  const handleMenu = () => {
    removeEventListeners();
    GameStore.update((store) => {
      return {
        ...store,
        boosts: 3,
        jumps: 4,
        score: 0,
        elapsedTime: 0,
        world: null,
      };
    });
  };
</script>

<main>
  <canvas class="webgl" bind:this={canvas} />
  <section>
    {#if $GameStore.world !== 'Zetxaru'}
      <div class="scoreCounter">
        <h2>Points</h2>
        <h3>{$GameStore.score}</h3>
      </div>
      <div class="playtimeContainer">
        <h2>Time played</h2>
        <h3>{elapsedTime.toFixed(2)}</h3>
      </div>
    {/if}
    <JumpComponent />
    <BoostComponent />
  </section>
  <div class="menu">
    <button on:click={handleMenu}>Back to MainMenu</button>
    <ControllerComponent />
  </div>
</main>

<style>
  section {
    display: flex;
    flex-direction: row-reverse;
    position: absolute;
    right: 0;
    top: 0;
  }

  .scoreCounter,
  .playtimeContainer {
    width: 200px;
    height: 100px;
  }
  h2 {
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    color: white;
  }

  h3 {
    text-align: center;
    color: #f4cd04;
    font-size: 52px;
    margin: 0;
  }

  .menu {
    position: relative;
    z-index: 2;
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    border: solid #1987ee 2px;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    background-color: black;
    color: #1987ee;
    font-size: 2rem;
    width: 100%;
    cursor: pointer;
  }
</style>
