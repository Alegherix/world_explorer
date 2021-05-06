<script lang="ts">
  import Game from './Game.svelte';
  import SigninScreen from './SigninScreen.svelte';
  import WorldSelectionSelector from './WorldSelectionSelector.svelte';
  import type { GameWorld } from '../shared/interfaces';

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
  <Game selectedWorld="Velknaz" />
  <!-- {#if selectedWorld}
    <Game {selectedWorld} />
  {:else if username}
    <WorldSelectionSelector on:setWorld={setSelectedWorld} />
  {:else}
    <SigninScreen on:addUser={addUser} />
  {/if} -->
</main>
