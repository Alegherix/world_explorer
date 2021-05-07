<script lang="ts">
  import { onMount } from 'svelte';
  import GameScene from '../game/scenes/GameScene';
  import type { GameWorld } from '../shared/interfaces';

  let canvas;
  let points;
  $: score = points;

  export let selectedWorld: GameWorld;
  onMount(() => {
    new GameScene(canvas, selectedWorld, points);
  });
</script>

<main>
  <canvas class="webgl" bind:this={canvas} />
  <div class="scoreCounter">
    <h2>Points</h2>
    <h3>{score}</h3>
  </div>
</main>

<style>
  .scoreCounter {
    background-color: black;
    width: 200px;
    height: 200px;
    position: absolute;
    right: 0;
    top: 0;
  }
  h2 {
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    color: white;
  }
</style>
