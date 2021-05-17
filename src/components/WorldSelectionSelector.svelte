<script lang="ts">
  import { onMount } from 'svelte';
  import SelectionScene from '../game/scenes/SelectionScene';
  import type { GameWorld } from '../shared/frontendInterfaces';
  import GameStore from '../shared/GameStore';

  let canvas: HTMLCanvasElement;
  let planetName: GameWorld;

  const updatePlanetName = (name: GameWorld) => {
    planetName = name;
  };

  onMount(() => {
    new SelectionScene(canvas, updatePlanetName);
  });

  const setWorld = () => {
    GameStore.update((store) => {
      return { ...store, world: planetName };
    });
  };
</script>

<div>
  <h1>Choose your Map</h1>
  <canvas class="webgl" bind:this={canvas} />
  {#if planetName}
    <div class="selectionContainer">
      <p>{planetName}</p>
      <button on:click={setWorld}>PLAY</button>
    </div>
  {/if}
</div>

<style>
  h1 {
    font-size: 96px;
    position: absolute;
    margin: 5rem auto;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 2;
    color: #1987ee;
  }

  .selectionContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: absolute;
    left: 0;
    right: 0;
    bottom: 10%;
    margin-left: auto;
    margin-right: auto;
    width: 800px;
    z-index: 2;
  }
  p {
    font-size: 96px;
    text-align: center;
    color: #1987ee;
  }

  button {
    background-color: #1987ee;
    color: white;
    width: 200px;
    font-size: 40px;
    border: none;
    cursor: pointer;
  }
</style>
