// This is used since the loader in BaseScene get unmounted whenever context switching between
// SelectionScene and GameScene thus importing the same resources again, even though they should
// share the same loader object, thus not needing this store. But since this won't get unmounted,
// This store will work instead.

import { writable } from 'svelte/store';
import Loader from '../game/utils/Loader';

interface ILoader {
  loader: Loader;
}
const loader = new Loader();

const LoaderStore = writable<ILoader>({
  loader: loader,
});

export default LoaderStore;
