import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 如果您将此代码下载并部署到自己的服务器/Vercel/Render中运行，
// 请务必在 Firebase 控制台 (console.firebase.google.com) 创建您自己的 Firebase 项目与 Firestore 数据库，
// 并将下方配置替换为您自己的私有项目凭证。否则：
// 1. 您的部署版本会与 AI Studio 预览数据库产生读写冲突（数据发生覆盖）。
// 2. 您将无法在自己的控制台中查看和持久化新注册的商人账户。

const firebaseConfig = {
  projectId: "yourbrands-34ccb",
  appId: "1:86958122631:web:8f6d411ae642b3dda99982",
  apiKey: "AIzaSyBd6hvBI74m0IEoOVrkfzDRdHYOOkxEgY",
  authDomain: "yourbrands-34ccb.firebaseapp.com",
  storageBucket: "yourbrands-34ccb.firebasestorage.app",
  messagingSenderId: "86958122631",
  measurementId: "G-41H44MQC8F"
};

const app = initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
