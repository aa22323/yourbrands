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

const DEFAULT_ORDERS_FOR_STORE = [
  {
    id: 'ORD-20260528-001',
    shopId: '88888',
    customerName: 'Alex Song',
    customerPhone: '13812345678',
    shippingAddress: 'Suite 2201, Tower A, Riverside Plaza, Shanghai',
    orderDate: '2026-05-28 08:30',
    items: [
      {
        productId: 'LP-0001',
        productName: 'Cartier Bordeaux Classic Automatic Mechanical Watch',
        quantity: 1,
        retailPrice: 6200,
        costPrice: 5800,
        image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=500&q=80&fm=jpg&ext=.jpg'
      }
    ],
    totalPrice: 6200,
    totalProfit: 400,
    status: 'pending' as const
  },
  {
    id: 'ORD-20260528-002',
    shopId: '88888',
    customerName: 'Chloe Ji',
    customerPhone: '15988889911',
    shippingAddress: 'No. 19 Sanlitun Road, Chaoyang District, Beijing',
    orderDate: '2026-05-28 07:15',
    items: [
      {
        productId: 'LP-0002',
        productName: 'Gilded Amber Niche Luxury Perfume',
        quantity: 2,
        retailPrice: 135,
        costPrice: 120,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=500&q=80&fm=jpg&ext=.jpg'
      }
    ],
    totalPrice: 270,
    totalProfit: 30,
    status: 'shipped' as const
  },
  {
    id: 'ORD-20260528-003',
    shopId: '88888',
    customerName: 'Michael Chang',
    customerPhone: '13900112233',
    shippingAddress: 'Building 5, Tech Park, Nanshan, Shenzhen',
    orderDate: '2026-05-27 16:20',
    items: [
      {
        productId: 'LP-0003',
        productName: 'Montblanc Meisterstück Gold-Coated Classique Fountain Pen',
        quantity: 1,
        retailPrice: 950,
        costPrice: 880,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=500&q=80&fm=jpg&ext=.jpg'
      }
    ],
    totalPrice: 950,
    totalProfit: 70,
    status: 'completed' as const
  }
];

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
      balance: 15800,
      shop: {
        id: '88888',
        name: '总控旗舰奢优店',
        avatar: "/aliexpress_seller_logo_1780316211327.png",
        qrCode: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=300&fit=crop",
        addedProductIds: ['LP-0001', 'LP-0002', 'LP-0003', 'LP-0004', 'LP-0005', 'LP-0006', 'LP-0007', 'LP-0009', 'LP-0010']
      },
      orders: DEFAULT_ORDERS_FOR_STORE,
      financialLogs: [
        {
          id: 'TX-20260528-1025',
          type: 'settlement',
          typeLabel: '订单交割分润',
          amount: 1400,
          status: '已到账',
          description: '卡地亚经典勃艮第红机械表 [LP-0001] 交割出货秒级分佣入账',
          createdAt: '2026-05-28 11:15:32'
        },
        {
          id: 'TX-20260527-0955',
          type: 'withdraw',
          typeLabel: '银行账户提现',
          amount: -500,
          status: '成功',
          description: '提现至银行账户 (尾号8899)',
          createdAt: '2026-05-27 14:24:12'
        }
      ],
      withdrawHistory: [
        {
          id: 'WD-20260527-085',
          amount: 500,
          bankName: '银行账户',
          branchName: '总行',
          branchNo: '232',
          fullName: '总控旗舰奢优店',
          bankCard: '622202******8899',
          status: '已到账',
          createdAt: '2026-05-27 14:24:12'
        }
      ]
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

function ensureDefaultAccounts(database: any) {
  if (!database) database = {};
  if (!Array.isArray(database.registeredUsers)) {
    database.registeredUsers = [];
  }
  
  const defaultUsers = [
    { name: 'admin', password: '123456', id: '28401', isSalesman: false },
    { name: 'oopqwe001@gmail.com', password: '888888', id: '88888', isSalesman: false }
  ];

  defaultUsers.forEach(u => {
    if (!database.registeredUsers.some((existing: any) => existing && existing.name && existing.name.toLowerCase() === u.name.toLowerCase())) {
      database.registeredUsers.push(u);
    }
  });

  if (!database.merchantsDb || typeof database.merchantsDb !== 'object') {
    database.merchantsDb = {};
  }

  // Remove test artifact if present
  delete database.merchantsDb.test;

  // Ensure admin merchant
  if (!database.merchantsDb['admin'] || !database.merchantsDb['admin'].name) {
    database.merchantsDb['admin'] = INITIAL_DB.merchantsDb['admin'];
  }

  // Ensure oopqwe001@gmail.com merchant
  const oopKey = 'oopqwe001@gmail.com';
  if (!database.merchantsDb[oopKey] || !database.merchantsDb[oopKey].name) {
    database.merchantsDb[oopKey] = INITIAL_DB.merchantsDb[oopKey];
  } else {
    const m = database.merchantsDb[oopKey];
    if (!Array.isArray(m.orders) || m.orders.length === 0) {
      m.orders = DEFAULT_ORDERS_FOR_STORE;
    }
    if (typeof m.balance !== 'number') {
      m.balance = 15800;
    }
    if (!m.shop || !Array.isArray(m.shop.addedProductIds) || m.shop.addedProductIds.length === 0) {
      m.shop = {
        id: '88888',
        name: '总控旗舰奢优店',
        avatar: "/aliexpress_seller_logo_1780316211327.png",
        qrCode: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=300&fit=crop",
        addedProductIds: ['LP-0001', 'LP-0002', 'LP-0003', 'LP-0004', 'LP-0005', 'LP-0006', 'LP-0007', 'LP-0009', 'LP-0010'],
        ...(m.shop || {})
      };
    }
    if (!Array.isArray(m.financialLogs) || m.financialLogs.length === 0) {
      m.financialLogs = INITIAL_DB.merchantsDb[oopKey].financialLogs;
    }
    if (!Array.isArray(m.withdrawHistory) || m.withdrawHistory.length === 0) {
      m.withdrawHistory = INITIAL_DB.merchantsDb[oopKey].withdrawHistory;
    }
  }

  return database;
}

let cachedDb: any = INITIAL_DB;
let cachedCustomImagesMap: Record<string, string> = {};
let cachedCustomImageVersionsMap: Record<string, number> = {};

async function syncCustomImagesFromFirestore() {
  const imagesMap: Record<string, string> = { ...cachedCustomImagesMap };
  const versionsMap: Record<string, number> = { ...cachedCustomImageVersionsMap };

  if (adminDb) {
    try {
      const snap = await adminDb.collection("system_data").get();
      snap.docs.forEach((docSnap: any) => {
        if (docSnap.id.startsWith("custom_image_")) {
          const pId = docSnap.id.replace("custom_image_", "");
          const d = docSnap.data();
          if (d && d.image) {
            imagesMap[pId] = d.image;
            versionsMap[pId] = d.timestamp || 1;
          }
        }
      });
      cachedCustomImagesMap = imagesMap;
      cachedCustomImageVersionsMap = versionsMap;
      console.log(`[CustomImages] Synced ${Object.keys(imagesMap).length} custom product images via Admin SDK.`);
      return;
    } catch (adminErr: any) {
      console.warn("Admin SDK failed in syncCustomImagesFromFirestore, falling back to Client SDK...", adminErr.message || adminErr);
      adminDb = null;
    }
  }

  if (db) {
    try {
      const colRef = collection(db, "system_data");
      const snap = await getDocs(colRef);
      snap.docs.forEach((docSnap: any) => {
        if (docSnap.id.startsWith("custom_image_")) {
          const pId = docSnap.id.replace("custom_image_", "");
          const d = docSnap.data();
          if (d && d.image) {
            imagesMap[pId] = d.image;
            versionsMap[pId] = d.timestamp || 1;
          }
        }
      });
      cachedCustomImagesMap = imagesMap;
      cachedCustomImageVersionsMap = versionsMap;
      console.log(`[CustomImages] Synced ${Object.keys(imagesMap).length} custom product images via Client SDK.`);
    } catch (clientErr: any) {
      console.error("Client SDK failed in syncCustomImagesFromFirestore:", clientErr);
    }
  }
}

// Load local cache on startup synchronously
try {
  if (fs.existsSync(DB_FILE)) {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    cachedDb = ensureDefaultAccounts(migrateDatabaseToUsd(JSON.parse(content)));
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
  } else {
    cachedDb = ensureDefaultAccounts(INITIAL_DB);
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
  }
} catch (e) {
  console.error("Failed to read local cache on startup", e);
  cachedDb = ensureDefaultAccounts(INITIAL_DB);
}

function pruneDatabase(db: any) {
  if (!db || !db.merchantsDb) return db;
  for (const key of Object.keys(db.merchantsDb)) {
    const m = db.merchantsDb[key];
    if (m) {
      if (Array.isArray(m.orders)) {
        if (m.orders.length > 50) {
          console.log(`[Database Pruner] Truncating orders for ${key} from ${m.orders.length} to 50.`);
          m.orders = m.orders.slice(0, 50);
        }
        // Strip giant base64 images from order items to prevent Firestore document size overflow!
        m.orders.forEach((o: any) => {
          if (o && Array.isArray(o.items)) {
            o.items.forEach((item: any) => {
              if (item && item.image && item.image.startsWith("data:image/")) {
                item.image = ""; // Clear giant base64 string
              }
            });
          }
        });
      }
      if (Array.isArray(m.financialLogs) && m.financialLogs.length > 50) {
        console.log(`[Database Pruner] Truncating financialLogs for ${key} from ${m.financialLogs.length} to 50.`);
        m.financialLogs = m.financialLogs.slice(0, 50);
      }
      if (Array.isArray(m.withdrawHistory) && m.withdrawHistory.length > 50) {
        console.log(`[Database Pruner] Truncating withdrawHistory for ${key} from ${m.withdrawHistory.length} to 50.`);
        m.withdrawHistory = m.withdrawHistory.slice(0, 50);
      }
    }
  }
  return db;
}

function orderStatusRank(s?: string) {
  if (s === 'completed') return 3;
  if (s === 'shipped') return 2;
  return 1;
}

function mergeOrdersSmart(localOrders: any[], remoteOrders: any[]) {
  if (!Array.isArray(remoteOrders) || remoteOrders.length === 0) return localOrders || [];
  if (!Array.isArray(localOrders) || localOrders.length === 0) return remoteOrders;

  const localMap = new Map<string, any>();
  localOrders.forEach(o => {
    if (o && o.id) localMap.set(o.id, o);
  });

  const merged = remoteOrders.map(rem => {
    if (!rem || !rem.id) return rem;
    const loc = localMap.get(rem.id);
    if (!loc) return rem;

    const locRank = orderStatusRank(loc.status);
    const remRank = orderStatusRank(rem.status);

    if (locRank > remRank) {
      return {
        ...rem,
        status: loc.status,
        shippedAt: loc.shippedAt || rem.shippedAt
      };
    }
    return rem;
  });

  const remoteIds = new Set(remoteOrders.map(o => o?.id));
  localOrders.forEach(loc => {
    if (loc && loc.id && !remoteIds.has(loc.id)) {
      merged.push(loc);
    }
  });

  return merged;
}

async function getDbFromFirebase() {
  cachedDb = ensureDefaultAccounts(cachedDb);
  await syncCustomImagesFromFirestore();
  if (!cachedDb.merchantsDb) cachedDb.merchantsDb = {};
  if (!cachedDb.merchantsDb.system_config) cachedDb.merchantsDb.system_config = {};
  cachedDb.merchantsDb.system_config.customProductImages = {
    ...(cachedDb.merchantsDb.system_config.customProductImages || {}),
    ...cachedCustomImageVersionsMap
  };

  if (!adminDb && !db) {
    return { ...cachedDb, _isFallback: true };
  }

  const processCloudData = async (data: any) => {
    if (!data || !data.merchantsDb) return false;
    const cloudUpdatedAt = Number(data.updatedAt) || 0;
    const localUpdatedAt = Number(cachedDb.updatedAt) || 0;

    // If local cachedDb has a strictly newer timestamp, keep local cachedDb!
    if (localUpdatedAt > cloudUpdatedAt) {
      console.log(`[getDbFromFirebase] Local cache (ts: ${localUpdatedAt}) is newer than cloud Firestore (ts: ${cloudUpdatedAt}). Preserving local disk database.`);
      return true;
    }

    let loadedDb = {
      registeredUsers: data.registeredUsers || [],
      merchantsDb: data.merchantsDb || {},
      currency: data.currency,
      updatedAt: cloudUpdatedAt || Date.now()
    };
    loadedDb = ensureDefaultAccounts(loadedDb);

    // Smart-merge orders to ensure shipped / completed statuses from local disk are not regressed
    Object.keys(loadedDb.merchantsDb).forEach(mKey => {
      const cloudMerchant = loadedDb.merchantsDb[mKey];
      const localMerchant = cachedDb.merchantsDb?.[mKey];
      if (cloudMerchant && localMerchant && Array.isArray(localMerchant.orders)) {
        cloudMerchant.orders = mergeOrdersSmart(localMerchant.orders, cloudMerchant.orders || []);
      }
    });

    cachedDb = pruneDatabase(migrateDatabaseToUsd(loadedDb));
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
    return true;
  };

  try {
    if (adminDb) {
      try {
        const docSnap = await adminDb.collection("system_data").doc("aliexpress_database").get();
        if (docSnap.exists) {
          await processCloudData(docSnap.data() || {});
          return { ...cachedDb, _isFallback: false };
        } else {
          console.log("No database document found in Admin Firestore. Seeding database state...");
          cachedDb.updatedAt = Date.now();
          cachedDb = pruneDatabase(ensureDefaultAccounts(cachedDb));
          await adminDb.collection("system_data").doc("aliexpress_database").set(cachedDb);
          return { ...cachedDb, _isFallback: false };
        }
      } catch (adminErr: any) {
        console.warn("Firebase Admin SDK failed to fetch. Dynamically falling back to Client Web SDK...", adminErr.message || adminErr);
        adminDb = null;
      }
    }

    if (db) {
      const docRef = doc(db, "system_data", "aliexpress_database");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await processCloudData(docSnap.data() || {});
        return { ...cachedDb, _isFallback: false };
      } else {
        console.log("No database document found in Client Firestore. Seeding database state...");
        cachedDb.updatedAt = Date.now();
        cachedDb = pruneDatabase(ensureDefaultAccounts(cachedDb));
        await setDoc(docRef, cachedDb);
        return { ...cachedDb, _isFallback: false };
      }
    }

    return { ...cachedDb, _isFallback: true };
  } catch (e) {
    console.error("Failed to fetch from Firebase, using current cache:", e);
    return { ...cachedDb, _isFallback: true };
  }
}

async function saveDbToFirebase(incomingUsers: any, incomingMerchants: any) {
  // Merge users safely
  if (Array.isArray(incomingUsers) && incomingUsers.length > 0) {
    const existingUsersMap = new Map<string, any>();
    (cachedDb.registeredUsers || []).forEach((u: any) => {
      if (u && u.name) existingUsersMap.set(u.name.toLowerCase(), u);
    });
    incomingUsers.forEach((u: any) => {
      if (u && u.name) existingUsersMap.set(u.name.toLowerCase(), u);
    });
    cachedDb.registeredUsers = Array.from(existingUsersMap.values());
  }

  // Merge merchants safely
  if (incomingMerchants && typeof incomingMerchants === 'object') {
    if (!cachedDb.merchantsDb) cachedDb.merchantsDb = {};
    Object.keys(incomingMerchants).forEach(k => {
      if (k === 'test') return;
      const val = incomingMerchants[k];
      if (val && typeof val === 'object') {
        const existingMerchant = cachedDb.merchantsDb[k] || {};
        const incomingOrders = val.orders;
        const mergedOrders = Array.isArray(incomingOrders)
          ? mergeOrdersSmart(existingMerchant.orders || [], incomingOrders)
          : (existingMerchant.orders || []);

        cachedDb.merchantsDb[k] = {
          ...existingMerchant,
          ...val,
          orders: mergedOrders
        };
      }
    });
  }

  cachedDb = ensureDefaultAccounts(cachedDb);
  cachedDb.updatedAt = Date.now();
  cachedDb = pruneDatabase(cachedDb);

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
    console.log("[server] Wrote updated state to database.json cleanly. Timestamp:", cachedDb.updatedAt);
  } catch (err) {
    console.error("Error backing up file-system cache during save:", err);
  }

  if (!adminDb && !db) return;

  try {
    if (adminDb) {
      try {
        await adminDb.collection("system_data").doc("aliexpress_database").set(cachedDb);
        console.log("Successfully synchronized state to cloud Firestore using Admin SDK.");
        return;
      } catch (adminErr: any) {
        console.warn("Firebase Admin SDK failed to save. Dynamically falling back to Client Web SDK...", adminErr.message || adminErr);
        adminDb = null;
      }
    }

    if (db) {
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

  // API Route: Get all custom product images
  app.get("/api/custom-images", async (req, res) => {
    if (Object.keys(cachedCustomImagesMap).length === 0) {
      await syncCustomImagesFromFirestore();
    }
    res.json({
      images: cachedCustomImagesMap,
      versions: cachedCustomImageVersionsMap
    });
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
