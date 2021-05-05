<script lang="ts">
  import { onMount } from 'svelte';
  import SigninScreen from './SigninScreen.svelte';
  import World from './World';

  // let canvas;
  // onMount(() => {
  //   new World(canvas);
  // });
</script>

<main>
  <SigninScreen />
  <!-- <canvas class="webgl" bind:this={canvas} /> -->
</main>

<style>
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>
