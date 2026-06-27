import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyA7nTZCEpGDA_PYQo9_8LQOC6BWtE9Zchw",
  authDomain: "bolao-copa-755b4.firebaseapp.com",
  projectId: "bolao-copa-755b4",
  storageBucket: "bolao-copa-755b4.firebasestorage.app",
  messagingSenderId: "121619350771",
  appId: "1:121619350771:web:a56bc608fd69e2c44e6386"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'matchResults'));
  const results = {};
  snap.forEach(doc => {
    results[doc.id] = doc.data();
  });
  fs.writeFileSync('dbResults.json', JSON.stringify(results, null, 2));
  console.log("Done");
  process.exit(0);
}

run();
