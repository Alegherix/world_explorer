<script lang="ts">
  import GameWorld from './components/GameWorld.svelte';
  import SigninScreen from './components/SigninScreen.svelte';
  import WorldSelectionSelector from './components/WorldSelectionSelector.svelte';

  let username: string;
  let selectedWorld: string;

  const addUser = (event) => {
    username = event.detail.username;
  };

  const setSelectedWorld = (event) => {
    selectedWorld = event.detail.planetName;
  };
</script>

<main>
  {#if selectedWorld}
    <GameWorld />
  {:else if username}
    <WorldSelectionSelector on:setWorld={setSelectedWorld} />
  {:else}
    <SigninScreen on:addUser={addUser} />
  {/if}
</main>
