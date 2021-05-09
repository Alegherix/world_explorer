import { writable } from 'svelte/store';

interface IScore {
  score: number;
  elapsedTime: number;
}

const PointStore = writable<IScore>({
  score: 0,
  elapsedTime: 0,
});

export default PointStore;
