<script>
  import { onMount } from 'svelte';
  import World from './World';

  let canvas;
  onMount(() => {
    new World(canvas);
  });
</script>

<canvas class="webgl" bind:this={canvas} />
