import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 默认备用配置（若用户在自己的独立云服务器/本地部署，将连接至此项目）
const fallbackConfig = {
  projectId: "yourbrands-34ccb",
  appId: "1:86958122631:web:8f6d411ae642b3dda99982",
  apiKey: "AIzaSyBd6hvBI74m0IEoOVrkfzDRdHYOOkxEgY",
  authDomain: "yourbrands-34ccb.firebaseapp.com",
  storageBucket: "yourbrands-34ccb.firebasestorage.app",
  messagingSenderId: "86958122631",
  measurementId: "G-41H44MQC8F"
};

// 自动连接到 AI Studio 活动数据库（如果是预览环境，保证商户和历史图片的永久性与无损迁移）
let firebaseConfig: any = fallbackConfig;

try {
  // 动态导入配置，避免本地没有此文件时打包报错
  const activeAppletConfig = import.meta.glob("../firebase-applet-config.json", { eager: true, import: "default" })["../firebase-applet-config.json"];
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

