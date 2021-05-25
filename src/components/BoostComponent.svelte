<script lang="ts">
  import GameStore from '../shared/GameStore';
</script>

<div class="boostContainer">
  <h2>Boost</h2>
  <div class="boostBar">
    {#each Array($GameStore.boosts) as _}
      <div class="bar" />
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

  .bar {
    width: 50px;
    height: 50px;
    border: 4px solid #d1d1d1;
    background-image: linear-gradient(134.76deg, #868fe3 1.25%, #161c4f 100%);
  }
</style>
