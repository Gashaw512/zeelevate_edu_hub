// src/firebase/auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  setPersistence,
 browserSessionPersistence
} from "firebase/auth";

import app from "./config";

const auth = getAuth(app);

// Set session persistence to end when browser is closed
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session will expire on browser close");
  })
  .catch((error) => {
    console.error("Failed to set persistence:", error);
  });

// Re-export both the auth instance and the functions
export {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
};