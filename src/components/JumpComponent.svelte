<script lang="ts">
  import GameStore from '../shared/GameStore';

  let jumpsAtStart = $GameStore.jumps;
  $: currentJumps = $GameStore.jumps;

  const getColor = (val) => {
    switch (val) {
      case 0:
        return 'red';
      case 1:
        return 'orangered';
      case 2:
        return 'orange';
      case 3:
        return 'yellow';
      default:
        return '#1987ee';
    }
  };
</script>

<div class="jumpContainer">
  <h2>Jumps</h2>
  <div class="boostBar">
    <p>
      <span class="current" style="color:{getColor(currentJumps)};"
        >{currentJumps}</span
      >/<span class="start">{jumpsAtStart}</span>
    </p>
  </div>
</div>

<style>
  .jumpContainer {
    padding: 0 1rem;
  }
  p {
    text-align: center;
    color: #1987ee;
    font-size: 52px;
    margin: 0;
    font-weight: bold;
  }
</style>
