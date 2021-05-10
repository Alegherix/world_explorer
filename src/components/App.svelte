<script lang="ts">
  import Game from './Game.svelte';
  import SigninScreen from './SigninScreen.svelte';
  import WorldSelectionSelector from './WorldSelectionSelector.svelte';
  import type { GameWorld } from '../shared/interfaces';
  import GameStore from '../shared/GameStore';

  let username: string;

  const addUser = (event) => {
    username = event.detail.username;
  };
</script>

<main>
  <!-- <Game /> -->
  {#if $GameStore.world}
    <Game />
  {:else if username}
    <WorldSelectionSelector />
  {:else}
    <SigninScreen on:addUser={addUser} />
  {/if}
</main>
