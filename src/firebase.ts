import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-applet-webapp-c7908",
  appId: "1:296554820985:web:fce4e17f8e125886f6aba8",
  apiKey: "AIzaSyD28QaVodqTnOe_rjlWKEWAS3qhWrujic8",
  authDomain: "ai-studio-applet-webapp-c7908.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-0fb15cb5-ca9b-48b9-8473-84b79ef78be7",
  storageBucket: "ai-studio-applet-webapp-c7908.firebasestorage.app",
  messagingSenderId: "296554820985",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
