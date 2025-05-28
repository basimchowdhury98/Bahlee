import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGZwBOyencohl5XlO-dT1OPqqYs27utqE",
  authDomain: "bahlee-9379c.firebaseapp.com",
  projectId: "bahlee-9379c",
  storageBucket: "bahlee-9379c.firebasestorage.app",
  messagingSenderId: "483763979775",
  appId: "1:483763979775:web:59a68dfb08dc4940dad3ca",
  measurementId: "G-3J2K3YNXBW",
  databaseURL: "https://bahlee-9379c-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);