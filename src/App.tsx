import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc, FieldPath, onSnapshot, deleteField } from 'firebase/firestore';
import { 
  Home, ShoppingBag, User, Sparkles, Wifi, Battery, Radio, 
  Clock, Share2, Compass, AlertCircle, HelpCircle, ShoppingCart,
  Check, Eye, EyeOff
} from 'lucide-react';

import { AppTab, Shop, Order, ViewRole, CartItem, Product, FinancialTransaction } from './types';
import { 
  ALL_PRODUCTS, 
  DEFAULT_SHOP, 
  DEFAULT_ORDERS, 
  SHOP_DATA_KEY, 
  ORDERS_DATA_KEY,
  resolveAvatar
} from './data';

import HomeView from './components/HomeView';
import ProductSection from './components/ProductSection';
import ProfileView from './components/ProfileView';
import CartView from './components/CartView';
import MyShopModal from './components/MyShopModal';
import AdminDashboardView from './components/AdminDashboardView';
import { AppLanguage, TRANSLATIONS, setProductImageOverrides } from './utils/translations';

const ORIGINAL_PRODUCT_IMAGES: Record<string, string> = {};
ALL_PRODUCTS.forEach(p => {
  ORIGINAL_PRODUCT_IMAGES[p.id] = p.image;
});

export default function App() {
  const isPollingUpdateRef = useRef<boolean>(false);
  const lastMutationTimeRef = useRef<number>(0);
  const lastFetchedDataRef = useRef<{ registeredUsers: any[]; merchantsDb: Record<string, any> } | null>(null);
  const hasFetchedRef = useRef<boolean>(false);
  const prevCustomImagesRef = useRef<Record<string, string>>({});

  const [customProductImages, setCustomProductImages] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_custom_product_images');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setProductImageOverrides(parsed);
          ALL_PRODUCTS.forEach(p => {
            if (parsed[p.id]) {
              p.image = parsed[p.id];
            }
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading cached custom product images', e);
    }
    return {};
  });

  const [customProductImageVersions, setCustomProductImageVersions] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_custom_product_image_versions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading cached custom image versions', e);
    }
    return {};
  });

  const customProductImagesRef = useRef<Record<string, string>>(customProductImages);
  const customProductImageVersionsRef = useRef<Record<string, number>>(customProductImageVersions);

  useEffect(() => {
    customProductImagesRef.current = customProductImages;
    prevCustomImagesRef.current = customProductImages;
    try {
      localStorage.setItem('aliexpress_custom_product_images', JSON.stringify(customProductImages));
    } catch (e) {
      console.warn('Failed to save custom images to localStorage', e);
    }
  }, [customProductImages]);

  useEffect(() => {
    customProductImageVersionsRef.current = customProductImageVersions;
    try {
      localStorage.setItem('aliexpress_custom_product_image_versions', JSON.stringify(customProductImageVersions));
    } catch (e) {
      console.warn('Failed to save custom image versions to localStorage', e);
    }
  }, [customProductImageVersions]);
  
  // 1. Core State Handlers
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [viewRole, setViewRole] = useState<ViewRole>('merchant');

  // Real-time gold coins state
  const [userCoins, setUserCoins] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_user_coins');
      if (stored !== null) {
        return parseInt(stored, 10);
      }
    } catch (e) {
      console.error('Error loading coins balance', e);
    }
    return 1500;
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_user_coins', String(userCoins));
  }, [userCoins]);

  // Language Support State
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_app_language');
      if (stored === 'zh' || stored === 'en' || stored === 'es' || stored === 'ja' || stored === 'ko' || stored === 'vi') {
        return stored as AppLanguage;
      }
    } catch (e) {
      console.error(e);
    }
    
    // Automatically detect language based on browser settings (runs synchronously for instant native rendering)
    try {
      const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      if (browserLang.startsWith('zh')) return 'zh';
      if (browserLang.startsWith('ja')) return 'ja';
      if (browserLang.startsWith('ko')) return 'ko';
      if (browserLang.startsWith('vi')) return 'vi';
      if (browserLang.startsWith('es')) return 'es';
    } catch (err) {
      console.warn('Browser language auto-detection failed:', err);
    }
    return 'zh'; // Default to zh
  });

  // Background IP Geolocation Check to adapt language more accurately based on actual visiting country
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aliexpress_app_language');
      // Only geo-locate if user has not explicitly persisted a manual language selection choice
      if (!stored) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s fast timeout

        fetch('https://ipapi.co/json/', { signal: controller.signal })
          .then(res => res.json())
          .then(data => {
            clearTimeout(timeoutId);
            if (data && data.country_code) {
              const country = data.country_code.toUpperCase();
              console.log(`Auto-detected region from IP: ${country}`);
              
              let detectedLang: AppLanguage = 'en';
              if (['CN', 'TW', 'HK', 'MO'].includes(country)) {
                detectedLang = 'zh';
              } else if (country === 'JP') {
                detectedLang = 'ja';
              } else if (country === 'KR') {
                detectedLang = 'ko';
              } else if (country === 'VN') {
                detectedLang = 'vi';
              } else if (['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'UY', 'PA'].includes(country)) {
                detectedLang = 'es';
              } else {
                detectedLang = 'en';
              }
              
              setAppLanguage(detectedLang);
            }
          })
          .catch(err => {
            console.log('Background IP-to-Country geolocation skipped or timed out:', err.message);
          });
      }
    } catch (err) {
      console.error('IP geolocation hook error:', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aliexpress_app_language', appLanguage);
  }, [appLanguage]);

  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_is_logged_in');
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (e) {
      console.error(e);
    }
    return false; // For real online launch, keep it false so users must login/register
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // User Account Identification State (Email or Username)
  const [userAccountName, setUserAccountName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_user_account_name');
      if (stored) {
        return stored;
      }
    } catch (e) {
      console.error(e);
    }
    return ''; // default empty
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_user_account_name', userAccountName);
  }, [userAccountName]);

  // Track which user account profile is currently loaded in active React hook states (userBalance, shop, orders)
  const [loadedUserAccount, setLoadedUserAccount] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_user_account_name');
      return stored || '';
    } catch {
      return '';
    }
  });

  // Registered Users database
  const [registeredUsers, setRegisteredUsers] = useState<{ name: string; password?: string; id: string; isSalesman?: boolean }[]>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_registered_users_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasMaster = parsed.some(u => u.name.toLowerCase() === 'oopqwe001@gmail.com');
          if (!hasMaster) {
            parsed.push({ name: 'oopqwe001@gmail.com', password: '888888', id: '88888', isSalesman: false });
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { name: 'admin', password: '123456', id: '28401', isSalesman: false },
      { name: 'oopqwe001@gmail.com', password: '888888', id: '88888', isSalesman: false }
    ];
  });

  // Load initial remote database data if available for real-time full-stack multi-user sync
  useEffect(() => {
    let active = true;
    let isInitial = true;
    let unsubscribeSnap: (() => void) | null = null;

    const loadedCustomImages: Record<string, string> = {};
    const loadedCustomImageVersions: Record<string, number> = {};
    const activeFetches = new Set<string>();

    const processDatabaseUpdate = async (incomingUsers: any[], incomingMerchants: Record<string, any>) => {
      hasFetchedRef.current = true;
      if (!active) return;
      
      // If we recently performed a local mutation, wait to prevent race conditions
      if (Date.now() - lastMutationTimeRef.current < 8000) {
        return;
      }

      // Version-aware smart-fetching: check if other admins added / updated images
      const cloudImagesDict = incomingMerchants.system_config?.customProductImages || {};

      Object.keys(cloudImagesDict).forEach(pId => {
        const cloudVersion = Number(cloudImagesDict[pId]);
        const currentLocalVer = customProductImageVersionsRef.current[pId] || loadedCustomImageVersions[pId] || 0;
        const currentLocalImg = customProductImagesRef.current[pId] || loadedCustomImages[pId];

        if (!currentLocalImg || (cloudVersion > 0 && cloudVersion > currentLocalVer)) {
          if (activeFetches.has(pId)) return;
          activeFetches.add(pId);

          // Lazy-load updated product images in background parallel threads progressively
          getDoc(doc(db, 'system_data', `custom_image_${pId}`))
            .then(imgSnap => {
              if (active && imgSnap.exists()) {
                const imgData = imgSnap.data();
                if (imgData?.image) {
                  const fetchedImg = imgData.image;
                  const fetchedVer = Number(imgData.timestamp || cloudVersion || 1);

                  loadedCustomImages[pId] = fetchedImg;
                  loadedCustomImageVersions[pId] = fetchedVer;

                  // Double check safety
                  setCustomProductImages(prev => ({
                    ...prev,
                    [pId]: fetchedImg
                  }));
                  setCustomProductImageVersions(prev => ({
                    ...prev,
                    [pId]: fetchedVer
                  }));
                }
              }
            })
            .catch(imageErr => {
              console.warn(`Failed lazy-loading custom image for product ${pId}:`, imageErr);
            })
            .finally(() => {
              activeFetches.delete(pId);
            });
        }
      });

      // Clear out any locally cached overrides that have been deleted in the cloud system_config
      const localImageKeys = Object.keys(customProductImagesRef.current);
      let localStateModified = false;
      const nextLocalImages = { ...customProductImagesRef.current };
      const nextLocalVersions = { ...customProductImageVersionsRef.current };

      localImageKeys.forEach(pId => {
        if (!cloudImagesDict[pId]) {
          delete nextLocalImages[pId];
          delete nextLocalVersions[pId];
          delete loadedCustomImages[pId];
          delete loadedCustomImageVersions[pId];
          localStateModified = true;
        }
      });

      if (localStateModified) {
        setCustomProductImages(nextLocalImages);
        setCustomProductImageVersions(nextLocalVersions);
      }

      isPollingUpdateRef.current = true;

      // Renormalize any dot-corrupted Firestore maps (e.g. "abc@qq": { "com": profile }) back into flat dot keys ("abc@qq.com": profile)
      const normalizedMerchants: Record<string, any> = {};
      const collapseKeys = (obj: any, prefix: string) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          if (obj.name) {
            normalizedMerchants[prefix.toLowerCase()] = obj;
          } else {
            Object.keys(obj).forEach(key => {
              collapseKeys(obj[key], prefix ? `${prefix}.${key}` : key);
            });
          }
        }
      };
      
      let finalMerchants = { ...incomingMerchants };
      Object.keys(finalMerchants).forEach(k => {
        if (k === 'system_config') {
          normalizedMerchants[k] = finalMerchants[k];
          return;
        }
        const val = finalMerchants[k];
        if (val && typeof val === 'object' && !Array.isArray(val) && !val.name) {
          collapseKeys(val, k);
        } else {
          normalizedMerchants[k] = val;
        }
      });
      finalMerchants = normalizedMerchants;

      // Ensure system_config exists
      if (!finalMerchants.system_config) {
        finalMerchants.system_config = {};
      }

      // Pre-populate missing profile structures for registered users in merchantsDb
      incomingUsers.forEach((u: any) => {
        if (u && u.name) {
          const k = u.name.toLowerCase();
          if (!finalMerchants[k]) {
            const fId = u.id || '53' + Math.floor(100 + Math.random() * 900);
            finalMerchants[k] = {
              name: u.name,
              password: u.password || '123456',
              id: fId,
              promotedBy: u.promotedBy || null,
              isSalesman: u.isSalesman || false,
              isAdmin: u.isAdmin || false,
              balance: 0,
              shop: { 
                ...DEFAULT_SHOP, 
                id: fId, 
                name: u.name,
                addedProductIds: [...DEFAULT_SHOP.addedProductIds]
              },
              orders: [],
              financialLogs: [],
              withdrawHistory: []
            };
          } else {
            // Ensure flags and parameters exist on merchant profile
            finalMerchants[k].isSalesman = u.isSalesman || false;
            finalMerchants[k].isAdmin = u.isAdmin || false;
            if (u.promotedBy !== undefined) {
              finalMerchants[k].promotedBy = u.promotedBy;
            }
          }
        }
      });

      if (incomingUsers.length > 0) {
        setRegisteredUsers(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(incomingUsers)) {
            return incomingUsers;
          }
          return prev;
        });
      }

      setMerchantsDb(prev => {
        if (Object.keys(finalMerchants).length === 0) {
          return prev;
        }
        
        const merged = { ...prev, ...finalMerchants };
        
        if (merged.system_config) {
          // Take the authoritative cloud custom product image config list as is to prevent client-side timestamp degradation
          merged.system_config.customProductImages = finalMerchants.system_config?.customProductImages || {};
        }

        if (JSON.stringify(prev) !== JSON.stringify(merged)) {
          return merged;
        }
        return prev;
      });

      // Keep our local cached reference of the fetched data synchronized
      lastFetchedDataRef.current = {
        registeredUsers: JSON.parse(JSON.stringify(incomingUsers)),
        merchantsDb: JSON.parse(JSON.stringify(finalMerchants))
      };

      // Reset polling flag after state updates settle
      setTimeout(() => {
        isPollingUpdateRef.current = false;
      }, 100);
    };

    const loadInitialAndListen = async () => {
      try {
        let incomingUsers: any[] = [];
        let incomingMerchants: Record<string, any> = {};
        let loadedFromServer = false;

        if (isInitial) {
          // 1. Prioritize Express proxy load (avoids sandboxed iframe WebSocket and gRPC restrictions)
          try {
            const apiRes = await fetch('/api/db');
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData && apiData.registeredUsers && apiData.merchantsDb) {
                incomingUsers = apiData.registeredUsers;
                incomingMerchants = apiData.merchantsDb;
                if (!apiData._isFallback) {
                  loadedFromServer = true;
                  console.log("Successfully connected and synchronized Aliexpress database from server proxy.");
                } else {
                  console.warn("Express server proxy returned safe local fallback cache. Attempting direct Firestore query but keeping local cache as active fallback.");
                }
              }
            }
          } catch (apiErr) {
            console.warn("Express server proxy database query offline, trying direct cloud Firestore fallback:", apiErr);
          }

          // 2. Direct Firestore fallback (wrapped in try/catch to survive quota constraints)
          if (!loadedFromServer) {
            try {
              const docSnap = await getDoc(doc(db, 'system_data', 'aliexpress_database'));
              if (docSnap.exists() && active) {
                const d = docSnap.data();
                incomingUsers = d.registeredUsers || incomingUsers;
                incomingMerchants = d.merchantsDb || incomingMerchants;
                loadedFromServer = true;
                console.log("Successfully retrieved latest database state directly from cloud Firestore.");
              }
            } catch (fsErr) {
              console.warn("Direct Firestore fallback fetch failed (e.g. daily read quota limit exceeded). Using server filesystem-level cache:", fsErr);
            }
          }

          await processDatabaseUpdate(incomingUsers, incomingMerchants);
          isInitial = false;
        }

        // Register the Firestore onSnapshot real-time listener for zero-latency live synchronization
        const docRef = doc(db, 'system_data', 'aliexpress_database');
        unsubscribeSnap = onSnapshot(docRef, async (docSnap) => {
          if (!active) return;
          if (docSnap.exists()) {
            const d = docSnap.data();
            const usersList = d.registeredUsers || [];
            const merchantsData = d.merchantsDb || {};
            await processDatabaseUpdate(usersList, merchantsData);
          }
        }, (err) => {
          console.warn("Firestore database listener disconnected (or quota limit exceeded). Fallback system remains active.", err);
        });

      } catch (err) {
        console.warn('Firebase document load offline. Using local cache/localStorage fallback.', err);
      }
    };

    loadInitialAndListen();

    // Setup highly stable Express server proxy light-polling interval to guarantee real-time updates inside iframes
    const pollingInterval = setInterval(async () => {
      if (!active) return;
      try {
        const apiRes = await fetch('/api/db');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && apiData.registeredUsers && apiData.merchantsDb) {
            // Guard: If we recently made a change locally, let propagation settle before receiving polling state
            if (Date.now() - lastMutationTimeRef.current < 8000) {
              return;
            }
            await processDatabaseUpdate(apiData.registeredUsers, apiData.merchantsDb);
          }
        }
      } catch (pollingErr) {
        console.warn("Failed polling server updates, continuing backend sync fallback scheme:", pollingErr);
      }
    }, 12000);

    return () => {
      active = false;
      if (unsubscribeSnap) {
        unsubscribeSnap();
      }
      clearInterval(pollingInterval);
    };
  }, []);

  // Master multi-merchant database state
  const [merchantsDb, setMerchantsDb] = useState<Record<string, any>>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_merchants_database_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    
    // Default system seed state
    return {
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
          avatar: DEFAULT_SHOP.avatar,
          qrCode: DEFAULT_SHOP.qrCode,
          addedProductIds: []
        },
        orders: [],
        financialLogs: [],
        withdrawHistory: []
      }
    };
  });

  // Synchronize custom product image overrides to translation registry synchronously inside the render cycle
  setProductImageOverrides(customProductImages || {});

  // Combine registeredUsers and merchantsDb saving into a single atomic payload to prevent write race conditions
  useEffect(() => {
    // CRITICAL: Avoid saving on initial mount before we have successfully fetched the master database from the server.
    // If we haven't fetched yet, writing back will overwrite the server database with empty/stale local state.
    if (!hasFetchedRef.current) {
      return;
    }

    // If the state was updated from a polling response, do not POST it back to the server.
    if (isPollingUpdateRef.current) {
      isPollingUpdateRef.current = false;
      return;
    }

    // Structural safe-check: if it matches the last fetched state from polling, skip writing back
    if (lastFetchedDataRef.current) {
      const matchUsers = JSON.stringify(registeredUsers) === JSON.stringify(lastFetchedDataRef.current.registeredUsers);
      const matchDb = JSON.stringify(merchantsDb) === JSON.stringify(lastFetchedDataRef.current.merchantsDb);
      if (matchUsers && matchDb) {
        return;
      }
    }

    // Set last mutation time to locked to prevent pulling older state from server during propagation
    lastMutationTimeRef.current = Date.now();

    const nowTime = Date.now();

    // To prevent QuotaExceededError (which halts React execution with a white screen),
    // we must sanitize merchantsDb to strip the heavy Base64 image strings before saving to localStorage!
    // These heavy images are already backed up in individual system_data Firestore documents anyway,
    // and are loaded and merged dynamically on page boot.
    const localSanitizedDb = { ...merchantsDb };
    localSanitizedDb.updatedAt = nowTime;
    if (localSanitizedDb.system_config) {
      const lightImages: Record<string, number | boolean> = {};
      const currentImages = localSanitizedDb.system_config.customProductImages || {};
      Object.keys(currentImages).forEach(pId => {
        if (currentImages[pId]) {
          lightImages[pId] = typeof currentImages[pId] === 'number' ? currentImages[pId] : (customProductImageVersions[pId] || Date.now());
        }
      });
      localSanitizedDb.system_config = {
        ...localSanitizedDb.system_config,
        customProductImages: lightImages
      };
    }

    try {
      localStorage.setItem('aliexpress_registered_users_list', JSON.stringify(registeredUsers));
      localStorage.setItem('aliexpress_merchants_database_v2', JSON.stringify(localSanitizedDb));
    } catch (localErr) {
      console.warn('Met QuotaExceededError when saving to localStorage. Stripping non-essential state cache and retrying.', localErr);
      try {
        // Fallback: Clear heavy caches to prevent crashes
        localStorage.setItem('aliexpress_registered_users_list', JSON.stringify(registeredUsers));
        // Save without system_config completely if needed as system_config is fetched on boot anyway
        const minimalDb = { ...localSanitizedDb };
        delete minimalDb.system_config;
        localStorage.setItem('aliexpress_merchants_database_v2', JSON.stringify(minimalDb));
      } catch (critErr) {
        console.error('Critical failure saving to localStorage:', critErr);
      }
    }

    const docRef = doc(db, 'system_data', 'aliexpress_database');

    // Build highly optimized update arguments using FieldPath to prevent dot nesting issues inside emails!
    const updateArgs: any[] = [];

    // Always include updatedAt in direct Firestore updates to keep database timestamp fresh
    updateArgs.push('updatedAt', nowTime);

    // 1. If registeredUsers changed, synchronize the array
    if (!lastFetchedDataRef.current || JSON.stringify(registeredUsers) !== JSON.stringify(lastFetchedDataRef.current.registeredUsers)) {
      updateArgs.push('registeredUsers', registeredUsers);
    }

    // 2. Identify and synchronize ONLY modified or deleted merchant profiles using FieldPath
    if (lastFetchedDataRef.current?.merchantsDb) {
      // Find modified or added merchants
      Object.keys(merchantsDb).forEach(k => {
        if (k === 'system_config') return; // system_config is handled separately with proper admin verification
        const currentProfile = merchantsDb[k];
        const lastProfile = lastFetchedDataRef.current?.merchantsDb[k];
        if (JSON.stringify(currentProfile) !== JSON.stringify(lastProfile)) {
          updateArgs.push(new FieldPath('merchantsDb', k), currentProfile);
        }
      });
      // Find deleted merchants
      Object.keys(lastFetchedDataRef.current.merchantsDb).forEach(k => {
        if (k === 'system_config') return;
        if (!(k in merchantsDb)) {
          updateArgs.push(new FieldPath('merchantsDb', k), deleteField());
        }
      });
    } else {
      // If no last fetched data is available yet, only update the active logged-in merchant to keep it extremely safe
      const userKey = userAccountName.toLowerCase();
      if (userKey && merchantsDb[userKey]) {
        updateArgs.push(new FieldPath('merchantsDb', userKey), merchantsDb[userKey]);
      }
    }

    // 3. System Config (Admin setup, custom product images)
    // ONLY permit the authenticated administrator to update global configurations!
    const userKeyLower = userAccountName.toLowerCase();
    const isCurrentUserAdmin = userKeyLower === 'admin' || userKeyLower === 'oopqwe001@gmail.com' || merchantsDb[userKeyLower]?.isAdmin === true;

    if (isCurrentUserAdmin && merchantsDb.system_config) {
      const lastSys = lastFetchedDataRef.current?.merchantsDb?.system_config;
      if (!lastSys || JSON.stringify(merchantsDb.system_config) !== JSON.stringify(lastSys)) {
        // Sanitize product image overrides to keep system_data lightweight (use placeholder version stamp to stay under 1MB limits)
        const lightImages: Record<string, number | boolean> = {};
        const currentImages = merchantsDb.system_config.customProductImages || {};
        Object.keys(currentImages).forEach(pId => {
          if (currentImages[pId]) {
            lightImages[pId] = typeof currentImages[pId] === 'number' ? currentImages[pId] : (customProductImageVersions[pId] || Date.now());
          }
        });

        updateArgs.push(new FieldPath('merchantsDb', 'system_config'), {
          ...merchantsDb.system_config,
          customProductImages: lightImages
        });
      }
    }

    // If updateArgs is empty, skip calling Firestore altogether (efficient!)
    if (updateArgs.length === 0) {
      return;
    }

    // Debounce the Firestore write operation by 1200ms to group rapid clicks / mutations (like "One-click to store") safely
    // and respect Firestore's 1-write-per-second single document update rate limit!
    let activeTimer = true;
    const timerId = setTimeout(() => {
      if (!activeTimer) return;

      // Extract sanitized merchantsDb for both local setDoc fallback and Express backend POST payload
      const sanitizedMerchantsDb = { ...merchantsDb };
      sanitizedMerchantsDb.updatedAt = nowTime;
      if (!isCurrentUserAdmin && lastFetchedDataRef.current?.merchantsDb?.system_config) {
        sanitizedMerchantsDb.system_config = lastFetchedDataRef.current.merchantsDb.system_config;
      } else if (sanitizedMerchantsDb.system_config) {
        const lightImages: Record<string, number | boolean> = {};
        const currentImages = sanitizedMerchantsDb.system_config.customProductImages || {};
        Object.keys(currentImages).forEach(pId => {
          if (currentImages[pId]) {
            lightImages[pId] = typeof currentImages[pId] === 'number' ? currentImages[pId] : (customProductImageVersions[pId] || Date.now());
          }
        });
        sanitizedMerchantsDb.system_config = {
          ...sanitizedMerchantsDb.system_config,
          customProductImages: lightImages
        };
      }

      // 1. Parallel save to safe Express proxy endpoint (extremely reliable in sandboxed iframe previews)
      fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registeredUsers, merchantsDb: sanitizedMerchantsDb })
      })
        .then(res => res.json())
        .then(() => console.log("State synchronized securely via Express backend proxy."))
        .catch(err => console.error("Express proxy save fallback failed:", err));

      // 2. Direct Firestore update write (zero-latency socket notification)
      const [firstField, firstVal, ...restArgs] = updateArgs;
      updateDoc(docRef, firstField, firstVal, ...restArgs)
        .then(() => {
          if (!activeTimer) return;
          console.log("Successfully synchronized target database updates atomically in Firestore using FieldPath.");
          // Keep our lastFetchedDataRef updated with our own mutated state to prevent redundant loops
          lastFetchedDataRef.current = {
            registeredUsers: JSON.parse(JSON.stringify(registeredUsers)),
            merchantsDb: JSON.parse(JSON.stringify(merchantsDb))
          };
        })
        .catch(err => {
          if (!activeTimer) return;
          console.warn('Direct updateDoc did not complete (running full setDoc fallback):', err);
          
          setDoc(docRef, { registeredUsers, merchantsDb: sanitizedMerchantsDb })
            .then(() => {
              if (!activeTimer) return;
              lastFetchedDataRef.current = {
                registeredUsers: JSON.parse(JSON.stringify(registeredUsers)),
                merchantsDb: JSON.parse(JSON.stringify(merchantsDb))
              };
            })
            .catch(fallbackErr => {
              console.error('Full setDoc sync fallback failed:', fallbackErr);
            });
        });
    }, 1200);

    return () => {
      activeTimer = false;
      clearTimeout(timerId);
    };
  }, [registeredUsers, merchantsDb]);

  // Passwords Support State
  const [userPassword, setUserPassword] = useState<string>(() => {
    const key = userAccountName.toLowerCase();
    const data = merchantsDb[key];
    if (data && data.password !== undefined) {
      return data.password;
    }
    return '123456';
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_user_password', userPassword);
  }, [userPassword]);

  // Real account balance in actual currency (真钱余额, JPY ¥)
  const [userBalance, setUserBalance] = useState<number>(() => {
    const key = userAccountName.toLowerCase();
    const data = merchantsDb[key];
    if (data) {
      return data.balance !== undefined ? data.balance : 0;
    }
    return key === 'admin' ? 4800000 : 0;
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_user_balance', String(userBalance));
  }, [userBalance]);

  // Financial Ledger Ledger
  const [financialLogs, setFinancialLogs] = useState<FinancialTransaction[]>(() => {
    const key = userAccountName.toLowerCase();
    const data = merchantsDb[key];
    if (data && data.financialLogs) {
      return data.financialLogs;
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_financial_logs', JSON.stringify(financialLogs));
  }, [financialLogs]);

  // Load shop from active merchant record or defaults
  const [shop, setShop] = useState<Shop>(() => {
    const key = userAccountName.toLowerCase();
    const data = merchantsDb[key];
    if (data && data.shop) {
      return data.shop;
    }
    return { 
      ...DEFAULT_SHOP, 
      id: 'shop-temp',
      addedProductIds: key === 'admin' ? DEFAULT_SHOP.addedProductIds : []
    };
  });

  // Load orders from active merchant record or defaults
  const [orders, setOrders] = useState<Order[]>(() => {
    const key = userAccountName.toLowerCase();
    const data = merchantsDb[key];
    if (data && data.orders) {
      return data.orders;
    }
    return key === 'admin' ? DEFAULT_ORDERS : [];
  });

  // Active user's withdrawal history prop-level synchronization
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>(() => {
    const key = userAccountName.toLowerCase();
    const data = merchantsDb[key];
    if (data && data.withdrawHistory) {
      return data.withdrawHistory;
    }
    return [];
  });

  const isCurrentUserSalesman = useMemo(() => {
    if (!userAccountName) return false;
    const key = userAccountName.toLowerCase();
    const match = registeredUsers.find(u => u.name.toLowerCase() === key);
    const mDb = merchantsDb[key];
    return (match as any)?.isSalesman || mDb?.isSalesman || false;
  }, [registeredUsers, userAccountName, merchantsDb]);

  // Admin control panel toggle
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [showBalanceToast, setShowBalanceToast] = useState(false);

  // Synchronically apply custom product images loaded/updated from Firebase to prevent flicker
  useEffect(() => {
    if (customProductImages) {
      setProductImageOverrides(customProductImages);
      ALL_PRODUCTS.forEach(p => {
        p.image = customProductImages[p.id] || ORIGINAL_PRODUCT_IMAGES[p.id] || p.image;
      });
    }
  }, [customProductImages]);

  // Referral code for invited merchant registrations
  const [referralCode, setReferralCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem('aliexpress_referral_code');
    } catch {
      return null;
    }
  });

  // Hoisted database syncing effects moved below shop & orders declarations

  const handleUpdatePassword = (newPass: string) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setUserPassword(newPass);
    setRegisteredUsers(prev => prev.map(u => u.name.toLowerCase() === userAccountName.toLowerCase() ? { ...u, password: newPass } : u));
    setMerchantsDb(prev => {
      const key = userAccountName.toLowerCase();
      if (prev[key]) {
        return {
          ...prev,
          [key]: { ...prev[key], password: newPass }
        };
      }
      return prev;
    });
  };

  // Translation getter helper
  const t = (key: string) => {
    return TRANSLATIONS[appLanguage]?.[key] || TRANSLATIONS['zh'][key] || key;
  };

  // Login input helpers
  const [loginAccountInput, setLoginAccountInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register input helpers
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [registerAccountInput, setRegisterAccountInput] = useState('');
  const [registerPasswordInput, setRegisterPasswordInput] = useState('');
  const [registerPasswordConfirmInput, setRegisterPasswordConfirmInput] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleLoginSubmit = () => {
    const trimmedInput = loginAccountInput.trim();
    if (!trimmedInput) {
      setLoginError(t('errAccountEmpty'));
      return;
    }
    
    const matchedUser = registeredUsers.find(u => u.name.toLowerCase() === trimmedInput.toLowerCase());
    if (!matchedUser) {
      setLoginError(t('errAccountInvalid'));
      return;
    }

    if (loginPasswordInput === matchedUser.password) {
      setIsLoggedIn(true);
      setUserAccountName(matchedUser.name);
      setUserPassword(matchedUser.password || '');
      setLoginPasswordInput('');
      setLoginAccountInput('');
      setLoginError('');
    } else {
      setLoginError(t('errPasswordIncorrect'));
    }
  };

  const handleRegisterSubmit = () => {
    const trimmedReg = registerAccountInput.trim();
    if (!trimmedReg) {
      setRegisterError(t('errRegAccountEmpty'));
      return;
    }
    const englishRegex = /^[a-zA-Z0-9@._-]+$/;
    if (!englishRegex.test(trimmedReg)) {
      setRegisterError(t('errRegAccountEnglishOnly'));
      return;
    }
    if (trimmedReg.length < 3) {
      setRegisterError(t('errRegAccountLen'));
      return;
    }
    if (!registerPasswordInput) {
      setRegisterError(t('errRegPasswordEmpty'));
      return;
    }
    if (registerPasswordInput.length < 6) {
      setRegisterError(t('errRegPasswordLen'));
      return;
    }
    if (registerPasswordInput !== registerPasswordConfirmInput) {
      setRegisterError(t('errRegPasswordDiff'));
      return;
    }

    // Check if user already exists
    const exists = registeredUsers.some(u => u.name.toLowerCase() === trimmedReg.toLowerCase());
    if (exists) {
      setRegisterError(t('errRegAccountExists'));
      return;
    }

    // Generate unique 5-digit ID
    let newId = '';
    while (true) {
      newId = String(Math.floor(10000 + Math.random() * 90000));
      if (!registeredUsers.some(u => u.id === newId)) {
        break;
      }
    }

    const newUser = {
      name: trimmedReg,
      password: registerPasswordInput,
      id: newId,
      promotedBy: referralCode || null,
      isSalesman: false,
      isAdmin: false
    };

    setRegisteredUsers(prev => [...prev, newUser]);

    // Pre-populate merchantsDb entry synchronously here to avoid stale state in lazy loaders
    const key = trimmedReg.toLowerCase();
    const newProfile = {
      name: trimmedReg,
      password: registerPasswordInput,
      id: newId,
      promotedBy: referralCode || null,
      isSalesman: false,
      isAdmin: false,
      balance: 0,
      shop: { 
         ...DEFAULT_SHOP, 
        id: newId, 
        name: trimmedReg,
        addedProductIds: [...DEFAULT_SHOP.addedProductIds]
      },
      orders: [],
      financialLogs: [],
      withdrawHistory: []
    };
    setMerchantsDb(prev => ({
      ...prev,
      [key]: newProfile
    }));

    setUserAccountName(trimmedReg);
    setUserPassword(registerPasswordInput);
    
    // Clear inputs and display success feedback
    setRegisterSuccess(t('regSuccess'));
    setRegisterError('');
    setLoginAccountInput(trimmedReg); // Pre-fill login tab input
    
    // Switch to login tab and auto login after brief delay for optimal delightful user feedback
    setTimeout(() => {
      setIsLoggedIn(true);
      setAuthTab('login');
      setRegisterSuccess('');
      setRegisterAccountInput('');
      setRegisterPasswordInput('');
      setRegisterPasswordConfirmInput('');
    }, 1500);
  };

  const addFinancialLog = (
    type: 'recharge' | 'withdraw' | 'promotion' | 'settlement',
    typeLabel: string,
    amount: number, // positive for addition, negative for subtraction
    status: '成功' | '已到账' | '已扣除' | '已提交' | '已拒绝',
    description: string
  ) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    // 1. Update the balance (recharge with status '已提交' is pending and won't add to balance yet)
    if (!(type === 'recharge' && status === '已提交')) {
      setUserBalance(prev => {
        const nextBalance = prev + amount;
        return Math.max(0, nextBalance);
      });
    }

    // 2. Add log
    const pad = (num: number) => String(num).padStart(2, '0');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const rand = Math.floor(Math.random() * 9000) + 1000;
    const txId = `TX-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${rand}`;

    const newTx: FinancialTransaction = {
      id: txId,
      type,
      typeLabel,
      amount,
      status,
      description,
      createdAt: `${dateStr} ${timeStr}`
    };

    setFinancialLogs(prev => [newTx, ...prev]);
  };

  const handleClaimCoins = (amount: number) => {
    setUserCoins(prev => prev + amount);
  };

  // Shop Promotion Modal Toggle
  const [showMyShopModal, setShowMyShopModal] = useState(false);

  // Parse URL queries on load (supports live testing via iframe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    const hasShopId = params.get('shopId');
    const ref = params.get('ref');

    if (ref) {
      localStorage.setItem('aliexpress_referral_code', ref);
      setReferralCode(ref);
    }

    if (isAdmin) {
      setViewRole('merchant');
    } else if (hasShopId) {
      setViewRole('customer');
      setActiveTab('pick'); // Navigate straight to product center for shopping sequence
      
      try {
        const storedDb = localStorage.getItem('aliexpress_merchants_database_v2');
        const db = storedDb ? JSON.parse(storedDb) : merchantsDb;
        const allKeys = Object.keys(db).filter(k => k !== 'system_config');
        const matchedKey = allKeys.find(k => 
          String(db[k]?.shop?.id) === String(hasShopId) || 
          String(db[k]?.id) === String(hasShopId)
        );
        if (matchedKey) {
          setUserAccountName(db[matchedKey].name);
        }
      } catch (e) {
        console.error('Error auto-resolving shared shopInfo', e);
      }
    } else {
      // Default viewpoint
      setViewRole('merchant');
    }
  }, []);

  // Load state from active merchant slot whenever user changes or database loads
  useEffect(() => {
    if (!userAccountName) return;
    const key = userAccountName.toLowerCase();
    let data = merchantsDb[key];
    const isSeed = key === 'admin' || key === 'oopqwe001@gmail.com' || key === 'oopqwe521@gmail.com';
    const fallbackBal = isSeed ? 4800000 : 0;

    // Clean up historic database leftovers or legacy preset balances/orders for non-admin profiles
    if (data && !isSeed) {
      let changed = false;
      let cleanBalance = data.balance;
      let cleanShop = { ...data.shop };
      let cleanOrders = [...(data.orders || [])];

      if (cleanBalance === 4800000) {
        cleanBalance = 0;
        changed = true;
      }
      const isExactDefaultPreset = 
        cleanShop.addedProductIds && 
        cleanShop.addedProductIds.length === 9 && 
        JSON.stringify([...cleanShop.addedProductIds].sort()) === JSON.stringify(['LP-0001', 'LP-0002', 'LP-0003', 'LP-0004', 'LP-0005', 'LP-0006', 'LP-0007', 'LP-0009', 'LP-0010'].sort());
      if (isExactDefaultPreset) {
        cleanShop.addedProductIds = [];
        changed = true;
      }
      if (!cleanShop.avatar || cleanShop.avatar.includes('photo-1628157582853-a796fa650a6a') || cleanShop.avatar.includes('unsplash.com') || cleanShop.avatar.includes('assets/images/')) {
        cleanShop.avatar = DEFAULT_SHOP.avatar;
        changed = true;
      }
      if (!cleanShop.name || cleanShop.name === '雅颂高奢美学馆' || cleanShop.name === '我的速卖通店铺' || cleanShop.name === '总控旗舰奢优店' || cleanShop.name.endsWith('的美学商店') || cleanShop.name === `${userAccountName}的美学商店`) {
        cleanShop.name = userAccountName;
        changed = true;
      }
      if (cleanOrders.some(o => o.id === 'ORD-20260530-991')) {
        cleanOrders = cleanOrders.filter(o => o.id !== 'ORD-20260530-991');
        changed = true;
      }

      if (changed) {
        data = {
          ...data,
          balance: cleanBalance,
          shop: cleanShop,
          orders: cleanOrders
        };
        setMerchantsDb(prev => ({ ...prev, [key]: data }));
      }
    }

    if (data) {
      setUserBalance(data.balance !== undefined ? data.balance : fallbackBal);
      setShop(data.shop ?? { ...DEFAULT_SHOP, name: userAccountName, addedProductIds: isSeed ? DEFAULT_SHOP.addedProductIds : [] });
      setOrders(data.orders ?? []);
      setFinancialLogs(data.financialLogs ?? []);
      setWithdrawHistory(data.withdrawHistory ?? []);
      setUserPassword(data.password ?? '123456');
      setLoadedUserAccount(userAccountName);
    } else {
      // Lazy-populate profile slot for brand-new registered users
      const matchInReg = registeredUsers.find(u => u.name.toLowerCase() === key);
      const fallbackId = matchInReg?.id || '53' + Math.floor(100 + Math.random() * 900);
      const newProfile = {
        name: userAccountName,
        password: matchInReg?.password || userPassword || '123456',
        id: fallbackId,
        promotedBy: matchInReg?.promotedBy || null,
        isSalesman: matchInReg?.isSalesman || false,
        isAdmin: matchInReg?.isAdmin || false,
        balance: fallbackBal,
        shop: { 
          ...DEFAULT_SHOP, 
          id: fallbackId, 
          name: userAccountName,
          addedProductIds: isSeed ? DEFAULT_SHOP.addedProductIds : []
        },
        orders: isSeed ? [
          {
            id: 'ORD-20260530-991',
            shopId: fallbackId,
            customerName: '佐藤 健太',
            customerPhone: '090-8891-2451',
            shippingAddress: '東京都新宿区西新宿2丁目8-1',
            orderDate: '2026-05-30',
            items: [
              {
                productId: 'LP-0001',
                productName: '卡地亚经典勃烟地红机械表',
                quantity: 1,
                retailPrice: 420000,
                costPrice: 380000,
                image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80'
              }
            ],
            totalPrice: 420000,
            totalProfit: 40000,
            status: 'pending' as const
          }
        ] : [],
        financialLogs: [],
        withdrawHistory: []
      };
      setMerchantsDb(prev => ({ ...prev, [key]: newProfile }));
      
      // Update local react state hooks immediately so they are NOT contaminated with stale values
      setUserBalance(fallbackBal);
      setShop(newProfile.shop);
      setOrders(newProfile.orders);
      setFinancialLogs([]);
      setWithdrawHistory([]);
      setUserPassword(newProfile.password);
      setLoadedUserAccount(userAccountName);
    }
  }, [userAccountName, merchantsDb]);

  // Synchronize active states back into the central database slot reactively
  useEffect(() => {
    if (!userAccountName || !loadedUserAccount) return;
    if (userAccountName.toLowerCase() !== loadedUserAccount.toLowerCase()) {
      // Stale state: user switches or registers but local states (userBalance, shop, etc) have not updated in React yet. Block writing!
      return;
    }
    const key = userAccountName.toLowerCase();
    if (!merchantsDb[key]) return;

    const slot = merchantsDb[key];
    if (
      slot.balance !== userBalance ||
      JSON.stringify(slot.shop) !== JSON.stringify(shop) ||
      JSON.stringify(slot.orders) !== JSON.stringify(orders) ||
      JSON.stringify(slot.financialLogs) !== JSON.stringify(financialLogs) ||
      JSON.stringify(slot.withdrawHistory) !== JSON.stringify(withdrawHistory) ||
      slot.password !== userPassword
    ) {
      setMerchantsDb(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          balance: userBalance,
          shop: shop,
          orders: orders,
          financialLogs: financialLogs,
          withdrawHistory: withdrawHistory,
          password: userPassword
        }
      }));
    }
  }, [userBalance, shop, orders, financialLogs, withdrawHistory, userPassword, userAccountName, loadedUserAccount]);

  // Master update action used by Admin console to override any account
  const updateMerchantDataInDb = (targetAccount: string, updatedFields: Partial<any>) => {
    const key = targetAccount.toLowerCase();
    
    // Set mutation lock immediately to prevent race conditions during propagation
    lastMutationTimeRef.current = Date.now();

    if (key === 'system_config') {
      setMerchantsDb(prev => {
        const nextConfig = {
          ...(prev.system_config || {}),
          ...updatedFields
        };

        // Real-time custom product image synchronization to dedicated Firestore documents inside the 'system_data' collection
        if (updatedFields.customProductImages) {
          const imagesObj = updatedFields.customProductImages;
          const previousImages = customProductImages || {};
          const nextVersions = { ...customProductImageVersions };

          // Sync new or updated base64 image strings to separate Firestore documents to bypass 1MB single-doc limit
          Object.keys(imagesObj).forEach(productId => {
            const imgBase64 = imagesObj[productId];
            if (imgBase64 && previousImages[productId] !== imgBase64) {
              const imgDocRef = doc(db, 'system_data', `custom_image_${productId}`);
              const nowTs = Date.now();
              nextVersions[productId] = nowTs;

              setDoc(imgDocRef, { image: imgBase64, timestamp: nowTs })
                .then(() => console.log(`Custom product image synced cleanly: system_data/custom_image_${productId}`))
                .catch(e => console.error(`Error saving custom image document for product ${productId}:`, e));
            }
          });

          // Delete any images that were removed in the updated state dictionary
          Object.keys(previousImages).forEach(productId => {
            if (!imagesObj[productId]) {
              delete nextVersions[productId];
              const imgDocRef = doc(db, 'system_data', `custom_image_${productId}`);
              deleteDoc(imgDocRef)
                .then(() => console.log(`Deleted custom product image document: system_data/custom_image_${productId}`))
                .catch(e => console.error(`Error deleting custom image document for product ${productId}:`, e));
            }
          });

          // Core modification: Update dedicated state with raw Base64, and strip them from merchantsDb
          setCustomProductImages(imagesObj);
          setCustomProductImageVersions(nextVersions);
          
          const lightImages: Record<string, number | boolean> = {};
          Object.keys(imagesObj).forEach(pId => {
            if (imagesObj[pId]) {
              lightImages[pId] = nextVersions[pId] || Date.now();
            }
          });
          nextConfig.customProductImages = lightImages;
        }

        return {
          ...prev,
          system_config: nextConfig
        };
      });
      return;
    }
    
    // Sync to registeredUsers too if password or isSalesman or isAdmin changed or promotedBy changed
    if (updatedFields.password !== undefined || updatedFields.isSalesman !== undefined || updatedFields.isAdmin !== undefined || updatedFields.promotedBy !== undefined) {
      setRegisteredUsers(prev => prev.map(u => {
        if (u.name.toLowerCase() === key) {
          const updatedUser = { ...u };
          if (updatedFields.password !== undefined) updatedUser.password = updatedFields.password;
          if (updatedFields.isSalesman !== undefined) updatedUser.isSalesman = updatedFields.isSalesman;
          if (updatedFields.isAdmin !== undefined) updatedUser.isAdmin = updatedFields.isAdmin;
          if (updatedFields.promotedBy !== undefined) updatedUser.promotedBy = updatedFields.promotedBy;
          return updatedUser;
        }
        return u;
      }));
    }

    setMerchantsDb(prev => {
      const existing = prev[key];
      let baseProfile = existing;
      if (!baseProfile) {
        // Repair/initialize from registeredUsers or fallback
        const matchUser = registeredUsers.find(u => u.name.toLowerCase() === key);
        const fallbackId = matchUser?.id || '53' + Math.floor(100 + Math.random() * 900);
        baseProfile = {
          name: targetAccount,
          password: matchUser?.password || '123456',
          id: fallbackId,
          promotedBy: matchUser?.promotedBy || null,
          isSalesman: matchUser?.isSalesman || false,
          isAdmin: matchUser?.isAdmin || false,
          balance: 0,
          shop: { 
            ...DEFAULT_SHOP, 
            id: fallbackId, 
            name: targetAccount,
            addedProductIds: []
          },
          orders: [],
          financialLogs: [],
          withdrawHistory: []
        };
      }
      
      const nextProfile = {
        ...baseProfile,
        ...updatedFields
      };

      // If active user is the target, write into current react state hooks too so it updates instantly
      if (key === userAccountName.toLowerCase()) {
        if (updatedFields.balance !== undefined) setUserBalance(updatedFields.balance);
        if (updatedFields.shop !== undefined) setShop(updatedFields.shop);
        if (updatedFields.orders !== undefined) setOrders(updatedFields.orders);
        if (updatedFields.financialLogs !== undefined) setFinancialLogs(updatedFields.financialLogs);
        if (updatedFields.withdrawHistory !== undefined) setWithdrawHistory(updatedFields.withdrawHistory);
        if (updatedFields.password !== undefined) setUserPassword(updatedFields.password);
      }

      return {
        ...prev,
        [key]: nextProfile
      };
    });
  };

  // Master delete action to remove a merchant/shop entirely
  const deleteMerchantFromDb = (targetAccount: string) => {
    const key = targetAccount.toLowerCase();
    
    // Prevent deleting core administrator accounts
    if (key === 'oopqwe001@gmail.com' || key === 'oopqwe521@gmail.com' || key === 'admin') {
      return;
    }

    // Set mutation lock to prevent intermediate racing or polling overwrites
    lastMutationTimeRef.current = Date.now();
    
    // 1. Remove from registeredUsers
    setRegisteredUsers(prev => prev.filter(u => u.name.toLowerCase() !== key));
    
    // 2. Remove from merchantsDb
    setMerchantsDb(prev => {
      const nextDb = { ...prev };
      delete nextDb[key];
      return nextDb;
    });

    if (key === userAccountName.toLowerCase()) {
      setIsLoggedIn(false);
    }
  };

  // Load standard cart items from storage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_shop_cart_items');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing stored cart items', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('aliexpress_shop_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    alert(t('addToCartSuccess').replace('{name}', product.name));
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Shared search state across Home & Product Catalog views
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const handleHomeSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setActiveTab('pick');
  };

  // Handle addition or deletion of products on user selections
  const handleToggleProductInStore = (productId: string) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setShop(prev => {
      const isAdded = prev.addedProductIds.includes(productId);
      const nextAddedIds = isAdded
        ? prev.addedProductIds.filter(id => id !== productId)
        : [...prev.addedProductIds, productId];
      return {
        ...prev,
        addedProductIds: nextAddedIds
      };
    });
  };

  const handleUpdateShop = (updatedFields: Partial<Shop>) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setShop(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const handleAddOrder = (newOrder: Order) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setOrders(prev => [newOrder, ...prev]);
    if (newOrder.isSelfOrder) {
      const itemsListStr = newOrder.items.map(it => `${it.productName} * ${it.quantity}`).join(', ');
      addFinancialLog(
        'withdraw',
        '自购商品扣款',
        -newOrder.totalPrice,
        '已扣除',
        `商铺账户自购精品，清单: ${itemsListStr}，系统已提报海外代发仓提现结算 [订单号: ${newOrder.id}]`
      );
    }
  };

  const handleShipOrder = (orderId: string) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    const pad = (num: number) => String(num).padStart(2, '0');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Find the order being shipped
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status !== 'pending') return;

    if (!order.isSelfOrder) {
      const costPriceSum = order.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      
      // Check if user has enough balance (blocking shipment, but show a central toast)
      if (userBalance < costPriceSum) {
        setShowBalanceToast(true);
        setTimeout(() => {
          setShowBalanceToast(false);
        }, 3000);
        return;
      }

      // Deduct the cost
      addFinancialLog(
        'withdraw',
        '代发成本扣除',
        -costPriceSum,
        '已扣除',
        `店家发货垫付境外高奢一件代发货源采购成本，包囊运单 [订单号: ${order.id}]`
      );
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'shipped' as const, shippedAt: `${dateStr} ${timeStr}` };
      }
      return o;
    }));
  };

  const handleConfirmReceiveOrder = (orderId: string) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status !== 'shipped') return;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'completed' as const };
      }
      return o;
    }));

    if (order.isSelfOrder) {
      addFinancialLog(
        'settlement',
        '自购确认收货',
        0,
        '已到账',
        `自购精品宝贝已成功到货签收！订单号: ${order.id}。名贵奢件已交付验收入库，完满结单。`
      );
    } else {
      // Add full retail price back to user's real balance (since we already deducted costPrice upfront upon shipping)
      addFinancialLog(
        'settlement',
        '订单分帐到账',
        order.totalPrice,
        '已到账',
        `奢选商铺完成交割，订单序列号: ${order.id}，含回笼采购采购垫付本金 ($${(order.totalPrice - order.totalProfit).toLocaleString()}) 与出货利润 ($${order.totalProfit.toLocaleString()}) 全额到账`
      );
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleUpdateBalance = (newBalance: number | ((prev: number) => number)) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setUserBalance(newBalance);
  };

  const handleUpdateWithdrawHistory = (newHistory: any[] | ((prev: any[]) => any[])) => {
    lastMutationTimeRef.current = Date.now(); // LOCK POLLING!
    setWithdrawHistory(newHistory);
  };

  // Real-time Clock Simulator for the Mobile notch status bar
  const [currentTime, setCurrentTime] = useState('08:56');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Quick link copy helper for client testing
  const handleCopyLink = (roleType: 'merchant' | 'customer') => {
    const base = window.location.origin + window.location.pathname;
    const link = roleType === 'merchant' 
      ? `${base}?admin=true`
      : `${base}?shopId=${shop.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        if (appLanguage === 'zh') {
          alert(`📋 链接已复制到剪切板，可发给其他好友：\n${link}`);
        } else {
          alert(`📋 Link successfully copied to clipboard! Share with others:\n${link}`);
        }
        setShowMyShopModal(false);
      });
    } else {
      if (appLanguage === 'zh') {
        alert(`测试地址：\n${link}`);
      } else {
        alert(`Test link:\n${link}`);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] text-zinc-800 font-sans antialiased flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#f0f2f5] to-zinc-300 sm:p-4">
        {/* elegant container for login panel: full screen on mobile, styled phone card container on desktop/tablet */}
        <div className="w-full h-screen sm:h-[790px] max-w-full sm:max-w-[430px] bg-white sm:border sm:border-zinc-200 sm:shadow-2xl sm:rounded-3xl flex flex-col overflow-hidden relative">
          
          {/* Top logo header */}
          <div className="bg-[#e51923] h-12 border-b border-[#c4151e] flex items-center justify-center z-40 select-none px-6 shrink-0">
            <div className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a5 5 0 0 0-5 5v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v1H9V7zm8 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-10 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              <span className="font-sans text-sm font-black tracking-tight text-white uppercase italic">
                Ali<span className="text-[#fff000]">Express</span>
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between p-6 text-zinc-800 relative select-none">
            {/* Selection tab bar */}
            <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setLoginError('');
                  setRegisterError('');
                  setRegisterSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-white text-[#e51923] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {t('loginTab')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setLoginError('');
                  setRegisterError('');
                  setRegisterSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-white text-[#e51923] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {t('registerTab')}
              </button>
            </div>

            {/* Input field details based on the selected tab */}
            <div className="flex flex-col gap-3.5 my-auto py-4">
              {authTab === 'login' ? (
                <>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">{t('loginAccountLabel')}</label>
                    <input
                      type="text"
                      value={loginAccountInput}
                      onChange={(e) => {
                        setLoginAccountInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={t('userNamePlaceholder')}
                      className="w-full text-[16px] sm:text-xs bg-zinc-55 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">{t('loginPasswordLabel')}</label>
                    <div className="relative">
                      <input
                        type={showLoginPass ? "text" : "password"}
                        value={loginPasswordInput}
                        onChange={(e) => {
                          setLoginPasswordInput(e.target.value);
                          setLoginError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLoginSubmit();
                          }
                        }}
                        placeholder={t('passwordPlaceholder')}
                        className="w-full text-[16px] sm:text-xs bg-zinc-55 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 pr-10 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-850 transition-colors text-xs shadow-xs cursor-pointer select-none"
                      >
                        {showLoginPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10.5px] font-semibold text-left flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#e51923] mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLoginSubmit}
                    className="w-full py-3.5 bg-[#e51923] hover:bg-red-700 text-white font-black rounded-xl text-xs tracking-wider uppercase shadow-md transition-all active:scale-[0.98] select-none cursor-pointer mt-1"
                  >
                    {t('loginButton')}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-550 font-bold tracking-wider">{t('registerAccountLabel')}</label>
                    <input
                      type="text"
                      value={registerAccountInput}
                      onChange={(e) => {
                        setRegisterAccountInput(e.target.value);
                        setRegisterError('');
                      }}
                      placeholder={t('registerAccountPlaceholder')}
                      className="w-full text-[16px] sm:text-xs bg-zinc-55 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-550 font-bold tracking-wider">{t('registerPasswordLabel')}</label>
                    <input
                      type="password"
                      value={registerPasswordInput}
                      onChange={(e) => {
                        setRegisterPasswordInput(e.target.value);
                        setRegisterError('');
                      }}
                      placeholder={t('registerPasswordPlaceholder')}
                      className="w-full text-[16px] sm:text-xs bg-zinc-55 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-555 font-bold tracking-wider">{t('registerConfirmPassLabel')}</label>
                    <input
                      type="password"
                      value={registerPasswordConfirmInput}
                      onChange={(e) => {
                        setRegisterPasswordConfirmInput(e.target.value);
                        setRegisterError('');
                      }}
                      placeholder={t('registerConfirmPlaceholder')}
                      className="w-full text-[16px] sm:text-xs bg-zinc-55 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  {registerError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10.5px] font-semibold text-left flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#e51923] mt-0.5" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  {registerSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-semibold text-left flex items-center gap-1.5">
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white font-black rounded-xl text-xs tracking-wider uppercase shadow-md transition-all active:scale-[0.98] select-none cursor-pointer mt-1"
                  >
                    {t('registerButton')}
                  </button>
                </>
              )}
            </div>

            {/* Footer tips */}
            <div className="text-center text-[10px] text-zinc-400 flex flex-col gap-1 mt-auto pb-4">
              <p>{t('securityTip')}</p>
              <p className="font-mono text-zinc-350">{t('securityProtocol')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f4f6] text-zinc-800 font-sans antialiased flex flex-col relative pb-28">
      
      {/* Top red header brand bar */}
      <div className="bg-[#e51923] h-12 border-b border-[#c4151e] flex items-center justify-center z-40 select-none shadow-sm shrink-0">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a5 5 0 0 0-5 5v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v1H9V7zm8 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-10 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <span className="font-sans text-sm font-black tracking-tight text-white uppercase italic">
              Ali<span className="text-[#fff000]">Express</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div className="w-full flex-grow flex flex-col relative bg-[#f4f4f6]">
        
        {/* Dynamic Context Header (Active Shop & Share trigger) */}
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col bg-white justify-between p-[24px] text-zinc-800 relative select-none">
            {/* Top design logo */}
            <div className="flex flex-col items-center mt-6 gap-3 text-center">
              <div className="w-14 h-14 bg-[#e51923] rounded-2xl flex items-center justify-center shadow-md animate-pulse mt-2">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a5 5 0 0 0-5 5v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v1H9V7zm8 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-10 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-black mt-1 tracking-wide font-sans text-zinc-900">
                Ali<span className="text-[#e51923]">Express</span>
              </h2>
            </div>

            {/* Selection tab bar */}
            <div className="flex bg-zinc-100 p-1 rounded-xl gap-1 mt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setLoginError('');
                  setRegisterError('');
                  setRegisterSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-white text-[#e51923] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                登录账户 Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setLoginError('');
                  setRegisterError('');
                  setRegisterSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-white text-[#e51923] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                免费注册 Register
              </button>
            </div>

            {/* Input field details based on the selected tab */}
            <div className="flex flex-col gap-3.5 my-auto">
              {authTab === 'login' ? (
                <>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">邮箱或者用户名 EMAIL / USERNAME</label>
                    <input
                      type="text"
                      value={loginAccountInput}
                      onChange={(e) => {
                        setLoginAccountInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder=""
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">安全存储密钥密码 PASSWORD</label>
                    <div className="relative">
                      <input
                        type={showLoginPass ? "text" : "password"}
                        value={loginPasswordInput}
                        onChange={(e) => {
                          setLoginPasswordInput(e.target.value);
                          setLoginError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLoginSubmit();
                          }
                        }}
                        placeholder=""
                        className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 pr-10 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 transition-colors text-xs shadow-xs cursor-pointer select-none"
                      >
                        {showLoginPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10.5px] font-semibold text-left flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#e51923] mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLoginSubmit}
                    className="w-full py-3.5 bg-[#e51923] hover:bg-red-700 text-white font-black rounded-xl text-xs tracking-wider uppercase shadow-md transition-all active:scale-[0.98] select-none cursor-pointer mt-1"
                  >
                    验证凭证安全登录 SIGN IN
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">邮箱或者用户名 EMAIL / USERNAME</label>
                    <input
                      type="text"
                      value={registerAccountInput}
                      onChange={(e) => {
                        setRegisterAccountInput(e.target.value);
                        setRegisterError('');
                      }}
                      placeholder="设置您的邮箱地址或个性化账户名称"
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">密码设置 SET PASSWORD (不少于6位)</label>
                    <input
                      type="password"
                      value={registerPasswordInput}
                      onChange={(e) => {
                        setRegisterPasswordInput(e.target.value);
                        setRegisterError('');
                      }}
                      placeholder="请设置您的安全登录密码"
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold tracking-wider">确认安全密码 CONFIRM PASSWORD</label>
                    <input
                      type="password"
                      value={registerPasswordConfirmInput}
                      onChange={(e) => {
                        setRegisterPasswordConfirmInput(e.target.value);
                        setRegisterError('');
                      }}
                      placeholder="请再次输入您的密码以做确认"
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl p-3.5 focus:outline-none focus:border-[#e51923] focus:ring-1 focus:ring-[#e51923] font-medium shadow-xs text-left"
                    />
                  </div>

                  {registerError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10.5px] font-semibold text-left flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#e51923] mt-0.5" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  {registerSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-semibold text-left flex items-center gap-1.5">
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white font-black rounded-xl text-xs tracking-wider uppercase shadow-md transition-all active:scale-[0.98] select-none cursor-pointer mt-1"
                  >
                    注册新账户 REGISTER NOW
                  </button>
                </>
              )}
            </div>

            {/* Footer tips */}
            <div className="text-center text-[10px] text-zinc-400 flex flex-col gap-1 mt-auto pb-4">
              <p>{t('securityTip')}</p>
              <p className="font-mono text-zinc-350">{t('securityProtocol')}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3 border-b border-zinc-200/80 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-red-500/20 bg-zinc-100">
              <img 
                src={resolveAvatar(shop.avatar)} 
                alt="" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23fff5f5"/><circle cx="50" cy="40" r="18" fill="%23e51923" fill-opacity="0.85"/><path d="M22 78C22 62.536 34.536 50 50 50C65.464 50 78 62.536 78 78" stroke="%23e51923" stroke-width="8" stroke-linecap="round"/></svg>`;
                }}
              />
            </div>
            <div className="flex flex-col">
              <h4 className="font-sans text-xs font-bold text-zinc-900 truncate max-w-[155px]">
                {shop.name}
              </h4>
              <span className="text-[10px] text-[#e51923] font-mono tracking-wider font-semibold">
                {viewRole === 'merchant' ? t('roleMerchant') : t('roleGeneral')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* My Shop promotion panel button */}
            <button 
              onClick={() => setShowMyShopModal(true)}
              className="p-1 px-2.5 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200/80 text-[11px] text-[#e51923] flex items-center gap-1 font-semibold tracking-wide transition-all scale-95 cursor-pointer shadow-sm animate-pulse-subtle"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#e51923]" />
              <span>{t('myProductsBtn')}</span>
            </button>
          </div>
        </div>

        {/* Main Scrolling Body viewport area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 scrollbar-none bg-transparent">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + '-' + viewRole}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeTab === 'home' && (
                <HomeView 
                  shopName={shop.name} 
                  onNavigate={(tab) => setActiveTab(tab)} 
                  onAddToCart={handleAddToCart}
                  onSearch={handleHomeSearch}
                  userCoins={userCoins}
                  onClaimCoins={handleClaimCoins}
                  language={appLanguage}
                />
              )}

              {activeTab === 'pick' && (
                <ProductSection 
                  shop={shop}
                  viewRole={viewRole}
                  onChangeViewRole={(role) => setViewRole(role)}
                  onToggleProductInStore={handleToggleProductInStore}
                  onAddOrder={handleAddOrder}
                  onAddToCart={handleAddToCart}
                  searchQuery={globalSearchQuery}
                  onSearchQueryChange={setGlobalSearchQuery}
                  language={appLanguage}
                  customProductImages={customProductImages}
                />
              )}

              {activeTab === 'cart' && (
                <CartView 
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateCartQty}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onAddOrder={handleAddOrder}
                  shop={shop}
                  viewRole={viewRole}
                  onChangeTab={(tab) => setActiveTab(tab)}
                  userCoins={userCoins}
                  onDeductCoins={(amount) => setUserCoins(prev => Math.max(0, prev - amount))}
                  language={appLanguage}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView 
                  shop={shop}
                  orders={orders}
                  onUpdateShop={handleUpdateShop}
                  onShipOrder={handleShipOrder}
                  onConfirmReceiveOrder={handleConfirmReceiveOrder}
                  onDeleteOrder={handleDeleteOrder}
                  userBalance={userBalance}
                  onUpdateBalance={handleUpdateBalance}
                  financialLogs={financialLogs}
                  onAddFinancialLog={addFinancialLog}
                  language={appLanguage}
                  onChangeLanguage={setAppLanguage}
                  userPassword={userPassword}
                  onChangePassword={handleUpdatePassword}
                  onLogout={() => setIsLoggedIn(false)}
                  userAccountName={userAccountName}
                  registeredUsers={registeredUsers}
                  isSalesman={isCurrentUserSalesman}
                  withdrawHistory={withdrawHistory}
                  onUpdateWithdrawHistory={handleUpdateWithdrawHistory}
                  onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Premium Floating Base Tabbar - Balanced 4-column responsive grid to absolutely prevent horizontal overflow on all mobile screens */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-zinc-200 z-40 backdrop-blur-xl select-none shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2.5 grid grid-cols-4 w-full">
          {/* Tab 1 */}
          <button 
            type="button"
            id="tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all w-full min-w-0 ${
              activeTab === 'home' 
                ? 'text-[#e51923] scale-105 font-bold' 
                : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <Home className="w-5 h-5 shrink-0 transition-transform" />
            <span className="text-[10px] tracking-wide font-sans font-medium truncate w-full text-center">{t('tabHome')}</span>
          </button>

          {/* Tab 2 */}
          <button 
            type="button"
            id="tab-pick"
            onClick={() => setActiveTab('pick')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all w-full min-w-0 ${
              activeTab === 'pick' 
                ? 'text-[#e51923] scale-105 font-bold' 
                : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <ShoppingBag className="w-5 h-5 shrink-0 transition-transform" />
            <span className="text-[10px] tracking-wide font-sans font-medium truncate w-full text-center">{t('tabPick')}</span>
          </button>

          {/* Tab 3: Cart */}
          <button 
            type="button"
            id="tab-cart"
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative w-full min-w-0 ${
              activeTab === 'cart' 
                ? 'text-[#e51923] scale-105 font-bold' 
                : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <div className="relative flex justify-center">
              <ShoppingCart className="w-5 h-5 shrink-0 transition-transform" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#e51923] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-wide font-sans font-medium truncate w-full text-center">{t('tabCart')}</span>
          </button>

          {/* Tab 4 */}
          <button 
            type="button"
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all w-full min-w-0 ${
              activeTab === 'profile' 
                ? 'text-[#e51923] scale-105 font-bold' 
                : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <User className="w-5 h-5 shrink-0 transition-transform" />
            <span className="text-[10px] tracking-wide font-sans font-medium truncate w-full text-center">{t('tabProfile')}</span>
          </button>
          </div>
        </div>
          </>
        )}

      </div>

      {/* My Shop / Promotion Modal */}
      <AnimatePresence>
        {showMyShopModal && (
          <MyShopModal
            isOpen={showMyShopModal}
            onClose={() => setShowMyShopModal(false)}
            shop={shop}
            onNavigate={(tab) => setActiveTab(tab)}
            userBalance={userBalance}
            onDeductBalance={(amount) => {
              addFinancialLog(
                'promotion',
                '推广追加投流',
                -amount,
                '已扣除',
                `对店铺商品橱窗追加推广宣发投流预算: $${amount.toLocaleString()}`
              );
            }}
            language={appLanguage}
          />
        )}
      </AnimatePresence>

      {/* Standalone System Super Admin Dashboard Portal Overlay */}
      <AnimatePresence>
        {isAdminConsoleOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 overflow-hidden bg-zinc-50"
          >
            <AdminDashboardView
              merchantsDb={merchantsDb}
              onUpdateMerchantData={updateMerchantDataInDb}
              onDeleteMerchant={deleteMerchantFromDb}
              onClose={() => setIsAdminConsoleOpen(false)}
              currentUser={userAccountName}
              registeredUsers={registeredUsers}
              customProductImages={customProductImages}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Insufficient Balance Toast with smooth animation */}
      <AnimatePresence>
        {showBalanceToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-zinc-900/95 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl border border-white/15 flex items-center gap-3 pointer-events-auto max-w-sm mx-4">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium tracking-wide leading-relaxed">
                {t('errInsufficientBalance')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Floating Customer Service Button (LINE-styled green circular badge) */}
      {!isAdminConsoleOpen && (() => {
        const sysConfig = merchantsDb && merchantsDb.system_config ? merchantsDb.system_config : {};
        const customerServiceLink = sysConfig.customerServiceLink || '';
        return (
          <div className={`fixed ${isLoggedIn ? 'bottom-[84px]' : 'bottom-[24.5px]'} right-4 z-40 animate-float pointer-events-auto`}>
            <a
              href={customerServiceLink || '#'}
              target={customerServiceLink ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!customerServiceLink) {
                  e.preventDefault();
                  alert(appLanguage === 'zh'
                    ? '在线客服通道维护中，请联系您的专属业务员或稍后再试。'
                    : 'Customer support channel is currently offline. Please try again later.'
                  );
                }
              }}
              className="relative flex items-center justify-center w-11.5 h-11.5 rounded-full bg-[#06C755] text-white shadow-[0_4px_14px_rgba(6,199,85,0.4)] hover:scale-110 active:scale-95 transition-all duration-250 border-2 border-white/95 cursor-pointer"
              title={t('customerSupport')}
            >
              {/* 1 Unread message badge */}
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 font-mono text-[7.5px] font-extrabold text-white border-2 border-white shadow-sm animate-pulse">
                1
              </span>
              
              {/* LINE Brand speech bubble style SVG */}
              <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 fill-current">
                <path d="M12 2C6.48 2 2 5.58 2 10c0 2.5 1.45 4.7 3.86 5.86l-.8 2.4c-.08.24.1.48.33.4l2.67-.88c1.23.41 2.56.62 3.94.62 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-1.5 12h-1c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v5.5h.5c.28 0 .5.22.5.5s-.22.5-.5.5zm2.5-.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-5c0-.28.22-.5.5-.5s.5.22.5.5v5zm4.5.5h-1.5l-1.5-2.25v1.75c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-5c0-.28.22-.5.5-.5s.5.22.5.5v1.75l1.5-1.75c.14-.14.33-.25.5-.25s.5.22.5.5v5z" />
              </svg>
            </a>
          </div>
        );
      })()}

    </div>
  );
}
