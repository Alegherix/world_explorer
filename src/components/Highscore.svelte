<script lang="ts">
  import { getScore } from '../game/auth/firebaseOperations';
  import GameStore from '../shared/GameStore';
  import type { IHighscore } from '../shared/interfaces';

  let promise: Promise<IHighscore[]> = getScore($GameStore.world);
</script>

<section>
  <h1>HighScore</h1>
  {#await promise then scores}
    <div class="descriptionContainer">
      <p>User</p>
      <p>Score</p>
      <p>Time</p>
    </div>
    {#each scores as score, index}
      <div class="highscoreContainer">
        <p>{score.username}</p>
        <p>{score.score}</p>
        <p>{score.time.toFixed(2)}</p>
      </div>
    {/each}
  {/await}
</section>

<style>
  section {
    color: white;
    background-color: transparent;
    z-index: 5;
    display: flex;
    flex-direction: column;
    width: 400px;
    margin: 0 auto;
    background-color: black;
  }

  h1 {
    margin-top: 0;
    font-size: 36px;
    text-align: center;
    background-color: red;
    padding: 0.3rem 0;
  }

  div {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-content: center;
    justify-items: center;
  }

  .highscoreContainer,
  .descriptionContainer {
    padding: 0 0.7rem;
  }
</style>
