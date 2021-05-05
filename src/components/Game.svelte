<script lang="ts">
  import { onMount } from 'svelte';
  // import World from '../World';
  import GameScene from '../game/scenes/GameScene';
  import type { GameWorld } from '../shared/interfaces';

  let canvas;
  export let selectedWorld: GameWorld;
  onMount(() => {
    new GameScene(canvas, selectedWorld);
  });
</script>

<canvas class="webgl" bind:this={canvas} />
