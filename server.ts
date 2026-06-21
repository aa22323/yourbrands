import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { initializeApp as initializeAdminApp, cert } from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");
const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");
const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "firebase-service-account.json");

let db: any = null;
let adminDb: any = null;

// 1. Initialize Firebase Admin SDK (with Service Account Credentials)
try {
  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));
    const adminApp = initializeAdminApp({
      credential: cert(serviceAccount)
    });
    adminDb = getAdminFirestore(adminApp);
    console.log("Firebase Admin SDK successfully initialized for project:", serviceAccount.project_id);
  } else {
    console.warn("firebase-service-account.json not found on backend. Falling back to Client SDK.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase Admin SDK", e);
}

// 2. Initialize Firebase Web Client SDK fallback
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    const firebaseApp = initializeApp(config);
    db = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase Client SDK initialized with project ID:", config.projectId);
  } else {
    console.warn("firebase-applet-config.json not found. Falling back to local filesystem cache.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase Client SDK fallback", e);
}

const DEFAULT_SHOP = {
  id: "shop-temp",
  name: "AliExpress Seller Store",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
  banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
  qrCode: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=300&fit=crop",
  rating: 4.9,
  reviewsCount: 384,
  shippingTime: "24小时极速发货",
  guarantee: "原厂质保 · 假一赔十",
  addedProductIds: []
};

const DEFAULT_ORDERS: any[] = [];

const INITIAL_DB = {
  registeredUsers: [
    { name: 'admin', password: '123456', id: '28401', isSalesman: false },
    { name: 'oopqwe001@gmail.com', password: '888888', id: '88888', isSalesman: false }
  ],
  merchantsDb: {
    'admin': {
      name: 'admin',
      password: '123456',
      id: '28401',
      balance: 48000,
      shop: DEFAULT_SHOP,
      orders: DEFAULT_ORDERS,
      financialLogs: [
        {
          id: 'TX-20260529-1025',
          type: 'settlement',
          typeLabel: '订单交割分润',
          amount: 1400,
          status: '已到账',
          description: '卡地亚经典勃艮第红机械表 [LP-0001] 交割出货秒级分佣入账',
          createdAt: '2026-05-29 11:15:32'
        },
        {
          id: 'TX-20260528-0955',
          type: 'withdraw',
          typeLabel: '银行账户提现',
          amount: -300,
          status: '成功',
          description: '提现至银行账户 (尾号8899)',
          createdAt: '2026-05-28 14:24:12'
        }
      ],
      withdrawHistory: [
        {
          id: 'WD-20260528-085',
          amount: 300,
          bankName: '银行账户',
          branchName: '总行',
          branchNo: '232',
          fullName: '雅领高奢美学',
          bankCard: '622202******8899',
          status: '已到账',
          createdAt: '2026-05-28 14:24:12'
        }
      ]
    },
    'oopqwe001@gmail.com': {
      name: 'oopqwe001@gmail.com',
      password: '888888',
      id: '88888',
      balance: 0,
      shop: {
        id: '88888',
        name: '总控旗舰奢优店',
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
        qrCode: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=300&fit=crop",
        addedProductIds: []
      },
      orders: [],
      financialLogs: [],
      withdrawHistory: []
    }
  }
};

function migrateDatabaseToUsd(db: any) {
  if (!db) return db;
  if (db.currency === "USD") {
    return db;
  }
  
  db.currency = "USD";
  
  if (db.merchantsDb) {
    for (const key of Object.keys(db.merchantsDb)) {
      const m = db.merchantsDb[key];
      if (m) {
        if (typeof m.balance === "number") {
          // If the balance is JPY, divide by 100 to convert to reasonable USD
          m.balance = Math.round((m.balance / 100) * 100) / 100;
        }
        
        if (Array.isArray(m.orders)) {
          m.orders.forEach((o: any) => {
            if (typeof o.totalPrice === "number") o.totalPrice = Math.round((o.totalPrice / 100) * 100) / 100;
            if (typeof o.totalProfit === "number") o.totalProfit = Math.round((o.totalProfit / 100) * 100) / 100;
            if (Array.isArray(o.items)) {
              o.items.forEach((item: any) => {
                if (typeof item.retailPrice === "number") item.retailPrice = Math.round((item.retailPrice / 100) * 100) / 100;
                if (typeof item.costPrice === "number") item.costPrice = Math.round((item.costPrice / 100) * 100) / 100;
              });
            }
          });
        }
        
        if (Array.isArray(m.financialLogs)) {
          m.financialLogs.forEach((log: any) => {
            if (typeof log.amount === "number") log.amount = Math.round((log.amount / 100) * 100) / 100;
            if (log.description) {
              log.description = log.description.replace(/¥/g, "$");
            }
          });
        }
        
        if (Array.isArray(m.withdrawHistory)) {
          m.withdrawHistory.forEach((w: any) => {
            if (typeof w.amount === "number") w.amount = Math.round((w.amount / 100) * 100) / 100;
            if (w.bankName === '三井住友银行') {
              w.bankName = '银行账户';
              w.branchName = '总行';
            }
          });
        }
      }
    }
  }
  return db;
}

let cachedDb: any = INITIAL_DB;

// Load local cache on startup synchronously
try {
  if (fs.existsSync(DB_FILE)) {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    cachedDb = migrateDatabaseToUsd(JSON.parse(content));
    // Immediately write back migrated structure locally
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
    cachedDb = INITIAL_DB;
  }
} catch (e) {
  console.error("Failed to read local cache on startup", e);
}

async function getDbFromFirebase() {
  if (!adminDb && !db) {
    return { ...cachedDb, _isFallback: true };
  }
  try {
    if (adminDb) {
      // Use Firebase Admin SDK
      const docSnap = await adminDb.collection("system_data").doc("aliexpress_database").get();
      if (docSnap.exists) {
        const data = docSnap.data() || {};
        const remoteUpdatedAt = data.updatedAt || 0;
        const localUpdatedAt = cachedDb.updatedAt || 0;
        
        if (remoteUpdatedAt > localUpdatedAt) {
          let loadedDb = {
            registeredUsers: data.registeredUsers || cachedDb.registeredUsers || [],
            merchantsDb: data.merchantsDb || cachedDb.merchantsDb || {},
            currency: data.currency,
            updatedAt: remoteUpdatedAt
          };
          const needsRemoteSave = loadedDb.currency !== "USD";
          cachedDb = migrateDatabaseToUsd(loadedDb);
          // Async backup to local json
          fs.writeFile(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8", (err) => {
            if (err) console.error("Error backing up file-system cache:", err);
          });
          if (needsRemoteSave) {
            console.log("Saving migrated USD database back to Admin Firebase...");
            await adminDb.collection("system_data").doc("aliexpress_database").set(cachedDb);
          }
        } else {
          console.log(`Local filesystem cache is newer or equal (${localUpdatedAt}) than Admin Firestore (${remoteUpdatedAt}). Retaining local data.`);
        }
        return { ...cachedDb, _isFallback: false };
      } else {
        console.log("No database document found in Admin Firestore. Seeding database state...");
        cachedDb.updatedAt = Date.now();
        await adminDb.collection("system_data").doc("aliexpress_database").set(cachedDb);
        return { ...cachedDb, _isFallback: false };
      }
    } else {
      // Use Client SDK fallback
      const docRef = doc(db, "system_data", "aliexpress_database");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() || {};
        const remoteUpdatedAt = data.updatedAt || 0;
        const localUpdatedAt = cachedDb.updatedAt || 0;
        
        if (remoteUpdatedAt > localUpdatedAt) {
          let loadedDb = {
            registeredUsers: data.registeredUsers || cachedDb.registeredUsers || [],
            merchantsDb: data.merchantsDb || cachedDb.merchantsDb || {},
            currency: data.currency,
            updatedAt: remoteUpdatedAt
          };
          const needsRemoteSave = loadedDb.currency !== "USD";
          cachedDb = migrateDatabaseToUsd(loadedDb);
          fs.writeFile(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8", (err) => {
            if (err) console.error("Error backing up file-system cache:", err);
          });
          if (needsRemoteSave) {
            console.log("Saving migrated USD database back to Client Firebase...");
            await setDoc(docRef, cachedDb);
          }
        } else {
          console.log(`Local filesystem cache is newer or equal (${localUpdatedAt}) than Client Firestore (${remoteUpdatedAt}). Retaining local data.`);
        }
        return { ...cachedDb, _isFallback: false };
      } else {
        console.log("No database document found in Client Firestore. Seeding database state...");
        cachedDb.updatedAt = Date.now();
        await setDoc(docRef, cachedDb);
        return { ...cachedDb, _isFallback: false };
      }
    }
  } catch (e) {
    console.error("Failed to fetch from Firebase, using current cache:", e);
    return { ...cachedDb, _isFallback: true };
  }
}

async function saveDbToFirebase(incomingUsers: any, incomingMerchants: any) {
  if (incomingUsers) cachedDb.registeredUsers = incomingUsers;
  if (incomingMerchants) cachedDb.merchantsDb = incomingMerchants;
  cachedDb.updatedAt = Date.now(); // SET Newer write timestamp!

  fs.writeFile(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8", (err) => {
    if (err) console.error("Error backing up file-system cache during save:", err);
  });

  if (!adminDb && !db) return;

  try {
    if (adminDb) {
      await adminDb.collection("system_data").doc("aliexpress_database").set(cachedDb);
      console.log("Successfully synchronized state to cloud Firestore using Admin SDK.");
    } else {
      const docRef = doc(db, "system_data", "aliexpress_database");
      await setDoc(docRef, cachedDb);
      console.log("Successfully synchronized state to cloud Firestore using Client SDK fallback.");
    }
  } catch (e) {
    console.error("Failed to save state to Firebase Firestore:", e);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // API Route: Get state
  app.get("/api/db", async (req, res) => {
    const currentDb = await getDbFromFirebase();
    res.json(currentDb);
  });

  // Diagnostic Endpoint
  app.get("/api/check-firestore", async (req, res) => {
    if (!adminDb && !db) {
      return res.status(500).json({ error: "Firestore is not initialized on backend." });
    }
    try {
      if (adminDb) {
        const snap = await adminDb.collection("system_data").get();
        const docsList = snap.docs.map((doc: any) => ({
          id: doc.id,
          keys: doc.data() ? Object.keys(doc.data()) : []
        }));
        res.json({
          initializedBy: "Firebase Admin SDK",
          totalDocuments: docsList.length,
          documents: docsList
        });
      } else {
        const colRef = collection(db, "system_data");
        const snap = await getDocs(colRef);
        const docsList = snap.docs.map(doc => ({
          id: doc.id,
          keys: doc.data() ? Object.keys(doc.data()) : []
        }));
        res.json({
          initializedBy: "Firebase Client SDK Fallback",
          totalDocuments: docsList.length,
          documents: docsList
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || err.toString() });
    }
  });

  // API Route: Save state
  app.post("/api/db", async (req, res) => {
    const { registeredUsers, merchantsDb } = req.body;
    await saveDbToFirebase(registeredUsers, merchantsDb);
    res.json({ success: true });
  });

  // Serve static/assets or bundle middleware
  app.use(express.static(path.join(process.cwd(), 'public')));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
