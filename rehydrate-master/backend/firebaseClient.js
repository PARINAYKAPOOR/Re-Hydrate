// Import required functions and classes from SDK v9
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update, serverTimestamp } from 'firebase/database';

// Your Firebase config
const firebaseConfig = {
    "apiKey": "AIzaSyCwoRAPvKfWPKQMmBcNFjVvFxtxqX2MEdY",
    "authDomain": "pybackend-338c1.firebaseapp.com",
    "projectID": "pybackend-338c1",
    "databaseURL": "https://pybackend-338c1-default-rtdb.firebaseio.com/",
    "storageBucket": "pybackend-338c1.appspot.com",
    "messagingSenderId": "637686713585",
    "appId": "1:637686713585:web:249f59e312090b6d1eed50",
    "measurementId": "G-2W5KE6LL32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fetch specific fields from a user based on an id
const fetchFieldsFromUser = async (userId) => {
    const userRef = ref(db, userId);
    const snapshot = await get(userRef);
    const data = snapshot.val();
    return {
        xp: data.xp || 0,
        coins: data.coins || 0,
        threshold_percent: data.threshold_percent || 0
    };
};


// Update specific fields in a user based on an id
const updateFieldsForUser = async (userId, updatedFields) => {
    const userRef = ref(db, userId);
    return update(userRef, updatedFields);
};

const getTimestamp = () => {
    return serverTimestamp();
}



export { fetchFieldsFromUser, updateFieldsForUser, db, getTimestamp };
