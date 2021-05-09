<script lang="ts">
  import { onMount } from 'svelte';
  import GameScene from '../game/scenes/GameScene';
  import type { GameWorld } from '../shared/interfaces';
  import Pointstore from '../shared/PointStore';

  let canvas;
  // let incrementPoints = () => {
  //   score++;
  // };
  // let score = 0;

  $: elapsedTime = $Pointstore.elapsedTime;

  export let selectedWorld: GameWorld;
  onMount(() => {
    new GameScene(canvas, selectedWorld);
  });
</script>

<main>
  <canvas class="webgl" bind:this={canvas} />
  <section>
    <div class="scoreCounter">
      <h2>Points</h2>
      <h3>{$Pointstore.score}</h3>
    </div>
    <div class="playtimeContainer">
      <h2>Time played</h2>
      <h3>{elapsedTime.toFixed(2)}</h3>
    </div>
  </section>
</main>

<style>
  section {
    display: flex;
    flex-direction: row-reverse;
    position: absolute;
    right: 0;
    top: 0;
  }

  .scoreCounter {
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

  .playTimeContainer {
    width: 200px;
    height: 100px;
  }
</style>
