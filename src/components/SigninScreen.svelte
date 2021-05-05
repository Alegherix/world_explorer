<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ addUser: { username: string } }>();
  let username;

  const handleSubmit = () => {
    dispatch('addUser', {
      username,
    });
  };
</script>

<main>
  <div class="container">
    <h1>World Explorer</h1>
    <input type="text" placeholder="Nickname" bind:value={username} />
    {#if username && username.length >= 2}
      <button on:click={handleSubmit}>Play</button>
    {/if}
  </div>
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: black;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container {
    margin-top: 5rem;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    font-size: 96px;
    position: absolute;
    top: 0;
    margin-top: 20rem;
    text-align: center;
    z-index: 2;
    color: #1987ee;
  }

  input {
    padding: 1rem;
    border: none;
    border-bottom: white 2px solid;
    max-width: 200px;
    width: 100%;
    font-size: 22px;
    background-color: transparent;
    color: white;
  }

  input::placeholder {
    color: white;
  }

  input:focus {
    outline: none;
  }

  button {
    font-size: 22px;
    background-color: #1987ee;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    margin-top: 2rem;
    width: 100%;
    max-width: 100px;
  }
</style>
