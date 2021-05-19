<script lang="ts">
  import GameStore from '../shared/GameStore';

  let username;
  const handleSubmit = () => {
    GameStore.update((store) => {
      return { ...store, username };
    });
  };
</script>

<main>
  <div class="container">
    <h1>World Explorer</h1>
    <input type="text" placeholder="Username" bind:value={username} />
    {#if username && username.length >= 2}
      <button on:click={handleSubmit}>Play</button>
    {/if}
  </div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    background: url('/textures/skybox/space/nx.jpg');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    font-size: 96px;
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
    cursor: pointer;
    border-radius: 3px;
  }
</style>
