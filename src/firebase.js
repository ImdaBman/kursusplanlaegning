import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'kursusplanlaegger-app',
  appId: '1:69913372640:web:f5b92f26719411ab446d85',
  storageBucket: 'kursusplanlaegger-app.firebasestorage.app',
  apiKey: 'AIzaSyDlpdmo-x-bEkHpp2xkqlnydY2OpISSsM4',
  authDomain: 'kursusplanlaegger-app.firebaseapp.com',
  messagingSenderId: '69913372640',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
