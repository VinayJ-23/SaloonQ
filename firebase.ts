// ✅ Web Firebase Config — Matches native structure and exports

import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";


// ✅ Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaO_VMPxDBTeFNGmR1CNfKJ3uO1BYUYEk",
  authDomain: "barberqx.firebaseapp.com",
  projectId: "barberqx",
  storageBucket: "barberqx.firebasestorage.app",
  messagingSenderId: "396784773154",
  appId: "1:396784773154:web:0f23b3917f4f3d0edac27b",
};



// ✅ Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// ✅ Instances (same as native)
export const auth = getAuth(app);
export const firestore = getFirestore(app);



export async function signIn(email: string, password: string) {
  console.log("Working from Web SDK - signIn");
  return await signInWithEmailAndPassword(auth, email, password);
}


export async function signUp(email: string, password: string) {
  console.log("Working from Web SDK - signUp");
  return await createUserWithEmailAndPassword(auth, email, password);
}


export async function getData(collectionName: string, docId: string) {
  console.log("Working from Web SDK - getData");
  return await getDoc(doc(firestore, collectionName, docId));
}


export async function setData(collectionName: string, docId: string, dataObject: object) {
  console.log("Working from Web SDK - setData");
  return await setDoc(doc(firestore, collectionName, docId), dataObject, { merge: true });
}


export async function updateData(collectionName: string, docId: string, dataObject: object) {
  console.log("Working from Web SDK - updateData");
  return await updateDoc(doc(firestore, collectionName, docId), dataObject);
}


// ✅ Export Auth helpers (same as native)
export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
};

// ✅ Export Firestore helpers (for modular API use)
  export {
    addDoc, collection, deleteDoc, doc,
    getDoc,
    setDoc,
    updateDoc
  };

