<script>
  import GameStore from '../shared/GameStore';

  $: elapsedTime = $GameStore.elapsedTime;
</script>

{#if $GameStore.world !== 'Zetxaru'}
  <div class="scoreCounter">
    <h2>Points</h2>
    <h3>{$GameStore.score}</h3>
  </div>
  <div class="playtimeContainer">
    <h2>Time played</h2>
    <h3>{elapsedTime.toFixed(2)}</h3>
  </div>
{/if}

<style>
  .scoreCounter,
  .playtimeContainer {
    width: 200px;
    height: 100px;
  }
  h2 {
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    color: white;
  }

  h3 {
    text-align: center;
    color: #f4cd04;
    font-size: 52px;
    margin: 0;
  }
</style>
