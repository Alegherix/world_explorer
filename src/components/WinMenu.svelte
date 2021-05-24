<script lang="ts">
  import MenuButton from './MenuButton.svelte';
  import GameStore from '../shared/GameStore';

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ restart }>();

  const resetMap = () => {
    GameStore.update((store) => {
      return {
        ...store,
        elapsedTime: 0,
        winnerName: null,
        score: 0,
        jumps: 4,
        boosts: 3,
      };
    });

    dispatch('restart');
  };
</script>

<section>
  <div class="winContainer">
    <MenuButton />
    <button on:click={resetMap}>Play again</button>
  </div>
</section>

<style>
  section {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    width: 100vw;
    z-index: 5;
    position: absolute;
    top: 0;
    left: 0%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .winContainer {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

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
