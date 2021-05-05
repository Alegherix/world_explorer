<script lang="ts">
  import Game from './components/Game.svelte';
  import SigninScreen from './components/SigninScreen.svelte';
  import WorldSelectionSelector from './components/WorldSelectionSelector.svelte';
  import type { GameWorld } from './utils/interfaces';

  let username: string;
  let selectedWorld: GameWorld;

  const addUser = (event) => {
    username = event.detail.username;
  };

  const setSelectedWorld = (event) => {
    selectedWorld = event.detail.planetName;
  };
</script>

<main>
  {#if selectedWorld}
    <Game {selectedWorld} />
  {:else if username}
    <WorldSelectionSelector on:setWorld={setSelectedWorld} />
  {:else}
    <SigninScreen on:addUser={addUser} />
  {/if}
</main>
