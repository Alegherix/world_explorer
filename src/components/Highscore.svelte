<script lang="ts">
  import { getScore } from '../game/auth/firebaseOperations';
  import GameStore from '../shared/GameStore';

  let promise = getScore($GameStore.world);
</script>

<section>
  {#await promise then scores}
    {#each scores as score}
      <div class="scoreItem">
        <p>User: {score.username}</p>
        <p>Score: {score.score}</p>
        <p>Time: {score.time.toFixed(2)}</p>
      </div>
    {/each}
  {/await}
</section>

<style>
  section {
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
