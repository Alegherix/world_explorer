<script lang="ts">
  import { removeEventListeners } from '../game/utils/Controller';
  import GameStore from '../shared/GameStore';
  const handleMenu = () => {
    removeEventListeners();
    GameStore.update((store) => {
      return {
        ...store,
        boosts: 3,
        jumps: 4,
        score: 0,
        elapsedTime: 0,
        world: null,
      };
    });
  };
</script>

<button on:click={handleMenu}>Back to MainMenu</button>

<style>
  button {
    border: solid #1987ee 2px;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    background-color: black;
    color: #1987ee;
    font-size: 2rem;
    width: 100%;
    cursor: pointer;
  }
</style>
