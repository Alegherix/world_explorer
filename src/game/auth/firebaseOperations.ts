import firebase from 'firebase/app';
import 'firebase/firestore';
import type { IHighscore } from '../../shared/interfaces.js';
import initFireBase from './initFirebase.js';
initFireBase();

const firestore = firebase.firestore();

export const saveToFirebase = async (
  highscore: IHighscore
): Promise<firebase.firestore.DocumentReference> => {
  const { collectionName, username, time, score } = highscore;

  const res = await firestore.collection(collectionName).add({
    time,
    username,
    score: score ?? 0,
  });
  return res;
};

export function getScore(collection: string): Promise<IHighscore[]> {
  return firestore
    .collection(collection)
    .orderBy('score', 'desc')
    .orderBy('time', 'asc')
    .limit(3)
    .get()
    .then((querySnapshot) => {
      const temp: IHighscore[] = [];
      querySnapshot.forEach((doc) => {
        const { username, time, score } = doc.data();
        const highscore: IHighscore = {
          collectionName: collection,
          username,
          score,
          time,
        };
        temp.push(highscore);
      });
      return temp;
    });
}
