import firebase from 'firebase/app';
import 'firebase/firestore';
import initFireBase from './initFirebase.js';
initFireBase();

interface IHighscore {
  collectionName: string;
  username: string;
  time: number;
  score?: number;
}

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

interface IHighScore {
  username: string;
  score: number;
  time: number;
}

export function getScore(collection: string): Promise<IHighScore[]> {
  return firestore
    .collection(collection)
    .orderBy('score', 'desc')
    .orderBy('time', 'asc')
    .limit(5)
    .get()
    .then((querySnapshot) => {
      const temp: IHighScore[] = [];
      querySnapshot.forEach((doc) => {
        const { username, time, score } = doc.data();
        const forageEntity: IHighScore = {
          username,
          score,
          time,
        };
        temp.push(forageEntity);
      });
      return temp;
    });
}
