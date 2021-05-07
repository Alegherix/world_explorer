import { writable } from 'svelte/store';

interface IScore {
  score: number;
}

const PointStore = writable<IScore>({
  score: 0,
});

export default PointStore;
