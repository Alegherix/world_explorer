<script lang="ts">
  import GameWorld from './GameWorld.svelte';
  import SigninScreen from './SigninScreen.svelte';
  import WorldSelectionSelector from './WorldSelectionSelector.svelte';

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
  {#if hasSelected}
    <GameWorld />
    <!-- {:else if hasSelected}
    <WorldSelectionSelector /> -->
  {:else}
    <SigninScreen {username} on:addUser={addUser} />
  {/if}
</main>
