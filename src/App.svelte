<script lang="ts">
  import GameWorld from './components/GameWorld.svelte';
  import SigninScreen from './components/SigninScreen.svelte';
  import WorldSelectionSelector from './components/WorldSelectionSelector.svelte';

  let username;
  let hasSelected = false;
  let selectedWorld;

  const addUser = (event) => {
    hasSelected = true;
    username = event.detail.username;
    console.log(username);
  };
</script>

<main>
  <WorldSelectionSelector />
  <!-- {#if selectedWorld}
    <GameWorld />
  {:else if hasSelected}
   
  {:else}
    <SigninScreen {username} on:addUser={addUser} />
  {/if} -->
</main>
