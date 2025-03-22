import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "steep-quiz-da6da.firebaseapp.com",
  projectId: "steep-quiz-da6da",
  storageBucket: "steep-quiz-da6da.firebasestorage.app",
  messagingSenderId: "1032965514710",
  appId: "1:1032965514710:web:23b45f8f84786f8aa03077"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  enableIndexedDbPersistence(db);
} catch (err) {
  console.error("Firebase persistence error:", err);
}

export { app, db, auth };
