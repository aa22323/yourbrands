import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, Landmark, Users, ShoppingBag, Clipboard, 
  RotateCw, Plus, CheckCircle2, Edit2, Search, AlertCircle, 
  TrendingUp, DollarSign, Wallet, MapPin, Phone, User, Check, ArrowLeftRight, CheckCircle, HelpCircle, XCircle,
  Copy, UserPlus, Trash2, Truck
} from 'lucide-react';
import { Product, Order, Shop, FinancialTransaction } from '../types';
import { ALL_PRODUCTS, DEFAULT_SHOP, resolveAvatar } from '../data';
import { getProductImage } from '../utils/translations';

interface AdminDashboardViewProps {
  merchantsDb: Record<string, any>;
  onUpdateMerchantData: (targetAccount: string, updatedFields: Partial<any>) => void;
  onDeleteMerchant?: (targetAccount: string) => void;
  onShipOrder?: (orderId: string | string[], merchantKey?: string) => void;
  onClose: () => void;
  currentUser?: string;
  registeredUsers?: any[];
  customProductImages?: Record<string, string>;
}

export default function AdminDashboardView({
  merchantsDb,
  onUpdateMerchantData,
  onDeleteMerchant,
  onShipOrder,
  onClose,
  currentUser = '',
  registeredUsers = [],
  customProductImages = {}
}: AdminDashboardViewProps) {
  const isMaster = useMemo(() => {
    const nameLower = currentUser.toLowerCase();
    if (nameLower === 'oopqwe521@gmail.com' || nameLower === 'oopqwe001@gmail.com') return true;
    const match = registeredUsers.find(u => u.name.toLowerCase() === nameLower);
    const mDb = merchantsDb[nameLower];
    return match?.isAdmin || mDb?.isAdmin || false;
  }, [currentUser, registeredUsers, merchantsDb]);
  const isSalesman = useMemo(() => {
    if (isMaster) return false;
    const nameLower = currentUser.toLowerCase();
    const match = registeredUsers.find(u => u.name.toLowerCase() === nameLower);
    const mDb = merchantsDb[nameLower];
    return match?.isSalesman || mDb?.isSalesman || false;
  }, [registeredUsers, currentUser, isMaster, merchantsDb]);
  // Navigation: 'stores' | 'dispatch' | 'orders' | 'withdraws' | 'products'
  const [activeTab, setActiveTab] = useState<'stores' | 'dispatch' | 'orders' | 'withdraws' | 'products'>('stores');
  
  // Search state for merchants
  const [merchantSearch, setMerchantSearch] = useState('');
  
    // States for modifying store properties
  const [editingMerchantKey, setEditingMerchantKey] = useState<string | null>(null);
  const [deletingMerchantKey, setDeletingMerchantKey] = useState<string | null>(null);
  const [editPasswordInput, setEditPasswordInput] = useState('');
  const [editBalanceInput, setEditBalanceInput] = useState('');
  const [editPromotedBy, setEditPromotedBy] = useState('');
  const [manualBindInput, setManualBindInput] = useState('');
  const [editRole, setEditRole] = useState<'merchant' | 'salesman' | 'admin'>('merchant');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // States for Order Dispatcher Form
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dispatchQty, setDispatchQty] = useState<number>(1);
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [dispatchSearchQuery, setDispatchSearchQuery] = useState<string>('');

  // States for Editing Bank details in Withdrawals
  const [editingWithdrawId, setEditingWithdrawId] = useState<string | null>(null);
  const [editBankName, setEditBankName] = useState('');
  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchNo, setEditBranchNo] = useState('');
  const [editBankCard, setEditBankCard] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editingWithdrawMerchantKey, setEditingWithdrawMerchantKey] = useState<string>('');

  // Brand filter state for global orders view
  const [orderMerchantFilter, setOrderMerchantFilter] = useState<string>('');
  const [orderMerchantSearch, setorderMerchantSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'shipped' | 'completed'>('all');
  const [dispatchMerchantSearch, setDispatchMerchantSearch] = useState<string>('');
  const [financialSubTab, setFinancialSubTab] = useState<'recharges' | 'withdraws'>('recharges');
  const [visibleProductsCount, setVisibleProductsCount] = useState<number>(40);
  const [priceSortOrder, setPriceSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [randomCountry, setRandomCountry] = useState<string>('random');

  // States for Manual Commercial Product Uploader Tab
  const [productsSearchQuery, setProductsSearchQuery] = useState('');
  const [productsCategoryFilter, setProductsCategoryFilter] = useState('全部');
  const [selectedManageProductId, setSelectedManageProductId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [directUrlInput, setDirectUrlInput] = useState('');

  // States for Category-Based Sequential Batch Upload Manager
  const [showBatchUploadPanel, setShowBatchUploadPanel] = useState(false);
  const [batchTargetCategory, setBatchTargetCategory] = useState('臻选腕表');
  const [uploadedBatchFiles, setUploadedBatchFiles] = useState<{ id: string; name: string; base64: string }[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchErrorMessage, setBatchErrorMessage] = useState<string | null>(null);

  // Local state for Global Customer Service Link
  const [csLinkInput, setCsLinkInput] = useState(() => {
    return merchantsDb?.system_config?.customerServiceLink || '';
  });

  React.useEffect(() => {
    if (merchantsDb?.system_config?.customerServiceLink !== undefined) {
      setCsLinkInput(merchantsDb.system_config.customerServiceLink || '');
    }
  }, [merchantsDb?.system_config?.customerServiceLink]);

  React.useEffect(() => {
    setSelectedProduct(null);
  }, [selectedMerchant]);

  // Get keys of all merchants in DB (Memoized and Filtered by Salesman with Self-shop Support)
  const merchantKeys = useMemo(() => {
    const keys = Object.keys(merchantsDb || {}).filter(k => k !== 'system_config' && k !== 'updatedAt' && k !== 'currency');
    const userKeyLower = (currentUser || '').toLowerCase();
    if (!isSalesman) return keys;
    const match = registeredUsers.find(u => u.name.toLowerCase() === userKeyLower);
    const salesmanId = match?.id;
    return keys.filter(k => {
      const m = merchantsDb[k];
      if (!m || typeof m !== 'object') return false;
      const promotedBy = m.promotedBy?.toLowerCase() || '';
      return (
        k === userKeyLower ||
        promotedBy === userKeyLower ||
        (salesmanId && promotedBy === salesmanId.toLowerCase())
      );
    });
  }, [merchantsDb, isSalesman, currentUser, registeredUsers]);

  // Filtered merchants list (Memoized)
  const filteredMerchantKeys = useMemo(() => {
    return merchantKeys.filter(key => {
      const merchant = merchantsDb[key];
      if (!merchant || typeof merchant !== 'object' || !merchant.name) return false;
      const matchName = (merchant.name || '').toLowerCase().includes((merchantSearch || '').toLowerCase());
      const matchId = (merchant.id || '').includes(merchantSearch || '');
      return matchName || matchId;
    });
  }, [merchantKeys, merchantsDb, merchantSearch]);

  // Dynamic list of all salesmen in the database
  const allSalesmen = useMemo(() => {
    const list = new Set<string>();
    
    // 1. From registeredUsers
    registeredUsers.forEach(u => {
      if (u.isSalesman) {
        list.add(u.name);
      }
    });
    
    // 2. From merchantsDb
    Object.keys(merchantsDb).forEach(k => {
      if (k === 'system_config') return;
      const m = merchantsDb[k];
      if (m && m.isSalesman) {
        list.add(m.name || k);
      }
      if (m && m.promotedBy) {
        list.add(m.promotedBy);
      }
    });

    return Array.from(list).filter(Boolean);
  }, [registeredUsers, merchantsDb]);

  // Count stores per promoter / referral
  const promoterStoreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(merchantsDb || {}).forEach(k => {
      if (k === 'system_config' || k === 'updatedAt' || k === 'currency') return;
      const m = merchantsDb[k];
      if (m && typeof m === 'object' && m.promotedBy) {
        const p = m.promotedBy.toLowerCase();
        counts[p] = (counts[p] || 0) + 1;
      }
    });
    return counts;
  }, [merchantsDb]);

  // Calculate global totals (Memoized)
  const totalMerchantCount = merchantKeys.length;
  const grandTotalBalance = useMemo(() => {
    return merchantKeys.reduce((sum, k) => {
      const m = merchantsDb[k];
      return sum + (m && typeof m === 'object' ? m.balance || 0 : 0);
    }, 0);
  }, [merchantKeys, merchantsDb]);
  
  // Total cumulative profits of all shops combined (Memoized)
  const grandTotalProfit = useMemo(() => {
    return merchantKeys.reduce((sum, key) => {
      const m = merchantsDb[key];
      if (!m || typeof m !== 'object') return sum;
      const completedOrders = (m.orders || []).filter((o: any) => o && o.status === 'completed' && !o.isSelfOrder);
      return sum + completedOrders.reduce((acc: number, o: any) => acc + (o.totalProfit || 0), 0);
    }, 0);
  }, [merchantKeys, merchantsDb]);

  // Dispatch random overseas recipient information to fill out forms seamlessly (excluding China)
  const handleRandomizeRecipient = () => {
    const OVERSEAS_DATA: Record<string, {
      name: string;
      names: string[];
      phones: string[];
      addresses: string[];
    }> = {
      japan: {
        name: '日本',
        names: ['山本 拓也', '中村 舞', '鈴木 浩介', '田中 裕子', '高橋 健二', '渡辺 翔太', '小林 明美', '佐藤 剛士', '井上 雄介', '加藤 恵'],
        phones: ['090-4821-3951', '080-2241-9952', '070-1125-4556', '090-8802-1249', '080-7711-2241', '090-3352-8822', '080-1234-5678'],
        addresses: [
          '東京都新宿区歌舞伎町1丁目25-3号 101号室',
          '大阪府大阪市北区梅田3丁目1-3',
          '京都府京都市下京区烏丸通塩小路下ル東塩小路町721-1',
          '神奈川県横浜市中区元町1丁目12-3',
          '北海道札幌市中央区北5条西4丁目7',
          '福岡県福岡市博多区博多駅中央街1-1号',
          '愛知県名古屋市中村区名駅1丁目1-4'
        ]
      },
      korea: {
        name: '韩国',
        names: ['김수현 (金秀贤)', '박신혜 (朴信惠)', '이민호 (李敏镐)', '정은지 (郑恩地)', '최민호 (崔珉豪)', '강소라 (姜素拉)', '한지민 (韩智敏)', '송중기 (宋仲基)'],
        phones: ['010-3491-5821', '010-8812-4412', '010-7215-9981', '010-4512-3321', '010-1102-4521', '010-5524-8891'],
        addresses: [
          '서울특별시 중구 명동길 14 (명동2가)',
          '부산광역시 해운대구 우동대로 124-2',
          '인천광역시 연수구 송도동 23-4 (송도웰카운티)',
          '대구광역시 수성구 범어동 45-12',
          '제주특별자치도 제주시 연동 12길 5',
          '경기도 수원시 팔달구 효원로 295'
        ]
      },
      usa: {
        name: '美国',
        names: ['James Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Miller', 'Jessica Wilson', 'Robert Taylor', 'John Williams', 'Linda Jones', 'William Garcia'],
        phones: ['+1 (212) 555-0199', '+1 (310) 982-4123', '+1 (415) 332-9018', '+1 (206) 881-2241', '+1 (617) 459-3312', '+1 (305) 774-1239'],
        addresses: [
          '120 Broadway, New York, NY 10271, USA',
          '742 Evergreen Terrace, Springfield, OR 97477, USA',
          '350 5th Ave, New York, NY 10118, USA',
          '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
          '1111 S Figueroa St, Los Angeles, CA 90015, USA',
          '233 S Wacker Dr, Chicago, IL 60606, USA'
        ]
      },
      uk: {
        name: '英国',
        names: ['Thomas Wright', 'Olivia Davies', 'Jack Evans', 'Amelia Roberts', 'William Green', 'Charlotte Hughes', 'Oliver Smith', 'George Taylor', 'Harry Brown'],
        phones: ['+44 (7700) 900077', '+44 (20) 7946 0958', '+44 (161) 496 0441', '+44 (113) 496 0512', '+44 (121) 496 0911'],
        addresses: [
          '221B Baker St, London NW1 6XE, United Kingdom',
          '10 Downing Street, London SW1A 2AA, United Kingdom',
          '32 Windsor Road, Manchester M20 2QD, United Kingdom',
          '45 Queen Street, Edinburgh EH2 3NH, United Kingdom',
          '12 Temple Row, Birmingham B2 5HG, United Kingdom'
        ]
      },
      singapore: {
        name: '新加坡',
        names: ['Tan Wei Liang', 'Lim Bee Geok', 'Muhammad Syazwan', 'Priya Rajendran', 'Chen Mei Ling', 'Lee Jin Yong', 'Wang Junjie', 'Sophia Tan'],
        phones: ['+65 9123 4567', '+65 8234 5678', '+65 9812 3341', '+65 8451 9023', '+65 9012 3456'],
        addresses: [
          '10 Bayfront Ave, Marina Bay Sands, Singapore 018956',
          '8 Sentosa Gateway, Resorts World Sentosa, Singapore 098269',
          '238 Orchard Rd, #04-01 Novena Square, Singapore 238839',
          '45 Marine Parade Rd, #12-04 Marine Heights, Singapore 449021',
          '10 Anson Road, #25-08 International Plaza, Singapore 079903'
        ]
      },
      malaysia: {
        name: '马来西亚',
        names: ['Ahmad Fauzi', 'Chong Wei Keat', 'Siti Aminah', 'Nicholas Lim', 'Ramesh Krishnan', 'Tan Siew Lan', 'Muhammad Firdaus'],
        phones: ['+60 12-345 6789', '+60 16-789 0123', '+60 19-332 4551', '+60 11-4512 8812', '+60 13-9021 5562'],
        addresses: [
          'Kuala Lumpur City Centre, 50088 Kuala Lumpur, Malaysia',
          'Jalan Wong Ah Fook, 80000 Johor Bahru, Johor, Malaysia',
          'Persiaran Bayan Indah, 11900 Bayan Lepas, Penang, Malaysia',
          '32 Jalan Ss 21/39, Damansara Utama, 47400 Petaling Jaya, Selangor, Malaysia'
        ]
      },
      australia: {
        name: '澳大利亚',
        names: ['Lachlan Smith', 'Chloe Jones', 'Oliver Williams', 'Mia Brown', 'Jack Davis', 'Isla Taylor', 'William Wilson'],
        phones: ['+61 491 570 156', '+61 2 9290 1234', '+61 3 9650 4321', '+61 7 3221 8812'],
        addresses: [
          'Sydney Opera House, Bennelong Point, Sydney NSW 2000, Australia',
          '230 Collins St, Melbourne VIC 3000, Australia',
          '85 Queen St, Brisbane QLD 4000, Australia',
          '12 St Georges Terrace, Perth WA 6000, Australia'
        ]
      },
      canada: {
        name: '加拿大',
        names: ['Jean-François Roy', 'Emily Tremblay', 'Robert Gauthier', 'Jessica Bouchard', 'David MacDonald', 'Sarah Leblanc'],
        phones: ['+1 (416) 555-0142', '+1 (604) 555-0177', '+1 (514) 555-0191', '+1 (613) 555-0182'],
        addresses: [
          '290 Bremner Blvd, Toronto, ON M5V 3L9, Canada',
          '1000 Rue de la Gauchetière, Montréal, QC H3B 4W5, Canada',
          '845 Marine Dr, Vancouver, BC V7T 1A7, Canada',
          '10111 104 Ave NW, Edmonton, AB T5J 0E4, Canada'
        ]
      },
      germany: {
        name: '德国',
        names: ['Lukas Müller', 'Marie Schmidt', 'Maximilian Schneider', 'Sophie Fischer', 'Alexander Weber', 'Laura Meyer'],
        phones: ['+49 170 1234567', '+49 30 123456', '+49 89 223456', '+49 40 323456'],
        addresses: [
          'Kurfürstendamm 21, 10719 Berlin, Germany',
          'Marienplatz 1, 80331 München, Germany',
          'Königsallee 60, 40212 Düsseldorf, Germany',
          'Reeperbahn 136, 22767 Hamburg, Germany'
        ]
      },
      uae: {
        name: '迪拜/阿联酋',
        names: ['Mohammed Al-Maktoum', 'Fatima Al-Suwaidi', 'Ahmed Al-Harmoodi', 'Aisha Al-Marzouqi', 'Zayed Al-Nahyan'],
        phones: ['+971 50 123 4567', '+971 4 234 5678', '+971 52 987 6543', '+971 55 456 7890'],
        addresses: [
          'Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE',
          'Dubai Marina Mall, Sheikh Zayed Rd, Dubai, UAE',
          'Yas Island, Abu Dhabi, UAE',
          'Al Fahidi Historical District, Bur Dubai, UAE'
        ]
      }
    };

    const keys = Object.keys(OVERSEAS_DATA);
    let selectedKey = randomCountry;
    if (selectedKey === 'random') {
      selectedKey = keys[Math.floor(Math.random() * keys.length)];
    }

    const data = OVERSEAS_DATA[selectedKey] || OVERSEAS_DATA.japan;
    const randomVal = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    setCustName(randomVal(data.names));
    setCustPhone(randomVal(data.phones));
    setCustAddress(randomVal(data.addresses));
  };

  // Submit Order Dispatch
  const handleDispatchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) {
      triggerError('⚠️ 请选择一个要派发订单的目标店家！');
      return;
    }
    if (!selectedProduct) {
      triggerError('⚠️ 请从下方列表中选择一个要派发的商品！');
      return;
    }
    if (dispatchQty <= 0) {
      triggerError('⚠️ 请输入有效商品数量！');
      return;
    }
    if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
      triggerError('⚠️ 请完整填写客户买家收货人信息！\n建议点击右侧的“⚡自动极速生成”按钮一键生成收货地址。');
      return;
    }

    const mKey = selectedMerchant.toLowerCase();
    const merchant = merchantsDb[mKey];
    if (!merchant) {
      triggerError('店家信息不存在！');
      return;
    }

    // Set up product pricing
    const cost = selectedProduct.costPrice;
    const retail = selectedProduct.retailPrice;
    const qty = dispatchQty;
    const totalCost = cost * qty;
    const totalRetail = retail * qty;
    const profitVal = (retail - cost) * qty;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const orderId = `ORD-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      shopId: 'shop-' + merchant.name,
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      shippingAddress: custAddress.trim(),
      orderDate: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: qty,
        retailPrice: retail,
        costPrice: cost,
        image: selectedProduct.image
      }],
      totalPrice: totalRetail,
      totalProfit: profitVal,
      status: 'pending'
    };

    const updatedOrders = [newOrder, ...(merchant.orders || [])];

    onUpdateMerchantData(mKey, { orders: updatedOrders });

    // Show beautiful success
    triggerSuccess(`🎉 订单 ${orderId} 成功派发配额至店家【${merchant.shop?.name || merchant.name}】！`);
    
    // Clear dispatcher form
    setSelectedProduct(null);
    setDispatchQty(1);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
  };

  // Search for merchant and lock onto them directly
  const handleSearchMerchantOrders = () => {
    if (!orderMerchantSearch.trim()) {
      setOrderMerchantFilter('');
      return;
    }
    const q = orderMerchantSearch.toLowerCase().trim();
    const matchedKey = merchantKeys.find(key => {
      const m = merchantsDb[key];
      return (m.id || '').includes(q) || (m.name || '').toLowerCase().includes(q) || (m.shop?.name || '').toLowerCase().includes(q);
    });
    if (matchedKey) {
      setOrderMerchantFilter(matchedKey);
      triggerSuccess(`已锁定检索到的店家: ${merchantsDb[matchedKey].shop?.name || merchantsDb[matchedKey].name}`);
    } else {
      triggerError(`未找到匹配关键字 "${orderMerchantSearch}" 的注册店家`);
    }
  };

  // Confirm receipt of delivered orders (Settlement)
  const handleDeliverConfirm = (merchantKey: string, orderId: string) => {
    const key = merchantKey.toLowerCase();
    const merchant = merchantsDb[key];
    if (!merchant) return;

    const orderToSettle = (merchant.orders || []).find((o: any) => o.id === orderId);
    if (!orderToSettle) return;
    if (orderToSettle.status !== 'shipped') {
      triggerError('订单尚未发货，无法完成收货分账结算！');
      return;
    }

    // Mark order as completed
    const nextOrders = merchant.orders.map((o: any) => {
      if (o.id === orderId) {
        return { ...o, status: 'completed' as const };
      }
      return o;
    });

    // Credit balance and add logs (return full totalPrice representing both padded cost + profit)
    const settleAmount = orderToSettle.totalPrice;
    const nextBalance = (merchant.balance || 0) + settleAmount;

    const pad = (num: number) => String(num).padStart(2, '0');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const rand = Math.floor(Math.random() * 9000) + 1000;
    const txId = `TX-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${rand}`;

    const newTx: FinancialTransaction = {
      id: txId,
      type: 'settlement',
      typeLabel: '海外客单签收获利',
      amount: settleAmount,
      status: '已到账',
      description: `客户签收商品完结（派发单 ${orderId}），结算商品返还垫本（$${(orderToSettle.totalPrice - orderToSettle.totalProfit).toLocaleString()}）及差额利润（$${orderToSettle.totalProfit.toLocaleString()}）实时全额分账汇入余额`,
      createdAt: `${dateStr} ${timeStr}`
    };

    const nextLogs = [newTx, ...(merchant.financialLogs || [])];

    onUpdateMerchantData(key, {
      orders: nextOrders,
      balance: nextBalance,
      financialLogs: nextLogs
    });

    triggerSuccess(`✅ 订单 ${orderId} 收货结案！${settleAmount.toLocaleString()}円 已回笼分账至该店铺余额。`);
  };

  // Edit merchant values (password and balance)
  const handleSaveMerchantEdits = (key: string) => {
    const keyLower = key.toLowerCase();
    const merchant = merchantsDb[keyLower];
    if (!merchant) return;

    const updates: Partial<any> = {};

    if (editPasswordInput.trim()) {
      if (editPasswordInput.trim().length < 6) {
        triggerError('安全密码最低要求6位字符！');
        return;
      }
      updates.password = editPasswordInput.trim();
    }

    if (editBalanceInput.trim() && !isSalesman) {
      const parsedBalance = parseFloat(editBalanceInput.trim());
      if (isNaN(parsedBalance) || parsedBalance < 0) {
        triggerError('请输入大于或等于0的有效余额数值');
        return;
      }
      updates.balance = parsedBalance;
    }

    if (!isSalesman) {
      updates.isSalesman = editRole === 'salesman';
      updates.isAdmin = editRole === 'admin';
    }
    updates.promotedBy = editPromotedBy.trim() ? editPromotedBy.trim() : null;

    onUpdateMerchantData(keyLower, updates);
    setEditingMerchantKey(null);
    setEditPasswordInput('');
    setEditBalanceInput('');
    setEditPromotedBy('');
    triggerSuccess(`🛠️ 店家【${merchant.shop?.name || merchant.name}】的信息、密码密码与相关关联已更新成功！`);
  };

  // Delete merchant entirely
  const handleDeleteMerchantClick = (key: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower === 'oopqwe001@gmail.com' || keyLower === 'oopqwe521@gmail.com' || keyLower === 'admin') {
      triggerError('安全限制：无法删除受保护的系统总中控或最高管理账户！');
      return;
    }
    
    if (onDeleteMerchant) {
      onDeleteMerchant(keyLower);
      triggerSuccess(`🗑️ 已经成功彻底清除该商户店家账号（${keyLower}）及其全部关联数据与订单！`);
      setDeletingMerchantKey(null);
    } else {
      triggerError('删除操作接口未就绪。');
    }
  };

  // Recharge flow Audit: Approve (批准入账)
  const handleApproveRecharge = (merchantKey: string, txId: string) => {
    const key = merchantKey.toLowerCase();
    const merchant = merchantsDb[key];
    if (!merchant) return;

    const tx = (merchant.financialLogs || []).find((t: any) => t.id === txId);
    if (!tx) return;
    if (tx.status !== '已提交') {
      triggerError('该笔充值已核销审计，勿重复处理。');
      return;
    }

    // 1. Update status to '成功' or '已到账'
    const nextLogs = (merchant.financialLogs || []).map((t: any) => {
      if (t.id === txId) {
        return { ...t, status: '成功' as const, description: `通过外部结算账户注资 $${t.amount.toLocaleString()}，资金已由超级主管复核获批确认入账可用` };
      }
      return t;
    });

    // 2. Increase balance
    const nextBalance = (merchant.balance || 0) + tx.amount;

    onUpdateMerchantData(key, {
      financialLogs: nextLogs,
      balance: nextBalance
    });

    triggerSuccess(`💰 充值交易 ${txId} 已核准批准入账！USD $${tx.amount.toLocaleString()} 成功注入该店家可用余额中。`);
  };

  // Recharge flow Audit: Reject (驳回/拒绝充值)
  const handleRejectRecharge = (merchantKey: string, txId: string) => {
    const key = merchantKey.toLowerCase();
    const merchant = merchantsDb[key];
    if (!merchant) return;

    const tx = (merchant.financialLogs || []).find((t: any) => t.id === txId);
    if (!tx) return;
    if (tx.status !== '已提交') {
      triggerError('该笔充值已核销审计，勿重复处理。');
      return;
    }

    // Update status to '已拒绝'
    const nextLogs = (merchant.financialLogs || []).map((t: any) => {
      if (t.id === txId) {
        return { ...t, status: '已拒绝' as const, description: `通过外部结算账户注资 $${t.amount.toLocaleString()}的申请，由于财务复核不通过已被驳回拒绝` };
      }
      return t;
    });

    onUpdateMerchantData(key, {
      financialLogs: nextLogs
    });

    triggerSuccess(`❌ 充值申请 ${txId} 已做拒签驳回处理！`);
  };

  // Withdraw flow Audit: Approve (同意)
  const handleApproveWithdrawal = (merchantKey: string, withdrawId: string) => {
    const key = merchantKey.toLowerCase();
    const merchant = merchantsDb[key];
    if (!merchant) return;

    const record = (merchant.withdrawHistory || []).find((r: any) => r.id === withdrawId);
    if (!record) return;

    // Change status to approved
    const nextList = merchant.withdrawHistory.map((r: any) => {
      if (r.id === withdrawId) {
        return { ...r, status: '已到账' };
      }
      return r;
    });

    // We already deducted the balance at submission time, so we just set the audit status and notify.
    // Let's also update any financial logs matching this to '成功' or leave as is.
    const nextLogs = (merchant.financialLogs || []).map((log: any) => {
      if (log.description.includes(withdrawId) || log.type === 'withdraw') {
        return { ...log, status: '成功' as const };
      }
      return log;
    });

    onUpdateMerchantData(key, {
      withdrawHistory: nextList,
      financialLogs: nextLogs
    });

    triggerSuccess(`🏦 提现交易 ${withdrawId} 已批准并完成清算！资金已顺利汇往收款卡。`);
  };

  // Withdraw flow Audit: Reject (拒绝并退还本金)
  const handleRejectWithdrawal = (merchantKey: string, withdrawId: string) => {
    const key = merchantKey.toLowerCase();
    const merchant = merchantsDb[key];
    if (!merchant) return;

    const record = (merchant.withdrawHistory || []).find((r: any) => r.id === withdrawId);
    if (!record) return;
    if (record.status === '已到账' || record.status === '已拒绝') {
      triggerError('该笔申请已结案审计，勿重复提交。');
      return;
    }

    // Change status to rejected
    const nextList = merchant.withdrawHistory.map((r: any) => {
      if (r.id === withdrawId) {
        return { ...r, status: '已拒绝' };
      }
      return r;
    });

    // Refund the amount
    const amountToRefund = record.amount;
    const nextBalance = (merchant.balance || 0) + amountToRefund;

    const pad = (num: number) => String(num).padStart(2, '0');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const txId = `TX-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(100+Math.random()*900)}`;

    const refundTx: FinancialTransaction = {
      id: txId,
      type: 'recharge',
      typeLabel: '提现遭拒返还',
      amount: amountToRefund,
      status: '成功',
      description: `提现申请 [${withdrawId}] 审计由于财务复核未通过被拒绝，原路划转退回本金`,
      createdAt: `${dateStr} ${timeStr}`
    };

    const nextLogs = [refundTx, ...(merchant.financialLogs || [])];

    onUpdateMerchantData(key, {
      withdrawHistory: nextList,
      balance: nextBalance,
      financialLogs: nextLogs
    });

    triggerSuccess(`❌ 提现申请 ${withdrawId} 被拒绝！退款本金 USD $${amountToRefund.toLocaleString()} 已原路退回店铺余额。`);
  };

  // Edit details of withdrawal payee bank account (修改结算银行卡)
  const handleSaveBankCardEdits = () => {
    if (!editingWithdrawId) return;
    const key = editingWithdrawMerchantKey.toLowerCase();
    const merchant = merchantsDb[key];
    if (!merchant) return;

    const nextList = (merchant.withdrawHistory || []).map((r: any) => {
      if (r.id === editingWithdrawId) {
        return {
          ...r,
          bankName: editBankName.trim(),
          branchName: editBranchName.trim(),
          branchNo: editBranchNo.trim(),
          bankCard: editBankCard.trim(),
          fullName: editFullName.trim()
        };
      }
      return r;
    });

    onUpdateMerchantData(key, {
      withdrawHistory: nextList
    });

    setEditingWithdrawId(null);
    triggerSuccess(`💳 收款账户信息已修改成功！该店家已可在提现历史中查看最新正确的银行分配信息。`);
  };

  const triggerSuccess = (msg: string) => {
    setMessageType('success');
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4500);
  };

  const triggerError = (msg: string) => {
    setMessageType('error');
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4500);
  };

  // Collect all orders of all merchants in the system (Memoized and Sorted)
  interface AggregateOrder {
    merchantKey: string;
    merchantName: string;
    order: Order;
    promotedBy?: string | null;
  }
  const allGlobalOrders = useMemo((): AggregateOrder[] => {
    const list: AggregateOrder[] = [];
    merchantKeys.forEach(mKey => {
      const merchant = merchantsDb[mKey];
      if (merchant && typeof merchant === 'object' && Array.isArray(merchant.orders)) {
        merchant.orders.forEach((o: Order) => {
          if (o && o.id) {
            list.push({
              merchantKey: mKey,
              merchantName: merchant.shop?.name || merchant.name || mKey,
              order: o,
              promotedBy: merchant.promotedBy
            });
          }
        });
      }
    });
    return list.sort((a, b) => (b.order.id || '').localeCompare(a.order.id || ''));
  }, [merchantKeys, merchantsDb]);

  // Collect all withdrawals from all merchants in the system (Memoized and Sorted)
  interface AggregateWithdraw {
    merchantKey: string;
    merchantName: string;
    record: {
      id: string;
      amount: number;
      bankName: string;
      branchName: string;
      branchNo: string;
      fullName: string;
      bankCard: string;
      status: string;
      createdAt: string;
    };
  }
  const allGlobalWithdraws = useMemo((): AggregateWithdraw[] => {
    const list: AggregateWithdraw[] = [];
    merchantKeys.forEach(mKey => {
      const merchant = merchantsDb[mKey];
      if (merchant && typeof merchant === 'object' && Array.isArray(merchant.withdrawHistory)) {
        merchant.withdrawHistory.forEach((rec: any) => {
          if (rec && rec.createdAt) {
            list.push({
              merchantKey: mKey,
              merchantName: merchant.shop?.name || merchant.name || mKey,
              record: rec
            });
          }
        });
      }
    });
    return list.sort((a, b) => (b.record.createdAt || '').localeCompare(a.record.createdAt || ''));
  }, [merchantKeys, merchantsDb]);

  // Collect all recharges from all merchants in the system (Memoized and Sorted)
  interface AggregateRecharge {
    merchantKey: string;
    merchantName: string;
    transaction: {
      id: string;
      type: 'recharge' | 'withdraw' | 'promotion' | 'settlement';
      typeLabel: string;
      amount: number;
      status: '成功' | '已到账' | '已扣除' | '已提交' | '已拒绝';
      description: string;
      createdAt: string;
    };
  }
  const allGlobalRecharges = useMemo((): AggregateRecharge[] => {
    const list: AggregateRecharge[] = [];
    merchantKeys.forEach(mKey => {
      const merchant = merchantsDb[mKey];
      if (merchant && typeof merchant === 'object' && Array.isArray(merchant.financialLogs)) {
        merchant.financialLogs.forEach((tx: any) => {
          if (tx && tx.type === 'recharge' && (tx.typeLabel?.includes('充值') || tx.typeLabel?.includes('注资'))) {
            list.push({
              merchantKey: mKey,
              merchantName: merchant.shop?.name || merchant.name || mKey,
              transaction: tx
            });
          }
        });
      }
    });
    return list.sort((a, b) => (b.transaction.createdAt || '').localeCompare(a.transaction.createdAt || ''));
  }, [merchantKeys, merchantsDb]);

  // Product Filter for dispatching (Memoized to prevent lag during form typing and support sorting)
  const filteredProducts = useMemo(() => {
    if (!selectedMerchant) {
      return []; // Return empty if no merchant is selected
    }
    const mKey = selectedMerchant.toLowerCase();
    const merchant = merchantsDb[mKey];
    const addedProductIds = merchant?.shop?.addedProductIds || [];

    // Only display products that are listed/added by the current merchant
    let list = ALL_PRODUCTS.filter(p => addedProductIds.includes(p.id));

    const query = dispatchSearchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(p => {
        return p.name.toLowerCase().includes(query) || 
               p.id.toLowerCase().includes(query);
      });
    }

    // Sort by price (cost price)
    if (priceSortOrder === 'asc') {
      list.sort((a, b) => a.costPrice - b.costPrice);
    } else if (priceSortOrder === 'desc') {
      list.sort((a, b) => b.costPrice - a.costPrice);
    }

    return list;
  }, [dispatchSearchQuery, priceSortOrder, selectedMerchant, merchantsDb]);

  if (!isMaster && !isSalesman) {
    return (
      <div className="fixed inset-0 bg-zinc-950/98 backdrop-blur-xl z-55 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-950/55 flex items-center justify-center text-[#e51923] border border-red-500/20">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-white font-sans text-sm font-black tracking-wider">无权访问系统中控 (Access Denied)</h2>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            您当前的账户 <strong>{currentUser}</strong> 为普通商户角色，没有访问速卖通超级中控或业务员后台的授权协议。
          </p>
          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 bg-[#e51923] hover:bg-red-600 text-white text-[11px] font-black rounded-xl cursor-pointer transition-all active:scale-95"
          >
            返回商户控制台
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-50 text-zinc-800 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Admin Title bar / Operations header */}
      <div className="bg-white border-b border-zinc-200 px-5 py-3.5 shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#e51923] flex items-center justify-center text-white shadow-lg shadow-red-900/30">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-900 tracking-wide flex items-center gap-2">
              {isSalesman ? '速卖通沙盒业务员端中控系统' : '速卖通沙盒超级中控系统'}
              <span className="text-[10px] font-mono px-2 py-0.5 bg-red-100 text-[#e51923] rounded-full font-bold uppercase border border-red-200">
                {isSalesman ? 'Salesman Console' : 'Master Console'}
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">
              {isSalesman ? '业务员专属中控结算与签约店家管理系统' : '跨境多商户自习中控结算底层数据库'}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-lg text-xs font-bold border border-zinc-250 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>关闭后台</span>
        </button>
      </div>

      {/* Global Notice Area */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border-b text-xs px-5 py-2.5 flex items-start gap-2 select-all relative z-40 shrink-0 font-medium text-left ${
              messageType === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-200' 
                : 'bg-red-500/15 border-red-500/35 text-red-100'
            }`}
          >
            {messageType === 'success' ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
            )}
            <span className="break-all">{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Area split into Sidebar and Viewport */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-zinc-50">
        
        {/* Left Vertical Sidebar (Vertical list sorting like screenshot) */}
        <div className="w-full md:w-68 shrink-0 bg-zinc-100 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col p-4 gap-2.5 overflow-y-auto">
          
          <div className="text-[9.5px] text-zinc-500 font-extrabold uppercase tracking-widest px-2 mb-1.5 block">
            SUPERVISOR BACKEND NAVIGATION
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('stores')}
            className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
              activeTab === 'stores' 
                ? 'bg-[#e51923] text-white shadow-lg shadow-red-950/25 active:scale-[0.98]' 
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'stores' ? 'text-white' : 'text-blue-600'}`} />
              <span>店家注册多模型管理</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${activeTab === 'stores' ? 'bg-red-700/50 text-white' : 'bg-zinc-200 text-zinc-650 border border-zinc-300'}`}>
              {totalMerchantCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dispatch')}
            className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-3 ${
              activeTab === 'dispatch' 
                ? 'bg-[#e51923] text-white shadow-lg shadow-red-950/25 active:scale-[0.98]' 
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-200/80'
            }`}
          >
            <Plus className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'dispatch' ? 'text-white' : 'text-amber-600'}`} />
            <span>全局多商品派发订单</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
              activeTab === 'orders' 
                ? 'bg-[#e51923] text-white shadow-lg shadow-red-950/25 active:scale-[0.98]' 
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clipboard className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'orders' ? 'text-white' : 'text-pink-600'}`} />
              <span>店家交易订单发货核收</span>
            </div>
            {allGlobalOrders.filter(o => o.order.status === 'shipped').length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            )}
          </button>

          {!isSalesman && (
            <button
              type="button"
              onClick={() => setActiveTab('withdraws')}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === 'withdraws' 
                  ? 'bg-[#e51923] text-white shadow-lg shadow-red-950/25 active:scale-[0.98]' 
                  : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-200/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Landmark className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'withdraws' ? 'text-white' : 'text-emerald-600'}`} />
                <span>提现与充值审核</span>
              </div>
              {(allGlobalRecharges.filter(r => r.transaction.status === '已提交').length > 0 || 
                allGlobalWithdraws.filter(w => w.record.status === '已提交').length > 0) && (
                <span className="bg-[#e51923] text-white text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded-full animate-pulse border border-white/20">
                  {allGlobalRecharges.filter(r => r.transaction.status === '已提交').length +
                    allGlobalWithdraws.filter(w => w.record.status === '已提交').length}
                </span>
              )}
            </button>
          )}

          {!isSalesman && (
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === 'products' 
                  ? 'bg-[#e51923] text-white shadow-lg shadow-red-950/25 active:scale-[0.98]' 
                  : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-200/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'products' ? 'text-white' : 'text-red-600'}`} />
                <span>公共商品主图维护</span>
              </div>
              {Object.keys(customProductImages || {}).length > 0 && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${activeTab === 'products' ? 'bg-red-700/50 text-white' : 'bg-zinc-200 text-zinc-650 border border-zinc-300'}`}>
                  {Object.keys(customProductImages || {}).length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Main Panel Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white">
          
          {/* Dashboard Mini-Bento Status Cards */}
          <div className="bg-zinc-50 px-5 py-3 shrink-0 grid grid-cols-3 gap-3 border-b border-zinc-200">
            <div className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>店家注册总数</span>
              </span>
              <span className="text-xl font-black text-zinc-900 font-mono mt-1">{totalMerchantCount} <span className="text-xs text-zinc-500 font-medium font-sans">家</span></span>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-500" />
                <span>商端沉淀可用累计总余额</span>
              </span>
              <span className="text-sm sm:text-base font-black text-zinc-900 font-mono mt-1 break-all truncate">
                ${grandTotalBalance.toLocaleString()}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>所有店家已赚提成利润额</span>
              </span>
              <span className="text-sm sm:text-base font-black text-[#e51923] font-mono mt-1 break-all truncate">
                ${grandTotalProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Main Tab Panels Viewport */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50">
        
        {/* PANEL 1: STORES LIST & PASSWORD/BALANCE MANAGEMENT */}
        {activeTab === 'stores' && (
          <div className="flex flex-col gap-4 text-left">
            {isSalesman && (
              <div className="bg-[#0b241b] text-white p-5 rounded-2xl border border-emerald-900/55 flex flex-col gap-3 relative overflow-hidden shadow-md">
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-[0.04] pointer-events-none">
                  <UserPlus className="w-56 h-56 text-emerald-400" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700/60 flex items-center justify-center text-emerald-300 shadow-sm shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300 font-sans">我的专属业务员推广招商系统 (PROMOTER WORKSTATION)</h3>
                      <p className="text-[10px] text-emerald-400 font-medium mt-0.5 font-mono">
                        业务账号: <span className="text-white font-bold select-all">{currentUser}</span> | 推广员ID: {registeredUsers.find(u => u.name.toLowerCase() === currentUser.toLowerCase())?.id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-mono bg-emerald-950 font-black text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/40 shrink-0">
                    👥 自主发展开店代理数: {totalMerchantCount} 家
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] text-zinc-300 font-extrabold tracking-wider uppercase">我的专属开店招商推广链接 (Your Promoter Referral Link):</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/?ref=${encodeURIComponent(currentUser || '')}`}
                      className="flex-1 bg-zinc-950 border border-emerald-950 text-emerald-400 p-2.5 rounded-xl text-xs font-mono select-all focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${encodeURIComponent(currentUser || '')}`);
                          alert('您的专属招商推广链接已成功复制到剪贴板！可以直接发送给新商家注册。');
                        } catch (e) {
                          alert(`您的专属推广链接为: ${window.location.origin}/?ref=${encodeURIComponent(currentUser || '')}`);
                        }
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer transition-all active:scale-95 font-sans flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制链接</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans mt-1.5">
                    💡 <span className="text-emerald-300 font-bold">什么是推广链接？</span> 将上方专属链接发送给需要加盟的速卖通店主（新用户）。他们在浏览器中打开此专属链接点击“免费开店”进行注册时，推荐人会自动锁定为您。之后他们在店里产生的所有订单、派单与充值状态都将属于您的业务管理范畴。
                  </p>
                </div>

                {/* Manual Binding Console */}
                <div className="border-t border-emerald-900/30 pt-4 mt-1 flex flex-col gap-2">
                  <span className="text-[10px] text-emerald-300 font-black tracking-wider uppercase flex items-center gap-1.5 font-sans">
                    🔗 手动绑定您的下属商家 (MANUAL REFERRAL PAIRING):
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="请输入他的邮箱或用户名 (例如: ceshao01@gmail.com)"
                      value={manualBindInput}
                      onChange={(e) => setManualBindInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-emerald-950/80 text-emerald-300 p-2.5 rounded-xl text-xs font-mono placeholder-emerald-800/60 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const targetEmail = manualBindInput.trim();
                        const targetEmailLower = targetEmail.toLowerCase();
                        if (!targetEmailLower) {
                          alert('请输入对应您的加盟商注册注册的邮箱或用户名！');
                          return;
                        }
                        const targetMerchant = merchantsDb[targetEmailLower];
                        if (!targetMerchant) {
                          alert(`【无法绑定】系统数据库未找到注册账号为【${targetEmail}】的店家。请确保其已经“注册新账户”成功。`);
                          return;
                        }
                        if (targetMerchant.promotedBy) {
                          alert(`【无法更改】该店铺已锁定关联了业务推广员【${targetMerchant.promotedBy}】，无法重复更改。`);
                          return;
                        }
                        
                        // Bind it!
                        onUpdateMerchantData(targetEmailLower, { promotedBy: currentUser.toLowerCase() });
                        setManualBindInput('');
                        alert(`【🎉 绑定成功！】已成功将店家【${targetEmailLower}】手动归入您的专属业务员名单【${currentUser}】下！`);
                      }}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer transition-all active:scale-95 font-sans flex items-center justify-center gap-1 shrink-0 shadow-md border border-emerald-500/10"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>立即锁定该店家</span>
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal font-sans">
                    💡 如果由于海外店家浏览器清除了 Cookie 或未正常从您的专属推广链接中走完流程，您可以使用此功能【手动补绑】。
                  </p>
                </div>
              </div>
            )}

            {/* GLOBAL CUSTOMER SERVICE CONFIG CARD (ONLY FOR ADMINS) */}
            {!isSalesman && (
              <div className="bg-white text-zinc-900 p-5 rounded-2xl border border-zinc-200 flex flex-col gap-3 relative overflow-hidden shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shadow-xs shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 font-sans">
                      🌐 全局在线客服系统配置 (GLOBAL CUSTOMER SERVICE RE-ROUTE)
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5 font-sans">
                      可以配置 LINE、WhatsApp、Telegram、网页在线聊天或是客服工单系统。前端右下角将同步呈现绿色气标并引导跳转。
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] text-zinc-650 font-extrabold tracking-wider uppercase">
                    在线客服外部跳转链接 (Customer Support Hyperlink URL):
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input 
                      type="url" 
                      placeholder="例如: https://line.me/ti/p/your_line_id 或 https://wa.me/..."
                      value={csLinkInput}
                      onChange={(e) => setCsLinkInput(e.target.value)}
                      className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-800 p-2.5 rounded-xl text-xs font-mono placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLink = csLinkInput.trim();
                        onUpdateMerchantData('system_config', { customerServiceLink: newLink });
                        alert('【🎉 配置更新成功！】全局客服跳转链接已成功保存在系统底层数据库，前端气标已实时生效！');
                      }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-black text-xs rounded-xl cursor-pointer transition-all active:scale-[0.97] font-sans flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>保存客服链接</span>
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-medium leading-normal mt-1 font-sans font-sans">
                    💡 <span className="text-zinc-600 font-bold">提示:</span> 提交完整且以 <code className="font-mono bg-zinc-100 px-1 py-0.5 text-red-650 rounded">http://</code> 或 <code className="font-mono bg-zinc-100 px-1 py-0.5 text-[#e51923] rounded">https://</code> 开头的规范 URL。若不设置（留空），前端点击客服图标将以默认的“客服通道维护中”提示窗提示用户。
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  已注册店家列表数据库 (DATABASE SCHEMAS)
                </span>
              </div>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="搜索商户账号、邮箱 or 5位数 ID"
                  value={merchantSearch}
                  onChange={(e) => setMerchantSearch(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredMerchantKeys.map(key => {
                const merchant = merchantsDb[key];
                const completedOrders = (merchant.orders || []).filter((o: any) => o.status === 'completed' && !o.isSelfOrder);
                const itemProfits = completedOrders.reduce((sum: number, o: any) => sum + (o.totalProfit || 0), 0);
                const isEditing = editingMerchantKey === key;

                return (
                  <div 
                    key={key}
                    className="bg-white border border-zinc-200 p-4 rounded-2xl hover:border-zinc-300 shadow-xs transition-colors flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 text-[#e51923] border border-zinc-200 font-sans font-black flex items-center justify-center uppercase text-sm font-mono shadow-sm">
                          {merchant.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-zinc-900 truncate max-w-[180px] break-all select-all font-mono">
                              {merchant.name}
                            </span>
                            {merchant.name.toLowerCase() === 'oopqwe001@gmail.com' && (
                              <span className="text-[8px] bg-red-650 text-white font-extrabold px-2 py-0.5 rounded-md font-sans tracking-tight uppercase">
                                总中控管理员
                              </span>
                            )}
                            {merchant.isAdmin ? (
                              <span className="text-[8px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-md font-sans tracking-tight uppercase">
                                协同超级管理员 ADMIN
                              </span>
                            ) : merchant.isSalesman ? (
                              <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-md font-sans tracking-tight uppercase">
                                业务推广拉新员 PROMOTER
                              </span>
                            ) : (
                              merchant.name.toLowerCase() !== 'oopqwe001@gmail.com' && (
                                <span className="text-[8px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-md font-sans tracking-tight uppercase">
                                  普通店家 MERCHANT
                                </span>
                              )
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-zinc-650 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200 font-semibold">
                              店家ID: {merchant.id || 'N/A'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-650 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200 font-semibold truncate max-w-[130px]">
                              密码: {merchant.password || '123456'}
                            </span>
                            {merchant.promotedBy && (
                              <span className="text-[10px] font-sans text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-150 font-black">
                                推荐人: {merchant.promotedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Store dynamic statistics log */}
                      <div className="flex gap-2 text-right">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-zinc-500 font-bold tracking-wider">可用店铺余额</span>
                           <span className="text-sm font-black text-zinc-900 font-mono">
                             ${(merchant.balance || 0).toLocaleString()}
                           </span>
                        </div>
                        <div className="w-px h-7 bg-zinc-200 mx-1.5 self-center"></div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-[#e51923] font-bold tracking-wider">商定累计利润</span>
                           <span className="text-sm font-black text-[#e51923] font-mono">
                             ${itemProfits.toLocaleString()}
                           </span>
                        </div>
                        <div className="w-px h-7 bg-zinc-200 mx-1.5 self-center"></div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-zinc-500 font-bold tracking-wider">订单统计 (待/发/完)</span>
                           <span className="text-xs font-extrabold text-zinc-900 font-mono mt-0.5">
                             {(merchant.orders || []).filter((o: any) => o.status === 'pending' && !o.isSelfOrder).length} / {(merchant.orders || []).filter((o: any) => o.status === 'shipped' && !o.isSelfOrder).length} / {completedOrders.length}
                           </span>
                        </div>
                      </div>
                    </div>

                    {/* Shop settings or profile */}
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <img 
                          src={resolveAvatar(merchant.shop?.avatar || DEFAULT_SHOP.avatar)} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover border border-zinc-300" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23fff5f5"/><circle cx="50" cy="40" r="18" fill="%23e51923" fill-opacity="0.85"/><path d="M22 78C22 62.536 34.536 50 50 50C65.464 50 78 62.536 78 78" stroke="%23e51923" stroke-width="8" stroke-linecap="round"/></svg>`;
                          }}
                        />
                        <span className="text-xs text-zinc-650 font-bold font-sans">
                          美学商店名称: <span className="text-zinc-900 font-black">{merchant.shop?.name || `${merchant.name}精品店`}</span>
                        </span>
                      </div>
                      
                      {!isEditing ? (
                        deletingMerchantKey === key ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                            <span className="text-[10px] text-rose-700 font-bold">
                              确定要彻底删除该店吗？（此操作不可恢复，将同步清空其账务及历史订单）
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteMerchantClick(key)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm"
                            >
                              确认删除
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingMerchantKey(null)}
                              className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMerchantKey(key);
                                setEditPasswordInput(merchant.password || '');
                                setEditBalanceInput(String(merchant.balance || 0));
                                setEditPromotedBy(merchant.promotedBy || '');
                                setEditRole(merchant.isAdmin ? 'admin' : (merchant.isSalesman ? 'salesman' : 'merchant'));
                              }}
                              className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-950 rounded-lg text-[10.5px] font-black text-zinc-750 border border-zinc-250 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>{isSalesman ? '修改账密与关联' : '修改账密与余额'}</span>
                            </button>

                            {key.toLowerCase() !== 'oopqwe001@gmail.com' && key.toLowerCase() !== 'oopqwe521@gmail.com' && key.toLowerCase() !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => setDeletingMerchantKey(key)}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-[#e51923] border border-rose-200 rounded-lg text-[10.5px] font-black transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>删除店家</span>
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold uppercase animate-pulse">正在编辑当前商户数据...</span>
                      )}
                    </div>

                    {/* Modify state expanded block */}
                    {isEditing && (
                      <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-300 flex flex-col gap-3 mt-1 text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-[#e51923] font-bold uppercase">重置登录密码 Password Change</label>
                            <input
                              type="text"
                              value={editPasswordInput}
                              onChange={(e) => setEditPasswordInput(e.target.value)}
                              placeholder="设置该店家新安全登录密码"
                              className="w-full text-xs bg-white border border-zinc-300 rounded-lg p-2.5 text-zinc-800 font-mono focus:outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-[#e51923] font-bold uppercase flex items-center gap-1.5">
                              调整可用账户余额 Set Balance (USD)
                              {isSalesman && <span className="text-[8px] font-black text-red-600 bg-red-50 border border-red-200 px-1 py-0.5 rounded leading-none">业务员无权修改金额</span>}
                            </label>
                            <input
                              type="text"
                              value={isSalesman ? `$${(merchant.balance || 0).toLocaleString()} (仅限总后台管理员修改)` : editBalanceInput}
                              onChange={(e) => {
                                if (!isSalesman) {
                                  setEditBalanceInput(e.target.value);
                                }
                              }}
                              disabled={isSalesman}
                              placeholder="调整或直接划转该店入可用余额"
                              className={`w-full text-xs font-mono font-bold border rounded-lg p-2.5 focus:outline-none ${
                                isSalesman 
                                  ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed select-none' 
                                  : 'bg-white border-zinc-300 text-zinc-800 focus:border-red-500'
                              }`}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-[10px] text-zinc-600 font-bold uppercase flex items-center justify-between">
                              <span>关联推荐业务员 Promoted By (修改后将该店重新推荐归属给该业务员)</span>
                              <span className="text-[9px] text-[#e51923] font-sans lowercase">直接输入或从下方快捷选择切换</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editPromotedBy}
                                onChange={(e) => setEditPromotedBy(e.target.value)}
                                placeholder="输入下属加盟店家的业务员账号（如 ches003 或 业务账号邮箱，留空表示无推荐人）"
                                className="flex-1 text-xs bg-white border border-zinc-300 rounded-lg p-2.5 text-zinc-800 font-mono focus:outline-none focus:border-red-500"
                              />
                              {editPromotedBy && (
                                <button
                                  type="button"
                                  onClick={() => setEditPromotedBy('')}
                                  className="px-3 bg-zinc-200 text-zinc-650 hover:bg-zinc-300 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
                                >
                                  清除绑定 (设为无)
                                </button>
                              )}
                            </div>

                            {/* Beautiful list of active/candidate salesmen with store metrics */}
                            {allSalesmen.length > 0 && (
                              <div className="mt-1 bg-zinc-100 p-2.5 rounded-xl border border-zinc-200">
                                <span className="text-[9px] text-zinc-505 font-bold uppercase block mb-1.5">点击直接分配给现有业务员:</span>
                                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                                  {allSalesmen.map((salName) => {
                                    const count = promoterStoreCounts[salName.toLowerCase()] || 0;
                                    const isSelected = editPromotedBy.trim().toLowerCase() === salName.toLowerCase();
                                    return (
                                      <button
                                        key={salName}
                                        type="button"
                                        onClick={() => setEditPromotedBy(salName)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                          isSelected 
                                            ? 'bg-emerald-600 text-white shadow-sm scale-[1.02] border-transparent' 
                                            : 'bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:border-emerald-200'
                                        }`}
                                      >
                                        <User className="w-3 h-3 shrink-0" />
                                        <span className="font-mono">{salName}</span>
                                        <span className={`text-[9px] font-sans font-bold px-1 rounded-md ${isSelected ? 'bg-emerald-800/65 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                          {count}店
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                           {!isSalesman && (
                             <div className="flex flex-col gap-1.5 sm:col-span-2">
                               <label className="text-[10px] text-zinc-600 font-extrabold uppercase">设置账户角色 Mode / Role Designation</label>
                               <div className="grid grid-cols-3 gap-2 mt-0.5">
                                 <button
                                   type="button"
                                   onClick={() => setEditRole('merchant')}
                                   className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                     editRole === 'merchant'
                                       ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm font-sans'
                                       : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-sans'
                                   }`}
                                 >
                                   普通健康商家 (Merchant)
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setEditRole('salesman')}
                                   className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                     editRole === 'salesman'
                                       ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm font-sans'
                                       : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-sans'
                                   }`}
                                 >
                                   业务推广拉新员 (Salesman)
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setEditRole('admin')}
                                   className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                     editRole === 'admin'
                                       ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm font-sans'
                                       : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-sans'
                                   }`}
                                 >
                                   协同超级管理员 (Admin)
                                 </button>
                               </div>
                             </div>
                           )}
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setEditingMerchantKey(null)}
                            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-250 text-zinc-700 font-bold rounded-xl text-xs cursor-pointer"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveMerchantEdits(key)}
                            className="px-5 py-2 bg-red-650 hover:bg-red-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
                          >
                            保存修改并重新清算
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredMerchantKeys.length === 0 && (
                <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl text-zinc-500 font-medium font-sans">
                  未找到任何匹配该搜索条件下的注册店家信息。
                </div>
              )}
            </div>
          </div>
        )}


        {activeTab === 'dispatch' && (
          <div className="flex flex-col gap-4 text-left">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                <Plus className="w-4 h-4 text-[#e51923]" />
                <span className="text-xs font-bold text-zinc-850 uppercase tracking-wider">
                  中央产品库快捷派单配额系统 (BATCH DISPATCHER)
                </span>
              </div>

              <form onSubmit={handleDispatchOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">1. 选择接受订单的目标店家 Target Merchant</label>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={dispatchMerchantSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDispatchMerchantSearch(val);
                            // Auto select if unique match
                            const matchedKeys = merchantKeys.filter(key => {
                              const m = merchantsDb[key];
                              if (!m) return false;
                              const q = val.toLowerCase().trim();
                              if (!q) return false;
                              return (m.id || '') === q || (m.id || '').includes(q) || (m.name || '').toLowerCase().includes(q) || (m.shop?.name || '').toLowerCase().includes(q);
                            });
                            if (matchedKeys.length === 1) {
                              setSelectedMerchant(matchedKeys[0]);
                            }
                          }}
                          placeholder="🔍 输入店家ID / 邮箱 / 商家名快速检索并锁定..."
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-12 py-2.5 text-zinc-900 font-medium focus:outline-none focus:border-[#e51923] focus:bg-white placeholder-zinc-400 transition-colors"
                        />
                        {dispatchMerchantSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setDispatchMerchantSearch('');
                              setSelectedMerchant('');
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            清除
                          </button>
                        )}
                      </div>
                      <select
                        value={selectedMerchant}
                        onChange={(e) => setSelectedMerchant(e.target.value)}
                        className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-[#e51923] cursor-pointer"
                      >
                        <option value="" className="text-zinc-550">
                          {dispatchMerchantSearch ? `-- 满足检索匹配的店家选项 (${
                            merchantKeys.filter(key => {
                              const m = merchantsDb[key];
                              if (!m) return false;
                              const q = dispatchMerchantSearch.toLowerCase();
                              return (m.id || '').includes(q) || (m.name || '').toLowerCase().includes(q) || (m.shop?.name || '').toLowerCase().includes(q);
                            }).length
                          }家) --` : '-- 选择目标宿主店家 --'}
                        </option>
                        {merchantKeys
                          .filter(key => {
                            if (!dispatchMerchantSearch) return true;
                            const m = merchantsDb[key];
                            if (!m) return false;
                            const q = dispatchMerchantSearch.toLowerCase();
                            const matchId = (m.id || '').includes(q);
                            const matchEmail = (m.name || '').toLowerCase().includes(q);
                            const matchShop = (m.shop?.name || '').toLowerCase().includes(q);
                            return matchId || matchEmail || matchShop;
                          })
                          .map(key => {
                            const m = merchantsDb[key];
                            if (!m) return null;
                            return (
                              <option key={key} value={key} className="text-zinc-900 font-medium font-mono">
                                {m.shop?.name || m.name} (店主: {m.name} | ID: {m.id || 'N/A'})
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span>2. 客户/买家收货人信息 Consignee</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value={randomCountry}
                          onChange={(e) => setRandomCountry(e.target.value)}
                          className="bg-zinc-100 border border-zinc-250 rounded px-2 py-0.5 text-[9px] text-zinc-700 focus:outline-none cursor-pointer h-6 font-semibold"
                        >
                          <option value="random">🌏 随机海外国家 (除中国) </option>
                          <option value="japan">🇯🇵 日本 (Japan)</option>
                          <option value="korea">🇰🇷 韩国 (South Korea)</option>
                          <option value="usa">🇺🇸 美国 (USA)</option>
                          <option value="uk">🇬🇧 英国 (UK)</option>
                          <option value="singapore">🇸🇬 新加坡 (Singapore)</option>
                          <option value="malaysia">🇲🇾 马来西亚 (Malaysia)</option>
                          <option value="australia">🇦🇺 澳大利亚 (Australia)</option>
                          <option value="canada">🇨🇦 加拿大 (Canada)</option>
                          <option value="germany">🇩🇪 德国 (Germany)</option>
                          <option value="uae">🇦🇪 阿联酋/迪拜 (UAE)</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleRandomizeRecipient}
                          className="text-[9px] bg-[#e51923] hover:bg-red-700 text-white font-black px-2.5 py-0.5 rounded-lg cursor-pointer uppercase tracking-tight transition-colors h-6 flex items-center justify-center shadow-sm whitespace-nowrap"
                        >
                          ⚡ 自动极速生成
                        </button>
                      </div>
                    </label>
                    
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="收货人姓名 (e.g. 山本 拓也)"
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all font-medium"
                        />
                        <input
                          type="text"
                          placeholder="联系电话 (e.g. 090-4821-3951)"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 font-mono focus:outline-none focus:bg-white focus:border-red-500 transition-all font-semibold"
                        />
                      </div>
                      <input
                          type="text"
                          placeholder="详细寄送地址 (e.g. 東京都新宿区西新宿...)"
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">3. 派单商品配额数量 Quantity</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={dispatchQty}
                        onChange={(e) => setDispatchQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center text-zinc-900 font-bold font-mono focus:outline-none focus:bg-white focus:border-red-500 transition-all"
                      />
                      <span className="text-[10.5px] text-zinc-500 font-semibold font-sans">件（该笔件数决定分润提成指数）</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 flex flex-col justify-between">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">4. 拟定签包资产清单 Presumed Asset Invoice</span>
                    {selectedProduct ? (
                      <div className="flex gap-2.5 bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                        <img src={selectedProduct.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-100" referrerPolicy="no-referrer" />
                        <div className="flex flex-col justify-between flex-1">
                          <span className="text-xs font-black text-zinc-900 line-clamp-1">{selectedProduct.name}</span>
                          <span className="text-[8px] font-mono bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded mr-auto leading-none text-left">{selectedProduct.sku}</span>
                          <div className="flex items-center justify-between text-[11px] font-mono mt-0.5">
                            <span className="text-zinc-550">进价: ${selectedProduct.costPrice.toLocaleString()}</span>
                            <span className="text-zinc-550">售价: ${selectedProduct.retailPrice.toLocaleString()}</span>
                            <span className="text-[#e51923] font-bold">单件利润: ${selectedProduct.profit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-zinc-300 rounded-lg text-zinc-400 font-medium text-xs">
                        当前尚未从下方“全局商品库”中选取宝贝商品
                      </div>
                    )}

                    <div className="border-t border-zinc-200 pt-3 flex flex-col gap-1 text-[11.5px] text-zinc-650 font-medium font-sans">
                      <div className="flex justify-between items-center">
                        <span>首付代扣成本 (店家垫付):</span>
                        <span className="font-mono text-zinc-900 font-bold">${((selectedProduct?.costPrice || 0) * dispatchQty).toLocaleString()} USD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>客户最终清算结算价 (GMV):</span>
                        <span className="font-mono text-zinc-900 font-bold">${((selectedProduct?.retailPrice || 0) * dispatchQty).toLocaleString()} USD</span>
                      </div>
                      <div className="flex justify-between items-center text-[#e51923]">
                        <span>店家完成结算后到账纯利润:</span>
                        <span className="font-mono font-black text-sm text-[#e51923]">${((selectedProduct?.profit || 0) * dispatchQty).toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedMerchant || !selectedProduct}
                    className={`w-full py-3 text-xs font-black rounded-xl tracking-wider uppercase shadow-md transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedMerchant && selectedProduct
                        ? 'bg-red-650 hover:bg-red-700 text-white'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>派发本张订单至商家中控核决 (DISPATCH INVOICE)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* PRODUCT SELECTOR UNDER GRID */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-zinc-200">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#e51923]" />
                  <span>中央产品库选品橱窗 (点击一件选入派单项)</span>
                </span>
                
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Price Sort Selector dropdown */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-zinc-400 font-semibold hidden lg:inline">排序:</span>
                    <select
                      value={priceSortOrder}
                      onChange={(e) => {
                        setPriceSortOrder(e.target.value as 'default' | 'asc' | 'desc');
                        setVisibleProductsCount(40);
                      }}
                      className="bg-zinc-50 border border-zinc-200 rounded-lg text-[10.5px] py-1 px-2.5 text-zinc-900 focus:outline-none focus:border-red-500 cursor-pointer h-7"
                    >
                      <option value="default">↕️ 商品默认排序</option>
                      <option value="asc">💵 成本价：由低到高 ↑</option>
                      <option value="desc">💵 成本价：由高到低 ↓</option>
                    </select>
                  </div>

                  {/* Search input field */}
                  <input
                    type="text"
                    placeholder="检索产品库商品名称/ID..."
                    value={dispatchSearchQuery}
                    onChange={(e) => {
                      setDispatchSearchQuery(e.target.value);
                      setVisibleProductsCount(40);
                    }}
                    className="bg-zinc-50 border border-zinc-200 rounded-lg text-[10.5px] py-1 px-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-500 w-full md:w-44 h-7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {filteredProducts.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 py-8 text-center flex flex-col items-center justify-center gap-1.5 text-zinc-400 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-6">
                    <ShoppingBag className="w-8 h-8 text-zinc-300 stroke-1" />
                    {!selectedMerchant ? (
                      <p className="text-xs text-zinc-500 font-semibold">⚠️ 请先在上方<strong>第 1 步</strong>中选择目标备货店家以加载其选品列表</p>
                    ) : (
                      <div className="flex flex-col gap-1 items-center">
                        <p className="text-xs text-zinc-500 font-semibold">该店家尚未上架/同步任何商品</p>
                        <p className="text-[10px] text-zinc-400">目前无法向其进行配额划拨或订单派发。需店家在其控制台添加商品上架后，方可派单。</p>
                      </div>
                    )}
                  </div>
                )}
                {filteredProducts.slice(0, visibleProductsCount).map(p => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-2.5 hover:border-zinc-300 ${
                        isSelected 
                          ? 'bg-red-50 border-red-500/70 shadow-sm' 
                          : 'bg-zinc-50/50 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover border border-zinc-150" referrerPolicy="no-referrer" />
                      <div className="flex flex-col justify-between flex-1 text-left">
                        <span className="text-xs font-bold text-zinc-900 line-clamp-1">{p.name}</span>
                        <span className="text-[9px] font-mono bg-zinc-200 text-zinc-650 px-1.5 py-0.5 rounded mr-auto leading-none">{p.sku}</span>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 mt-1">
                          <span>成本价: ${p.costPrice.toLocaleString()}</span>
                          <span className="text-emerald-600 font-bold">利润: ${p.profit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredProducts.length > visibleProductsCount && (
                  <div className="col-span-1 sm:col-span-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleProductsCount(prev => prev + 40)}
                      className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>加载更多商品 (已显示 {Math.min(visibleProductsCount, filteredProducts.length)} / 共 {filteredProducts.length} 个)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: ORDER ACTION & SETTLEMENT */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 bg-zinc-100 p-3 rounded-2xl border border-zinc-200">
              <Clipboard className="w-4 h-4 text-[#e51923]" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                全系统商户派发订单履约监控 (DELIVERY SETTLEMENT CENTER)
              </span>
            </div>

            {/* Merchant order filter selector */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <Users className="w-4 h-4 text-[#e51923]" />
                    <span className="text-xs font-bold text-zinc-650">
                      按宿主店家筛查订单:
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={orderMerchantSearch}
                        onChange={(e) => setorderMerchantSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearchMerchantOrders();
                        }}
                        placeholder="输入店家ID / 邮箱 / 店铺名称..."
                        className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-12 py-2.5 text-zinc-900 font-medium focus:outline-none focus:bg-white focus:border-red-500 placeholder-zinc-400 transition-colors"
                      />
                      {orderMerchantSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setorderMerchantSearch('');
                            setOrderMerchantFilter('');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          清除
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchMerchantOrders}
                      className="px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shrink-0 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <span>检索店家</span>
                    </button>
                  </div>
                </div>

                <div className="w-full sm:w-80 shrink-0">
                  <select
                    value={orderMerchantFilter}
                    onChange={(e) => setOrderMerchantFilter(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-medium focus:outline-none focus:bg-white focus:border-red-500 cursor-pointer"
                  >
                    <option value="" className="bg-white text-zinc-500">
                      {orderMerchantSearch ? `-- 满意检索结果店家选项 (${merchantKeys.filter(k => {
                        const m = merchantsDb[k];
                        if (!m) return false;
                        const q = orderMerchantSearch.toLowerCase();
                        return (m.id || '').includes(q) || (m.name || '').toLowerCase().includes(q) || (m.shop?.name || '').toLowerCase().includes(q);
                      }).length}家) --` : `-- 显示全系统所有店家订单 --`}
                    </option>
                    {merchantKeys
                      .filter(key => {
                        if (!orderMerchantSearch) return true;
                        const m = merchantsDb[key];
                        if (!m) return false;
                        const q = orderMerchantSearch.toLowerCase();
                        const matchId = (m.id || '').includes(q);
                        const matchEmail = (m.name || '').toLowerCase().includes(q);
                        const matchShop = (m.shop?.name || '').toLowerCase().includes(q);
                        return matchId || matchEmail || matchShop;
                      })
                      .map(key => {
                        const m = merchantsDb[key];
                        if (!m) return null;
                        const ordersCount = (m.orders || []).length;
                        return (
                          <option key={key} value={key} className="bg-white text-zinc-900 font-medium">
                            {m.shop?.name || m.name} (店主: {m.name} | ID: {m.id || 'N/A'} | 共 {ordersCount} 个订单)
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Status Tabs buttons - View all, Pending, Shipped, Completed */}
              {(() => {
                const baseOrders = orderMerchantFilter 
                  ? allGlobalOrders.filter(o => o.merchantKey === orderMerchantFilter)
                  : orderMerchantSearch 
                    ? allGlobalOrders.filter(item => {
                        const m = merchantsDb[item.merchantKey];
                        if (!m) return false;
                        const q = orderMerchantSearch.toLowerCase();
                        return (m.id || '').includes(q) || (m.name || '').toLowerCase().includes(q) || (m.shop?.name || '').toLowerCase().includes(q);
                      })
                    : allGlobalOrders;

                const countAll = baseOrders.length;
                const countPending = baseOrders.filter(o => o.order.status === 'pending').length;
                const countShipped = baseOrders.filter(o => o.order.status === 'shipped').length;
                const countCompleted = baseOrders.filter(o => o.order.status === 'completed').length;

                return (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('all')}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        orderStatusFilter === 'all'
                          ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      <span>全部订单</span>
                      <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-700 font-mono text-[9px] rounded-md font-extrabold">{countAll}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('pending')}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        orderStatusFilter === 'pending'
                          ? 'bg-red-50 text-[#e51923] border border-red-200 shadow-xs'
                          : 'bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e51923]"></span>
                      <span>未发货</span>
                      <span className="px-1.5 py-0.2 bg-red-100 text-[#e51923] font-mono text-[9px] rounded-md font-extrabold">{countPending}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('shipped')}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        orderStatusFilter === 'shipped'
                          ? 'bg-sky-50 text-sky-650 border border-sky-200 shadow-xs'
                          : 'bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span>已发货</span>
                      <span className="px-1.5 py-0.2 bg-sky-100 text-sky-600 font-mono text-[9px] rounded-md font-extrabold">{countShipped}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('completed')}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        orderStatusFilter === 'completed'
                          ? 'bg-emerald-50 text-emerald-650 border border-emerald-200 shadow-xs'
                          : 'bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>已完成</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-600 font-mono text-[9px] rounded-md font-extrabold">{countCompleted}</span>
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col gap-3">
              {(() => {
                let filteredOrders = allGlobalOrders;

                if (orderMerchantFilter) {
                  filteredOrders = filteredOrders.filter(item => item.merchantKey === orderMerchantFilter);
                } else if (orderMerchantSearch) {
                  const q = orderMerchantSearch.toLowerCase();
                  filteredOrders = filteredOrders.filter(item => {
                    const m = merchantsDb[item.merchantKey];
                    if (!m) return false;
                    const matchId = (m.id || '').includes(q);
                    const matchEmail = (m.name || '').toLowerCase().includes(q);
                    const matchShop = (m.shop?.name || '').toLowerCase().includes(q);
                    return matchId || matchEmail || matchShop;
                  });
                }

                // Apply dynamic status tabs
                if (orderStatusFilter !== 'all') {
                  filteredOrders = filteredOrders.filter(item => item.order.status === orderStatusFilter);
                }

                if (filteredOrders.length === 0) {
                  return (
                    <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 font-medium font-sans">
                      {orderMerchantFilter || orderMerchantSearch || orderStatusFilter !== 'all' 
                        ? '在这个检索与筛选分类下，暂无满足条件的派发订单数据。' 
                        : '系统暂无派发给店家的订单记录。'}
                    </div>
                  );
                }

                return filteredOrders.map(({ merchantKey, merchantName, order, promotedBy }, idx) => {
                  const item = order.items[0];
                  if (!item) return null;

                  return (
                    <div 
                      key={`${merchantKey}-${order.id}-${idx}`}
                      className="bg-white border border-zinc-200 p-4 rounded-2xl hover:border-zinc-300 transition-colors flex flex-col gap-3 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-805 font-mono select-all">
                            订单号: {order.id}
                          </span>
                          <span className="text-[9.5px] bg-zinc-100 text-zinc-600 font-bold px-2 py-0.5 rounded border border-zinc-200">
                            所属店家: {merchantName}
                          </span>
                          <span className="text-[9.5px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-150">
                            推广业务员: {promotedBy || '无(直属系统)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-500 font-semibold block">
                            派单时间: {order.orderDate}
                          </span>
                          {order.status !== 'pending' && (
                            <span className="text-[10.5px] font-mono text-indigo-600 font-extrabold flex items-center justify-end gap-1 mt-0.5">
                              🚚 已发货时间: {order.shippedAt || `${order.orderDate.split(' ')[0] || '2026-05-30'} 15:42:19`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <img src={getProductImage(item.productId, item.image)} alt="" className="w-14 h-14 rounded-lg object-cover border border-zinc-200" referrerPolicy="no-referrer" />
                        <div className="flex flex-col justify-between flex-1">
                          <span className="text-xs font-bold text-zinc-900 line-clamp-1">{item.productName}</span>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[9.5px] bg-zinc-100 text-zinc-600 font-mono px-1.5 py-0.5 rounded leading-none mr-auto border border-zinc-200">
                              SKU/ID: {item.productId}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-650 font-bold">
                              派送规格: {item.retailPrice.toLocaleString()}円 * {item.quantity}件 (提佣: {order.totalProfit.toLocaleString()}円)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div className="bg-zinc-50/70 p-3 rounded-xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-zinc-600 truncate">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>收件姓名: <strong className="text-zinc-850 font-bold select-all">{order.customerName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-600 truncate">
                          <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>联系电话: <strong className="text-zinc-850 font-bold font-mono select-all">{order.customerPhone}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-600 truncate sm:col-span-3">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>收货地址: <strong className="text-zinc-850 font-bold select-all">{order.shippingAddress}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-150 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">履约状态：</span>
                          {order.status === 'pending' && (
                            <span className="text-[9.5px] bg-red-50 border border-red-200 text-[#e51923] font-black px-2 py-0.5 rounded-full uppercase">
                              🕥 店家配额备货中
                            </span>
                          )}
                          {order.status === 'shipped' && (
                            <span className="text-[9.5px] bg-sky-50 border border-sky-200 text-sky-600 font-black px-2 py-0.5 rounded-full uppercase">
                              🚚 店家已发货 / 待收货结转
                            </span>
                          )}
                          {order.status === 'completed' && (
                            <span className="text-[9.5px] bg-emerald-50 border border-emerald-200 text-emerald-600 font-black px-2 py-0.5 rounded-full uppercase">
                              ✅ 确认签单 / 分润已到账
                            </span>
                          )}
                        </div>

                        {order.status === 'shipped' ? (
                          <button
                            onClick={() => handleDeliverConfirm(merchantKey, order.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-[0.97]"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>确认收货并交割利润</span>
                          </button>
                        ) : order.status === 'completed' ? (
                          <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            利润已结息
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-semibold tracking-wide italic hidden sm:inline">等待店家发货...</span>
                            {onShipOrder && (
                              <button
                                type="button"
                                onClick={() => {
                                  onShipOrder(order.id, merchantKey);
                                  triggerSuccess(`🚀 已成功为店家【${merchantName}】执行极速发货！`);
                                }}
                                className="px-3 py-1 bg-[#e51923] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-[0.97]"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>管理员强行帮代发货</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* PANEL 4: WITHDRAWAL APPLICATION AUDITS & ACC RECIPIENTS EDITS */}
        {activeTab === 'withdraws' && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between bg-zinc-100 p-3 rounded-2xl border border-zinc-200">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#e51923]" />
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  财务资金审计核销暨店面收支中控管理
                </span>
              </div>
              <span className="text-[9.5px] text-zinc-500 font-medium font-mono">FINANCIAL ESCROW CONSOLE</span>
            </div>

            {/* Sub-tab navigation */}
            <div className="flex gap-2 border-b border-zinc-200 pb-1">
              <button
                type="button"
                onClick={() => setFinancialSubTab('recharges')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  financialSubTab === 'recharges'
                    ? 'border-[#e51923] text-[#e51923] bg-zinc-50'
                    : 'border-transparent text-zinc-500 hover:text-white lg:hover:text-zinc-900'
                }`}
              >
                <span>店铺余额充值审核 (Recharge Audit)</span>
                {allGlobalRecharges.filter(r => r.transaction.status === '已提交').length > 0 && (
                  <span className="bg-[#e51923] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full animate-pulse font-extrabold">
                    {allGlobalRecharges.filter(r => r.transaction.status === '已提交').length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFinancialSubTab('withdraws')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  financialSubTab === 'withdraws'
                    ? 'border-[#e51923] text-[#e51923] bg-zinc-50'
                    : 'border-transparent text-zinc-500 hover:text-white lg:hover:text-zinc-900'
                }`}
              >
                <span>店铺资金提现审核 (Withdraw Audit)</span>
                {allGlobalWithdraws.filter(w => w.record.status === '已提交').length > 0 && (
                  <span className="bg-[#e51923] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full animate-pulse font-extrabold">
                    {allGlobalWithdraws.filter(w => w.record.status === '已提交').length}
                  </span>
                )}
              </button>
            </div>

            {financialSubTab === 'recharges' ? (
              <div className="flex flex-col gap-3">
                {allGlobalRecharges.length > 0 ? (
                  allGlobalRecharges.map(({ merchantKey, merchantName, transaction }) => {
                    return (
                      <div 
                        key={transaction.id}
                        className="bg-white border border-zinc-200 p-4 rounded-2xl hover:border-zinc-300 transition-colors flex flex-col gap-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 font-mono">
                              充值流水号: {transaction.id}
                            </span>
                            <span className="text-[9.5px] bg-zinc-100 text-zinc-650 font-bold px-2 py-0.5 rounded border border-zinc-200">
                              店家: {merchantName}
                            </span>
                          </div>
                          <span className="text-[10.5px] font-mono text-zinc-550 font-bold">
                            申请时间: {transaction.createdAt}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-zinc-500 font-bold">申请注资金额 amount：</span>
                            <span className="text-xl font-black text-emerald-600 font-mono">
                              +${transaction.amount.toLocaleString()} <span className="text-xs text-zinc-500">USD</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10.5px] text-zinc-500 font-bold uppercase">资金合规审核: </span>
                            {transaction.status === '已提交' ? (
                              <span className="text-[9.5px] bg-amber-50 border border-amber-200 text-amber-600 font-black px-2 py-0.5 rounded-full uppercase">
                                ⏳ 申请待核准入账
                              </span>
                            ) : transaction.status === '成功' || transaction.status === '已到账' ? (
                              <span className="text-[9.5px] bg-emerald-50 border border-emerald-250 text-emerald-650 font-black px-2 py-0.5 rounded-full uppercase">
                                ✅ 资金获准复查入账
                              </span>
                            ) : (
                              <span className="text-[9.5px] bg-red-50 border border-red-200 text-red-650 font-black px-3 py-0.5 rounded-full uppercase">
                                ❌ 已拒绝作废申请
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-[11px] text-zinc-650 text-left font-sans leading-relaxed">
                          {transaction.description}
                        </div>

                        {transaction.status === '已提交' && (
                          <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-2.5">
                            <button
                              onClick={() => handleRejectRecharge(merchantKey, transaction.id)}
                              className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-650 hover:text-zinc-900 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              拒绝并作废申请 (驳回)
                            </button>
                            <button
                              onClick={() => handleApproveRecharge(merchantKey, transaction.id)}
                              className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>批准直接注入余额</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 font-medium font-sans">
                    系统暂无充值申请记录。
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Editing Withdrawal recipient credentials Block */}
                {editingWithdrawId && (
                  <div className="bg-amber-50/55 p-4 rounded-2xl border border-amber-305 text-left flex flex-col gap-4">
                    <div className="flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                      <Edit2 className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-900">正在修改提现记录 [{editingWithdrawId}] 的结算卡信息</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-550 font-bold">银行/金融机构 Bank Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-zinc-250 rounded-lg p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                          value={editBankName}
                          onChange={(e) => setEditBankName(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-550 font-bold">支店名称 Branch Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-zinc-250 rounded-lg p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                          value={editBranchName}
                          onChange={(e) => setEditBranchName(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-550 font-bold">支店番号 Branch Number</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-zinc-250 rounded-lg p-2.5 text-xs text-zinc-900 font-mono focus:outline-none focus:border-amber-500"
                          value={editBranchNo}
                          onChange={(e) => setEditBranchNo(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] text-zinc-550 font-bold">借记解付账号 Account Number (銀行口座)</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-zinc-250 rounded-lg p-2.5 text-xs text-zinc-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                          value={editBankCard}
                          onChange={(e) => setEditBankCard(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-550 font-bold">持有人姓名 Payee Account Holder</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-zinc-250 rounded-lg p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => setEditingWithdrawId(null)}
                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-650 font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        取消修改
                      </button>
                      <button
                        onClick={handleSaveBankCardEdits}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-650 text-zinc-950 font-black rounded-xl cursor-pointer shadow-xs transition-colors"
                      >
                        保存卡并重新分配印签 (Save Bank Info)
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {allGlobalWithdraws.length > 0 ? (
                    allGlobalWithdraws.map(({ merchantKey, merchantName, record }) => {
                      return (
                        <div 
                          key={record.id}
                          className="bg-white border border-zinc-200 p-4 rounded-2xl hover:border-zinc-300 transition-colors flex flex-col gap-3 shadow-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900 font-mono">
                                提现单号: {record.id}
                              </span>
                              <span className="text-[9.5px] bg-zinc-100 text-zinc-650 font-bold px-2 py-0.5 rounded border border-zinc-200">
                                店家: {merchantName}
                              </span>
                            </div>
                            <span className="text-[10.5px] font-mono text-zinc-500 font-bold">
                              提交时间: {record.createdAt}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] text-zinc-500 font-bold">提现净值 amount：</span>
                              <span className="text-xl font-black text-zinc-900 font-mono">
                                ${record.amount.toLocaleString()} <span className="text-xs text-zinc-550">USD</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10.5px] text-zinc-550 font-bold uppercase">清算资格审计: </span>
                              {record.status === '已提交' ? (
                                <span className="text-[9.5px] bg-amber-50 border border-amber-250 text-amber-600 font-black px-2 py-0.5 rounded-full uppercase">
                                  ⏳ 待清标审计
                                </span>
                              ) : record.status === '已到账' || record.status === '成功' ? (
                                <span className="text-[9.5px] bg-emerald-50 border border-emerald-250 text-emerald-650 font-black px-2 py-0.5 rounded-full uppercase">
                                  ✅ 批准清算成功
                                </span>
                              ) : (
                                <span className="text-[9.5px] bg-red-50 border border-red-200 text-red-600 font-black px-3 py-0.5 rounded-full uppercase">
                                  ❌ 已拒绝并退还本金
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recipient Details (Account payee info) */}
                          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-zinc-650 font-sans">
                            <div className="flex flex-col gap-1 text-left">
                              <div className="flex items-center gap-1.5 font-bold text-zinc-850">
                                <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                                <span>{record.bankName}</span>
                                <span className="text-[10px] bg-zinc-200 text-zinc-650 font-mono font-bold px-1.5 py-0.2 rounded border border-zinc-300">
                                  {record.branchName} ({record.branchNo})
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-4 text-xs font-mono">
                                <span>口座番号: <strong className="text-zinc-800 select-all">{record.bankCard}</strong></span>
                                <span>名義人: <strong className="text-zinc-800 select-all">{record.fullName}</strong></span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setEditingWithdrawId(record.id);
                                setEditBankName(record.bankName);
                                setEditBranchName(record.branchName);
                                setEditBranchNo(record.branchNo);
                                setEditBankCard(record.bankCard);
                                setEditFullName(record.fullName);
                                setEditingWithdrawMerchantKey(merchantKey);
                              }}
                              className="px-3 py-1.5 bg-zinc-150 hover:bg-zinc-250 text-zinc-700 hover:text-zinc-900 rounded-lg text-[10.5px] font-black border border-zinc-300 transition-colors cursor-pointer mr-auto sm:mr-0 shrink-0 flex items-center gap-1 shadow-xs"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>修改银行分配</span>
                            </button>
                          </div>

                          {record.status === '已提交' && (
                            <div className="flex items-center justify-end gap-2 border-t border-zinc-155 pt-2.5 border-dashed">
                              <button
                                onClick={() => handleRejectWithdrawal(merchantKey, record.id)}
                                className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-red-500 hover:text-red-650 font-bold text-xs rounded-xl cursor-pointer"
                              >
                                拒绝提现 (驳回)
                              </button>
                              <button
                                onClick={() => handleApproveWithdrawal(merchantKey, record.id)}
                                className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>批准并自动划转结算</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 font-medium font-sans">
                      系统暂无提现清算历史记录。
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="flex flex-col gap-4 text-left font-sans animate-fade-in">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#e51923]" />
                  <span className="text-xs font-bold text-zinc-850 uppercase tracking-wider">
                    公共商品主图手动上传维护中控柜 (MANUAL COVER ART MANAGER)
                  </span>
                </div>
                <div className="text-[10.5px] text-zinc-500 font-semibold bg-zinc-100 px-3 py-1 rounded-xl border border-zinc-200 font-mono">
                  共计 {ALL_PRODUCTS.length} 款商品 | 自定义主图: {Object.keys(customProductImages || {}).length} 款
                </div>
              </div>

              {/* Informational banner */}
              <div className="bg-blue-50/75 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 leading-relaxed font-sans">
                  <span className="font-extrabold text-[12px]">ℹ️ 运行原理 & 温馨提示</span>
                  <span>在此处手动上传图片，新图会被直接连协合并存入云端数据库系统配置。全网商铺的上架展示界面、店铺详情页、购物车、派单列表都会在一秒内即时呈现新图，不影响原本任何系统固有属性！</span>
                </div>
              </div>

              {/* Advanced Efficiency: Batch Cover Art Auto-Replacing Helper */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <div className="flex flex-col gap-1 text-left flex-1">
                  <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    🚀 极速效率：按商品分类批量一键【顺序配图】助手
                  </span>
                  <span className="text-[10.5px] text-zinc-500 leading-relaxed">
                    如果您已准备好了一组（如10张或100张）精美图片，希望一次性自动顺序更新某个分类（如“臻选腕表”）的所有商品，只需在此开启控制台，按本地文件顺序一一对应更新！
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchUploadPanel(!showBatchUploadPanel);
                    setUploadedBatchFiles([]);
                    setBatchErrorMessage(null);
                  }}
                  className={`text-[11px] font-black px-4 py-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
                    showBatchUploadPanel
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                      : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white shadow-xs font-sans'
                  }`}
                >
                  {showBatchUploadPanel ? '✕ 关闭批量配图' : '⚡ 开启批量配图工作台'}
                </button>
              </div>

              {showBatchUploadPanel && (
                <div className="bg-emerald-50/30 border border-emerald-200 p-5 rounded-2xl flex flex-col gap-4 text-left animate-fade-in">
                  <div className="border-b border-emerald-200/80 pb-2.5 flex justify-between items-center">
                    <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wide">
                      📂 类目商品顺序配图工作台 (BATCH CATEGORY PRODUCT GRAPHICS WORKSTATION)
                    </span>
                    <span className="text-[9px] text-emerald-700 font-mono font-black bg-emerald-100 px-2 py-0.5 rounded-md">
                      STATUS: ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    {/* Step 1 & 2: Controls details */}
                    <div className="flex flex-col gap-3.5 bg-white p-4 rounded-xl border border-emerald-100 shadow-3xs">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">
                          第 1 步：挑选目标商品类目
                        </label>
                        <select
                          value={batchTargetCategory}
                          onChange={(e) => {
                            setBatchTargetCategory(e.target.value);
                            setUploadedBatchFiles([]);
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-800 cursor-pointer focus:outline-none focus:border-emerald-600 focus:bg-white font-sans font-bold"
                        >
                          {['臻选腕表', '化妆品', '高级珠宝', '匠心皮具', '大师器物', '香水', '家用电器', '情趣用品'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <span className="text-[10px] text-zinc-400 mt-1 block font-semibold">
                          该分类下系统现有可配图商品数: <strong className="text-emerald-600 font-bold">{ALL_PRODUCTS.filter(p => p.category === batchTargetCategory).length}</strong> 款
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">
                          第 2 步：选择或拖拽本地图片
                        </label>
                        <div className="relative border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl p-5 text-center bg-emerald-50/15 hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={async (e) => {
                              if (!e.target.files) return;
                              setBatchErrorMessage(null);
                              const filesArray = Array.from(e.target.files);
                              if (filesArray.length === 0) return;
                              
                              const limitFiles = filesArray.slice(0, 230);
                              const loaded: { id: string; name: string; base64: string }[] = [];
                              
                              for (let i = 0; i < limitFiles.length; i++) {
                                const file = limitFiles[i] as any;
                                if (!file.type.startsWith('image/')) continue;
                                if (file.size > 2200000) {
                                  setBatchErrorMessage(`图片「${file.name}」超过 2.2MB 限制，已被忽略`);
                                  continue;
                                }
                                
                                const base64 = await new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (re) => resolve(re.target?.result as string);
                                  reader.readAsDataURL(file);
                                });
                                loaded.push({
                                  id: `file-${i}-${Date.now()}`,
                                  name: file.name,
                                  base64
                                });
                              }
                              
                              // Sort filenames naturally to align sequential indices cleanly
                              loaded.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
                              setUploadedBatchFiles(loaded);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Plus className="w-5 h-5 text-emerald-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-black text-emerald-950 block">点击本区域 或 将多张图片批量拖拽到此处</span>
                          <span className="text-[10px] text-zinc-400 block mt-1">支持 PNG, JPG, JPEG, WEBP | 一次最高更新 230 款</span>
                        </div>
                      </div>

                      {batchErrorMessage && (
                        <div className="text-[10.5px] text-red-650 bg-red-50 border border-red-150 p-2 rounded-lg font-bold">
                          ⚠️ {batchErrorMessage}
                        </div>
                      )}

                      {uploadedBatchFiles.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setUploadedBatchFiles([])}
                            className="flex-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-650 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            清空重选
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setIsProcessingBatch(true);
                                const categoryProducts = ALL_PRODUCTS.filter(p => p.category === batchTargetCategory);
                                const currentOverrides = { ...(customProductImages || {}) };
                                
                                const updateCount = Math.min(uploadedBatchFiles.length, categoryProducts.length);
                                for (let i = 0; i < updateCount; i++) {
                                  const targetP = categoryProducts[i];
                                  const imageStr = uploadedBatchFiles[i].base64;
                                  currentOverrides[targetP.id] = imageStr;
                                }

                                onUpdateMerchantData('system_config', {
                                  customProductImages: currentOverrides
                                });

                                setActionSuccessMessage(`🎉 批量顺序配图大功告成！已对「${batchTargetCategory}」里的 ${updateCount} 款商品大图进行了顺序更新替换！`);
                                setMessageType('success');
                                setUploadedBatchFiles([]);
                                setShowBatchUploadPanel(false);
                                setTimeout(() => setActionSuccessMessage(null), 5000);
                              } catch (err: any) {
                                setBatchErrorMessage(err.message || '批量上传失败，请重新试一下');
                              } finally {
                                setIsProcessingBatch(false);
                              }
                            }}
                            disabled={isProcessingBatch}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-900/10 transition-colors flex items-center justify-center gap-1.5"
                          >
                            {isProcessingBatch ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                正在顺序写入云端...
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                确认顺序更新 {Math.min(uploadedBatchFiles.length, ALL_PRODUCTS.filter(p => p.category === batchTargetCategory).length)} 款大图
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Predictive Matching Visualizer */}
                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex flex-col gap-2.5">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                        第 3 步：一合一顺序替换预览 (PREDICTIVE SEQUENTIAL ALIGNMENT)
                      </span>
                      
                      {uploadedBatchFiles.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-400 gap-1.5 border border-dashed border-zinc-250 rounded-xl min-h-[160px]">
                          <ShoppingBag className="w-7 h-7 text-zinc-300 stroke-1" />
                          <span className="text-[11px] font-bold">请选好分类，然后在左边上传本地配图文件组</span>
                          <span className="text-[10px] text-zinc-400 text-center max-w-[200px]">
                            系统将自动为您呈现 📄本地图片文件名 与 📦商品目录 的【1对1从上到下顺序对准关系】。
                          </span>
                        </div>
                      ) : (
                        (() => {
                          const categoryProducts = ALL_PRODUCTS.filter(p => p.category === batchTargetCategory);
                          const limitMatches = Math.max(uploadedBatchFiles.length, categoryProducts.length);
                          
                          return (
                            <div className="flex flex-col gap-2 flex-1 max-h-[220px] overflow-y-auto pr-1">
                              <div className="bg-emerald-100/50 text-emerald-800 p-2.5 rounded-lg text-[10px] font-bold leading-relaxed border border-emerald-250">
                                📊 本次已解析了 <strong>{uploadedBatchFiles.length}</strong> 张图片，该分类系统内共 <strong>{categoryProducts.length}</strong> 款。<br />
                                顺序规则：按文件名升序一一匹配对应。
                              </div>
                              
                              <div className="flex flex-col gap-1.5 divide-y divide-zinc-200">
                                {categoryProducts.slice(0, Math.max(uploadedBatchFiles.length, 10)).map((p, idx) => {
                                  const matchingFile = uploadedBatchFiles[idx];
                                  return (
                                    <div key={p.id} className="flex items-center gap-2 pt-1.5 text-left text-[11px]">
                                      <span className="font-mono text-[9px] text-zinc-500 bg-zinc-200 p-1 w-5 h-5 rounded-full flex items-center justify-center font-black">
                                        {idx + 1}
                                      </span>
                                      
                                      {/* Product Details */}
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border border-zinc-200 shrink-0" referrerPolicy="no-referrer" />
                                        <div className="min-w-0 flex-1">
                                          <div className="font-black text-zinc-850 truncate text-[11px]">{p.name}</div>
                                          <div className="text-[9px] text-zinc-400 font-mono">{p.id}</div>
                                        </div>
                                      </div>

                                      {/* Arrow */}
                                      <ArrowLeftRight className="w-3 h-3 text-emerald-600 shrink-0" />

                                      {/* Target File */}
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0 bg-emerald-50/40 p-1 rounded border border-emerald-100">
                                        {matchingFile ? (
                                          <>
                                            <img src={matchingFile.base64} alt="" className="w-8 h-8 rounded object-cover shrink-0 border border-emerald-100" />
                                            <div className="min-w-0 flex-1">
                                              <span className="font-bold text-emerald-950 truncate block text-[9.5px]">{matchingFile.name}</span>
                                              <span className="text-[8px] text-emerald-600 font-black block uppercase tracking-wider">配此图</span>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="text-[10px] text-zinc-400 font-bold pl-1 italic">
                                            不更新
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {categoryProducts.length > 10 && uploadedBatchFiles.length <= 10 && (
                                  <div className="text-center text-[10px] text-zinc-400 pt-2 font-bold">
                                    还有 {categoryProducts.length - 10} 款商品将保持未更新默认状态。
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Workspace splitter */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
                {/* Left Side: Product Picker */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={productsSearchQuery}
                        onChange={(e) => setProductsSearchQuery(e.target.value)}
                        placeholder="🔍 搜索商品ID、SKU、品名..."
                        className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2.5 text-zinc-900 focus:outline-none focus:border-[#e51923] focus:bg-white placeholder-zinc-400 font-sans transition-all"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <select
                      value={productsCategoryFilter}
                      onChange={(e) => setProductsCategoryFilter(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl text-xs py-2 px-3 text-zinc-900 focus:outline-none focus:border-[#e51923] cursor-pointer font-sans"
                    >
                      {['全部', '臻选腕表', '化妆品', '高级珠宝', '匠心皮具', '大师器物', '香水', '家用电器', '情趣用品'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Scroll List container */}
                  <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/10 max-h-[500px] overflow-y-auto">
                    <div className="divide-y divide-zinc-200">
                      {ALL_PRODUCTS
                        .filter(p => {
                          const matchSearch = p.name.toLowerCase().includes(productsSearchQuery.toLowerCase()) || 
                            p.id.toLowerCase().includes(productsSearchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(productsSearchQuery.toLowerCase());
                          const matchCat = productsCategoryFilter === '全部' || p.category === productsCategoryFilter;
                          return matchSearch && matchCat;
                        })
                        .map(p => {
                          const isSelected = selectedManageProductId === p.id;
                          const hasCustomImage = !!customProductImages?.[p.id];
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedManageProductId(p.id);
                                setImageUploadError(null);
                                setDirectUrlInput('');
                              }}
                              className={`p-3 transition-all hover:bg-zinc-100/60 flex gap-3.5 cursor-pointer items-center text-left ${
                                isSelected ? 'bg-red-50/50 hover:bg-red-50/80 border-r-4 border-red-500' : ''
                              }`}
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={p.image}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shadow-3xs"
                                  referrerPolicy="no-referrer"
                                />
                                {hasCustomImage && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 border border-white text-[8px] font-sans text-white h-4 px-1.5 rounded-full font-bold flex items-center justify-center shadow-xs">
                                    改
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-black text-zinc-900 truncate">{p.name}</span>
                                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded mr-auto leading-none shrink-0">{p.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 font-sans">
                                  <span>分类: <span className="text-zinc-800">{p.category}</span></span>
                                  <span>SKU: <span className="font-mono text-zinc-700">{p.sku}</span></span>
                                </div>
                                <div className="flex justify-between items-center text-[10.5px] font-mono">
                                  <span className="text-zinc-500">进价: ${p.costPrice.toLocaleString()}</span>
                                  <span className="text-[#e51923] font-bold">零售价: ${p.retailPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Detail & Image Upload Workspace */}
                <div className="lg:col-span-5 border border-zinc-200 rounded-2xl p-5 bg-zinc-50/20 flex flex-col justify-start">
                  {selectedManageProductId ? (() => {
                    const selectedP = ALL_PRODUCTS.find(p => p.id === selectedManageProductId);
                    if (!selectedP) return null;
                    const hasCustomImage = !!customProductImages?.[selectedManageProductId];
                    
                    const handleProductImageFile = (file: File) => {
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setImageUploadError('请选择有效的图片文件 (png/jpg/jpeg/webp 等)');
                        return;
                      }
                      if (file.size > 1500000) {
                        setImageUploadError('图片尺寸过大，请上传小于 1.5MB 的图片以确保顺畅传输');
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const base64 = e.target?.result as string;
                        if (base64) {
                          setImageUploadError(null);
                          const currentOverrides = customProductImages || {};
                          onUpdateMerchantData('system_config', {
                            customProductImages: {
                              ...currentOverrides,
                              [selectedManageProductId]: base64
                            }
                          });
                          setActionSuccessMessage('🎉 商品图片升级成功！数据库已连协合并。');
                          setMessageType('success');
                          setTimeout(() => setActionSuccessMessage(null), 4000);
                        }
                      };
                      reader.onerror = () => {
                        setImageUploadError('图片读取失败，请稍后重试');
                      };
                      reader.readAsDataURL(file);
                    };

                    const handleDragOver = (e: React.DragEvent) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    };
                    
                    const handleDragLeave = () => {
                      setIsDraggingOver(false);
                    };
                    
                    const handleDrop = (e: React.DragEvent) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleProductImageFile(e.dataTransfer.files[0]);
                      }
                    };

                    const handleApplyDirectUrl = () => {
                      const url = directUrlInput.trim();
                      if (!url) {
                        setImageUploadError('请输入有效的网页图片 URL 链接');
                        return;
                      }
                      setImageUploadError(null);
                      const currentOverrides = customProductImages || {};
                      onUpdateMerchantData('system_config', {
                        customProductImages: {
                          ...currentOverrides,
                          [selectedManageProductId]: url
                        }
                      });
                      setActionSuccessMessage('🎉 商品主图已直接指定至图片链接成功！');
                      setMessageType('success');
                      setDirectUrlInput('');
                      setTimeout(() => setActionSuccessMessage(null), 4000);
                    };

                    const handleResetProductImage = () => {
                      onUpdateMerchantData('system_config', {
                        customProductImages: {},
                        _resetProductId: selectedManageProductId
                      });
                      
                      setActionSuccessMessage('🎉 已成功清除自定义图，恢复出厂默认首图！');
                      setMessageType('success');
                      setTimeout(() => setActionSuccessMessage(null), 4000);
                    };

                    return (
                      <div className="flex flex-col gap-4">
                        <div className="text-center pb-2.5 border-b border-zinc-200">
                          <span className="text-xs font-bold text-zinc-800 block">选中编辑的商品属性</span>
                          <span className="text-[10px] font-mono text-zinc-500 block mt-1 leading-normal">{selectedP.name} ({selectedP.id})</span>
                        </div>

                        {/* Comparative Preview */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase mr-auto">当前大图预览 Covered Art</span>
                          <div className="w-48 h-48 rounded-2xl overflow-hidden border border-zinc-200 bg-white relative shadow-sm">
                            <img
                              src={selectedP.image}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {hasCustomImage && (
                              <div className="absolute top-2 left-2 bg-[#e51923] text-white font-extrabold text-[9px] px-2 py-0.5 rounded-lg border border-red-500/20 shadow-sm animate-pulse font-sans">
                                已启用人工图
                              </div>
                            )}
                          </div>
                        </div>

                        {/* File selector drag area */}
                        <div className="flex flex-col gap-1.5 text-left animate-fade-in">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">手动上传全新图片封面 (支持拖入 / 点击选取)</span>
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('manual-image-input2')?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                              isDraggingOver 
                                ? 'bg-red-50 border-[#e51923] text-red-700' 
                                : 'bg-white hover:bg-zinc-100/50 border-zinc-300 text-zinc-500'
                            }`}
                          >
                            <input
                              id="manual-image-input2"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  handleProductImageFile(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-3xs shrink-0">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-zinc-800">将本地图片拖拽落至此处</span>
                              <span className="text-[10.5px] text-zinc-500">或者点击直接选择图像</span>
                            </div>
                            <span className="text-[9px] text-zinc-400 font-mono">（PNG, JPG, JPEG, WEBP | 限制低于 1.5MB）</span>
                          </div>
                        </div>

                        {/* Web link alternative */}
                        <div className="flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">或者：直接粘贴网络图片绝对 URL 链接</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={directUrlInput}
                              onChange={(e) => setDirectUrlInput(e.target.value)}
                              placeholder="粘贴 http:// 或 https:// 开头的公网图片绝对地址..."
                              className="flex-1 text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-[#e51923] placeholder-zinc-400 font-medium"
                            />
                            <button
                              type="button"
                              onClick={handleApplyDirectUrl}
                              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer select-none whitespace-nowrap"
                            >
                              保存
                            </button>
                          </div>
                        </div>

                        {/* Error state */}
                        {imageUploadError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-[11px] p-3 rounded-xl flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                            <span>{imageUploadError}</span>
                          </div>
                        )}

                        {/* Reset control */}
                        {hasCustomImage && (
                          <button
                            type="button"
                            onClick={handleResetProductImage}
                            className="w-full mt-1.5 py-2.5 border border-dashed border-red-500/50 hover:bg-red-100/50 hover:border-red-600/75 text-red-650 hover:text-red-700 font-bold text-xs rounded-xl cursor-pointer select-none flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>清除自定义图，复原出厂默认</span>
                          </button>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="flex-1 py-16 flex flex-col items-center justify-center gap-3 text-zinc-400 min-h-[300px]">
                      <ShoppingBag className="w-12 h-12 text-zinc-300 stroke-1" />
                      <div className="flex flex-col gap-0.5 items-center">
                        <p className="text-xs text-zinc-700 font-bold">请从左侧全局商品列表中选择一款要进行封面升级的产品</p>
                        <p className="text-[10px] text-zinc-400">选择后将在此呈献专有的手动一键图片上传、图片链接配置维护面板</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  </div>
  );
}
