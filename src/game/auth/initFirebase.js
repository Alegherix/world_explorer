import firebase from 'firebase/app';
import 'firebase/auth';

const config = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

export default function initFireBase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
}
