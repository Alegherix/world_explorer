<script lang="ts">
  import GameStore from '../shared/GameStore';
</script>

<div class="boostContainer">
  <h2>Boost</h2>
  <div class="boostBar">
    {#each Array($GameStore.boosts) as _, i}
      <img src="./bar.svg" alt="An svg of a boostbar" />
    {/each}
  </div>
</div>

<style>
  .boostContainer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 240px;
  }
  .boostBar {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
    justify-content: space-evenly;
  }
</style>
