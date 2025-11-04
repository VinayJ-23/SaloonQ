// firebase.ts
import { getApp } from "@react-native-firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import { doc, getDoc, getFirestore, setDoc, updateDoc } from "@react-native-firebase/firestore";



// direct helper function
export async function signIn(email: string, password: string) {
  console.log("working from native sdk");
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string) {
  console.log("working signup from native sdk");
  return await createUserWithEmailAndPassword(auth, email, password);
}




export async function getData(collectionName: string, docId: string) {
  const docRef = doc(firestore, collectionName, docId);
  console.log("working login from native");
  return await getDoc(docRef);
}

export async function setData(collectonName: string, docId: string, dataObject: object) {
  console.log("Set Data Working from NATIVE ");
  return await setDoc(doc(firestore, collectonName, docId), dataObject, { merge: true });
}

export async function updateData(collectionName: string, docId: string, dataObject: object) {
  console.log("Working from Web SDK - updateData");
  return await updateDoc(doc(firestore, collectionName, docId), dataObject);
}

// Initialize Native Firebase App
const app = getApp();

// ✅ Instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// ✅ Export Auth helpers (clean imports in screens)
export {
  createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword,
  signOut
};

