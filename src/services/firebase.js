import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfOGCNBk5UHIobD-POq7_sGJBN2uC6X6c",
    authDomain: "expense-tracker-1c282.firebaseapp.com",
    projectId: "expense-tracker-1c282",
    storageBucket: "expense-tracker-1c282.firebasestorage.app",
    messagingSenderId: "944745274084",
    appId: "1:944745274084:web:fbbbbd91d3b7f6b1f12af1"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
