import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 默认备用配置（连接至用户新建的独立高额度 Firebase 项目）
const fallbackConfig = {
  projectId: "yourbrands-34ccb",
  appId: "1:869581822631:web:8f6d411ae642b3dda99982",
  apiKey: "AIzaSyBd6hvBI74m0IEoOVrkfszDRdHYOOkxEgY",
  authDomain: "yourbrands-34ccb.firebaseapp.com",
  storageBucket: "yourbrands-34ccb.firebasestorage.app",
  messagingSenderId: "869581822631",
  measurementId: "G-41H44MQC8F"
};

// 自动连接到 AI Studio 活动数据库
let firebaseConfig: any = fallbackConfig;

try {
  // 动态导入配置，避免本地没有此文件时打包报错
  const activeAppletConfig = (import.meta as any).glob("../firebase-applet-config.json", { eager: true, import: "default" })["../firebase-applet-config.json"];
  if (activeAppletConfig && (activeAppletConfig as any).projectId) {
    firebaseConfig = activeAppletConfig;
    console.log("Connected successfully to permanent AI Studio Database: ", firebaseConfig.projectId);
  }
} catch (e) {
  console.warn("Using fallback firebaseConfig instead:", e);
}

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
