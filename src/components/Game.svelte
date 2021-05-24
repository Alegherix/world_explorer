<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import GameScene from '../game/scenes/GameScene';
  import GameStore from '../shared/GameStore';
  import BoostComponent from './BoostComponent.svelte';
  import ControllerComponent from './ControllerComponent.svelte';
  import Highscore from './Highscore.svelte';
  import JumpComponent from './JumpComponent.svelte';
  import MenuButton from './MenuButton.svelte';
  import SinglePlayerCounter from './SinglePlayerCounter.svelte';
  import WinMenu from './WinMenu.svelte';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    if (!$GameStore.game) {
      $GameStore.game = new GameScene(canvas, $GameStore.world);
    }
  });

  onDestroy(() => {
    $GameStore.game = null;
  });

  const restartGame = () => {
    $GameStore.game.resetScene();
    $GameStore.game.resetGame();
  };
</script>

<main>
  {#if $GameStore.winnerName && $GameStore.world !== 'Zetxaru'}
    <WinMenu on:restart={restartGame} />
  {/if}
  <canvas class="webgl" bind:this={canvas} />
  <section>
    <SinglePlayerCounter />
    <JumpComponent />
    <BoostComponent />
  </section>
  <ControllerComponent />
  <div class="menu">
    {#if !$GameStore.winnerName}
      <MenuButton />
    {/if}
    {#if $GameStore.world !== 'Zetxaru'}
      <Highscore />
    {/if}
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
</style>
