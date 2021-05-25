<script lang="ts">
  import Game from './Game.svelte';
  import SigninScreen from './SigninScreen.svelte';
  import WorldSelectionSelector from './WorldSelectionSelector.svelte';
  import GameStore from '../shared/GameStore';

  $: document.title = $GameStore.world ?? 'World Explorer';
</script>

<svelte:head>
  <title>World Explorer</title>
</svelte:head>

<main>
  {#if $GameStore.world}
    <Game />
  {:else if $GameStore.username}
    <WorldSelectionSelector />
  {:else}
    <SigninScreen />
  {/if}
</main>
