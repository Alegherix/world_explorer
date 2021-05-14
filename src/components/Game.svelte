<script lang="ts">
  import { onMount } from 'svelte';
  import GameScene from '../game/scenes/GameScene';
  import GameStore from '../shared/GameStore';
  import App from './App.svelte';

  let canvas;
  $: elapsedTime = $GameStore.elapsedTime;

  onMount(() => {
    new GameScene(canvas, $GameStore.world);
  });

  const handleMenu = () => {
    GameStore.update((store) => {
      return { ...store, world: null };
    });
  };
</script>

<main>
  <canvas class="webgl" bind:this={canvas} />
  <section>
    <div class="scoreCounter">
      <h2>Points</h2>
      <h3>{$GameStore.score}</h3>
    </div>
    <div class="playtimeContainer">
      <h2>Time played</h2>
      <h3>{elapsedTime.toFixed(2)}</h3>
    </div>
  </section>
  <section class="controller">
    <div class="move">
      <p>WASD</p>
      <p>Move</p>
    </div>
    <div class="move">
      <p>Space</p>
      <p>Jump</p>
    </div>
    <div class="move">
      <p>X</p>
      <p>Boost</p>
    </div>
    <div class="move">
      <p>R</p>
      <p>Rotate</p>
    </div>
  </section>
  <!-- <button on:click={handleMenu}>Back to MainMenu</button> -->
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

  button {
    position: absolute;
    top: 4rem;
    left: 2rem;
    border: solid #1987ee 2px;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    background-color: black;
    color: #1987ee;
    font-size: 2rem;
  }

  .controller {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    flex-direction: column;
    z-index: 2;
    position: absolute;
    left: 0.5rem;
    top: 4rem;
    width: 250px;
  }

  .move {
    color: white;
    font-size: 26px;
    display: flex;
    justify-content: space-between;
  }
  p {
    margin: 0.3rem;
  }
</style>
