<script lang="ts">
  import Game from './Game.svelte';
  import SigninScreen from './SigninScreen.svelte';
  import WorldSelectionSelector from './WorldSelectionSelector.svelte';
  import GameStore from '../shared/GameStore';
</script>

<main>
  <!-- <Game /> -->
  {#if $GameStore.world}
    <Game />
  {:else if $GameStore.username}
    <WorldSelectionSelector />
  {:else}
    <SigninScreen />
  {/if}
</main>
