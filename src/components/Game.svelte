<script lang="ts">
  import { onMount } from 'svelte';
  // import World from '../World';
  import GameScene from '../GameScene';
  import type { GameWorld } from '../utils/interfaces';

  let canvas;
  export let selectedWorld: GameWorld;
  onMount(() => {
    new GameScene(canvas, selectedWorld);
  });
</script>

<canvas class="webgl" bind:this={canvas} />
