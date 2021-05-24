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
