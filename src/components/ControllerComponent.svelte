<section class="controller">
  <div class="move">
    <p>WASD</p>
    <p>Move</p>
  </div>
  <div class="move">
    <p>Space</p>
    <p>Jump</p>
  </div>
  <div class="move">
    <p>X</p>
    <p>Boost</p>
  </div>
  <div class="move">
    <p>R</p>
    <p>Rotate</p>
  </div>
</section>

<style>
  .controller {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    flex-direction: column;
    width: 250px;
    margin-bottom: 1.5rem;
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    z-index: 5;
  }

  .move {
    color: white;
    font-size: 26px;
    display: flex;
    justify-content: space-between;
  }
  p {
    margin: 0.3rem;
  }
</style>
