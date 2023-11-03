import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { $ } from '@builder.io/qwik';
import { getAnalytics } from 'firebase/analytics'
import { CompleteFn, ErrorFn, NextOrObserver, User } from 'firebase/auth';
import { onIdTokenChanged, signOut } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-wWLRjfbyHlDvJpbHbF5x5gnU8jF38C4",
  authDomain: "estim8s.firebaseapp.com",
  projectId: "estim8s",
  storageBucket: "estim8s.appspot.com",
  messagingSenderId: "851908082723",
  appId: "1:851908082723:web:b552abfc5eab63c1c50596",
  measurementId: "G-Z9FWG08L99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// initialize firebase


// firebase auth

/* can't import firebase auth on server, import dynamically in browser */

const auth = async () => (await import('firebase/auth')).getAuth(app);


export const login = $(async (email:string, password: string) => {
    const _auth = await auth();
    return (await import('firebase/auth')).signInWithEmailAndPassword(_auth, email, password);
});

export const logout = $(async () => {
    const _auth = await auth();
    await signOut(_auth);
});

export const onAuthChange = async (
    nextOrObserver: NextOrObserver<User>,
    error?: ErrorFn | undefined,
    completed?: CompleteFn | undefined
) => {
    const _auth = await auth();
    return onIdTokenChanged(_auth, nextOrObserver, error, completed);
};

// firestore
export const db = getFirestore(app);