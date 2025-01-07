// lib/auth.js
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Sign Up
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user; // Return the signed-up user
  } catch (error) {
    throw new Error(error.message);
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user; // Return the signed-in user
  } catch (error) {
    throw new Error(error.message);
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
    return true; // Return success
  } catch (error) {
    throw new Error(error.message);
  }
};

// Google Sign-In
export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; // Return the signed-in user
  } catch (error) {
    throw new Error(error.message);
  }
};
