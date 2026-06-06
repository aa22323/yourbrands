import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");
const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");

let db: any = null;

try {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    const firebaseApp = initializeApp(config);
    db = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase initialized successfully with project ID:", config.projectId);
  } else {
    console.warn("firebase-applet-config.json not found. Falling back to local filesystem.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase", e);
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
      balance: 4800000,
      shop: DEFAULT_SHOP,
      orders: DEFAULT_ORDERS,
      financialLogs: [
        {
          id: 'TX-20260529-1025',
          type: 'settlement',
          typeLabel: '订单交割分润',
          amount: 140000,
          status: '已到账',
          description: '卡地亚经典勃艮第红机械表 [LP-0001] 交割出货秒级分佣入账',
          createdAt: '2026-05-29 11:15:32'
        },
        {
          id: 'TX-20260528-0955',
          type: 'withdraw',
          typeLabel: '三井住友提现',
          amount: -30000,
          status: '成功',
          description: '提现至三井住友银行 (渋谷支店 尾号8899)',
          createdAt: '2026-05-28 14:24:12'
        }
      ],
      withdrawHistory: [
        {
          id: 'WD-20260528-085',
          amount: 30000,
          bankName: '三井住友银行',
          branchName: '渋谷支店',
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

let cachedDb = INITIAL_DB;

// Load local cache on startup synchronously
try {
  if (fs.existsSync(DB_FILE)) {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    cachedDb = JSON.parse(content);
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
    cachedDb = INITIAL_DB;
  }
} catch (e) {
  console.error("Failed to read local cache on startup", e);
}

async function getDbFromFirebase() {
  if (!db) {
    return cachedDb;
  }
  try {
    const docRef = doc(db, "system_data", "aliexpress_database");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      cachedDb = {
        registeredUsers: data.registeredUsers || cachedDb.registeredUsers || [],
        merchantsDb: data.merchantsDb || cachedDb.merchantsDb || {}
      };
      // Async backup
      fs.writeFile(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8", (err) => {
        if (err) console.error("Error backing up file-system cache:", err);
      });
      return cachedDb;
    } else {
      console.log("No database document found in Firestore. Seeding database state...");
      await setDoc(docRef, cachedDb);
      return cachedDb;
    }
  } catch (e) {
    console.error("Failed to fetch from Firebase, using current cache:", e);
    return cachedDb;
  }
}

async function saveDbToFirebase(incomingUsers: any, incomingMerchants: any) {
  if (incomingUsers) cachedDb.registeredUsers = incomingUsers;
  if (incomingMerchants) cachedDb.merchantsDb = incomingMerchants;

  fs.writeFile(DB_FILE, JSON.stringify(cachedDb, null, 2), "utf-8", (err) => {
    if (err) console.error("Error backing up file-system cache during save:", err);
  });

  if (!db) return;

  try {
    const docRef = doc(db, "system_data", "aliexpress_database");
    await setDoc(docRef, cachedDb);
    console.log("Successfully synchronized state to cloud Firebase Firestore.");
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

  // API Route: Save state
  app.post("/api/db", async (req, res) => {
    const { registeredUsers, merchantsDb } = req.body;
    await saveDbToFirebase(registeredUsers, merchantsDb);
    res.json({ success: true });
  });

  // Serve static/assets or bundle middleware
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
