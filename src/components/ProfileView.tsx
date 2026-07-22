import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Landmark, Clipboard, CheckCircle2, Truck, Share2, 
  Settings, Image as ImageIcon, Copy, FileText, Check, ArrowRight, UserPlus, Upload, RefreshCw, AlertCircle, Shield
} from 'lucide-react';
import { Shop, Order, FinancialTransaction } from '../types';
import { resolveAvatar } from '../data';

import { AppLanguage, translateProduct, TRANSLATIONS, getProductImage } from '../utils/translations';

interface ProfileViewProps {
  shop: Shop;
  orders: Order[];
  onUpdateShop: (updatedShop: Partial<Shop>) => void;
  onShipOrder: (orderId: string | string[]) => void;
  onConfirmReceiveOrder?: (orderId: string | string[]) => void;
  userBalance?: number;
  onUpdateBalance?: (newBalance: number) => void;
  financialLogs?: FinancialTransaction[];
  onAddFinancialLog?: (
    type: 'recharge' | 'withdraw' | 'promotion' | 'settlement',
    typeLabel: string,
    amount: number,
    status: '成功' | '已到账' | '已扣除' | '已提交' | '已拒绝',
    description: string
  ) => void;
  onDeleteOrder?: (orderId: string | string[]) => void;
  language?: AppLanguage;
  onChangeLanguage?: (lang: AppLanguage) => void;
  userPassword?: string;
  onChangePassword?: (newPass: string) => void;
  onLogout?: () => void;
  userAccountName?: string;
  registeredUsers?: { name: string; id: string; promotedBy?: string | null; isSalesman?: boolean; isAdmin?: boolean }[];
  withdrawHistory?: any[];
  onUpdateWithdrawHistory?: (history: any[]) => void;
  onOpenAdminConsole?: () => void;
  isSalesman?: boolean;
  onUpdateMerchantData?: (targetAccount: string, updatedFields: Partial<any>) => void;
}

function renderFlag(code: AppLanguage) {
  switch (code) {
    case 'zh':
      return (
        <svg viewBox="0 0 30 20" className="w-5.5 h-4 rounded-xs shadow-xs border border-zinc-150 shrink-0 select-none">
          <rect width="30" height="20" fill="#de2910" />
          <polygon points="5,5 6.2,8.5 2.5,6.2 7.5,6.2 3.8,8.5" fill="#ffde00" />
        </svg>
      );
    case 'en':
      return (
        <svg viewBox="0 0 30 20" className="w-5.5 h-4 rounded-xs shadow-xs border border-zinc-150 shrink-0 select-none">
          <rect width="30" height="20" fill="#3c3b6e" />
          <path d="M0 2h30M0 5h30M0 8h30M0 11h30M0 14h30M0 17h30" stroke="#b22234" strokeWidth="1.5" />
          <rect width="12" height="10" fill="#3c3b6e" />
          <circle cx="2.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="5.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="8.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="2.5" cy="5" r="0.4" fill="#fff" />
          <circle cx="5.5" cy="5" r="0.4" fill="#fff" />
          <circle cx="8.5" cy="5" r="0.4" fill="#fff" />
          <circle cx="2.5" cy="7.5" r="0.4" fill="#fff" />
          <circle cx="5.5" cy="7.5" r="0.4" fill="#fff" />
          <circle cx="8.5" cy="7.5" r="0.4" fill="#fff" />
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 30 20" className="w-5.5 h-4 rounded-xs shadow-xs border border-zinc-150 shrink-0 select-none">
          <rect width="30" height="5" fill="#c60b1e" />
          <rect y="5" width="30" height="10" fill="#ffc400" />
          <rect y="15" width="30" height="5" fill="#c60b1e" />
          <circle cx="8" cy="10" r="1.5" fill="#c60b1e" />
        </svg>
      );
    case 'ja':
      return (
        <svg viewBox="0 0 30 20" className="w-5.5 h-4 rounded-xs shadow-xs border border-zinc-200 shrink-0 select-none">
          <rect width="30" height="20" fill="#ffffff" />
          <circle cx="15" cy="10" r="4.5" fill="#bc002d" />
        </svg>
      );
    case 'ko':
      return (
        <svg viewBox="0 0 30 20" className="w-5.5 h-4 rounded-xs shadow-xs border border-zinc-200 shrink-0 select-none bg-white">
          <rect width="30" height="20" fill="#ffffff" />
          <circle cx="15" cy="10" r="4" fill="#cd2e3a" />
          <path d="M11 10a2 2 0 0 0 4 0 2 2 0 0 1 4 0A4 4 0 0 1 11 10z" fill="#0047a0" />
          <line x1="6" y1="4.5" x2="8.5" y2="6.2" stroke="#000" strokeWidth="0.8" />
          <line x1="5.5" y1="5.2" x2="8" y2="6.9" stroke="#000" strokeWidth="0.8" />
          <line x1="5" y1="5.9" x2="7.5" y2="7.6" stroke="#000" strokeWidth="0.8" />
          <line x1="21.5" y1="6.2" x2="24" y2="4.5" stroke="#000" strokeWidth="0.8" />
          <line x1="22" y1="6.9" x2="24.5" y2="5.2" stroke="#000" strokeWidth="0.8" />
          <line x1="22.5" y1="7.6" x2="25" y2="5.9" stroke="#000" strokeWidth="0.8" />
          <line x1="6" y1="15.5" x2="8.5" y2="13.8" stroke="#000" strokeWidth="0.8" />
          <line x1="5.5" y1="14.8" x2="8" y2="13.1" stroke="#000" strokeWidth="0.8" />
          <line x1="5" y1="14.1" x2="7.5" y2="12.4" stroke="#000" strokeWidth="0.8" />
          <line x1="21.5" y1="13.8" x2="24" y2="15.5" stroke="#000" strokeWidth="0.8" />
          <line x1="22" y1="13.1" x2="24.5" y2="14.8" stroke="#000" strokeWidth="0.8" />
          <line x1="22.5" y1="12.4" x2="25" y2="14.1" stroke="#000" strokeWidth="0.8" />
        </svg>
      );
    case 'vi':
      return (
        <svg viewBox="0 0 30 20" className="w-5.5 h-4 rounded-xs shadow-xs border border-zinc-150 shrink-0 select-none">
          <rect width="30" height="20" fill="#da251d" />
          <polygon points="15,4 16.2,8.5 20.8,8.5 17,11.2 18.5,15.8 15,13 11.5,15.8 13,11.2 9.2,8.5 13.8,8.5" fill="#ffff00" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ProfileView({
  shop,
  orders,
  onUpdateShop,
  onShipOrder,
  onConfirmReceiveOrder,
  onDeleteOrder,
  userBalance = 15000,
  onUpdateBalance,
  financialLogs = [],
  onAddFinancialLog,
  language = 'zh',
  onChangeLanguage,
  userPassword = '123456',
  onChangePassword,
  onLogout,
  userAccountName = 'admin',
  registeredUsers = [],
  withdrawHistory: withdrawHistoryProp,
  onUpdateWithdrawHistory,
  onOpenAdminConsole,
  isSalesman = false,
  onUpdateMerchantData
}: ProfileViewProps) {
  const matchedUserObj = registeredUsers?.find(u => u.name.toLowerCase() === userAccountName?.toLowerCase());
  const isMasterOrAdmin = userAccountName?.toLowerCase() === 'oopqwe001@gmail.com' || userAccountName?.toLowerCase() === 'oopqwe521@gmail.com' || matchedUserObj?.isAdmin === true;
  const isMasterOrSalesman = isMasterOrAdmin || isSalesman || matchedUserObj?.isSalesman === true;

  const getTranslatedProductName = (productId: string, defaultName: string) => {
    const dummyProd = {
      id: productId,
      name: defaultName,
      category: '',
      sku: '',
      description: '',
      retailPrice: 0,
      costPrice: 0,
      profit: 0,
      image: ''
    };
    return translateProduct(dummyProd, language).name;
  };

  const displayId = (userAccountName?.toLowerCase() === 'oopqwe001@gmail.com' || userAccountName?.toLowerCase() === 'oopqwe521@gmail.com')
    ? shop.id 
    : (matchedUserObj?.id || (shop.id && shop.id.startsWith('shop-') ? shop.id.replace('shop-', '') : shop.id));

  // Tabs within Order Management: 'pending', 'shipped', 'completed' or 'self'
  const [activeOrderTab, setActiveOrderTab] = useState<'pending' | 'shipped' | 'completed' | 'self'>('pending');
  
  // Recharge & Withdraw States
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [showLedgerPanel, setShowLedgerPanel] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // States for bank withdrawal details
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchNo, setBranchNo] = useState('');
  const [bankCard, setBankCard] = useState('');
  const [fullName, setFullName] = useState('');

  // Historical withdrawal records (synchronized to global state if loaded)
  const [localWithdrawHistory, setLocalWithdrawHistory] = useState<{
    id: string;
    amount: number;
    bankName: string;
    branchName: string;
    branchNo: string;
    fullName: string;
    bankCard: string;
    status: string;
    createdAt: string;
  }[]>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_withdraw_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (item && typeof item.amount === 'number' && item.amount < 10000) {
              return { ...item, amount: item.amount * 20 };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.error('Error loading withdraw history', e);
    }
    return [
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
      },
      {
        id: 'WD-20260527-012',
        amount: 65000,
        bankName: '三菱UFJ银行',
        branchName: '新宿支店',
        branchNo: '123',
        fullName: '雅领高奢美学',
        bankCard: '622588******2555',
        status: '已到账',
        createdAt: '2026-05-27 09:12:05'
      }
    ];
  });

  const withdrawHistory = withdrawHistoryProp ?? localWithdrawHistory;

  const setWithdrawHistory = (value: any | ((prev: any[]) => any[])) => {
    if (onUpdateWithdrawHistory) {
      const nextVal = typeof value === 'function' ? value(withdrawHistoryProp ?? []) : value;
      onUpdateWithdrawHistory(nextVal);
    } else {
      const nextVal = typeof value === 'function' ? value(localWithdrawHistory) : value;
      setLocalWithdrawHistory(nextVal);
    }
  };

  useEffect(() => {
    localStorage.setItem('aliexpress_withdraw_history', JSON.stringify(localWithdrawHistory));
  }, [localWithdrawHistory]);

  useEffect(() => {
    if (!showWithdrawModal) {
      setShowHistoryView(false);
    }
  }, [showWithdrawModal]);

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      setTransactionError(t('alertEmptyRechargeAmount'));
      return;
    }
    if (onAddFinancialLog) {
      onAddFinancialLog(
        'recharge',
        '店铺账户充值',
        amount,
        '已提交',
        `通过外部结算账户申请注资 $${amount.toLocaleString()}，等待超级管理员复核确认`
      );
    }
    setTransactionSuccess(true);
    setTransactionError('');
    setTimeout(() => {
      setShowRechargeModal(false);
      setTransactionSuccess(false);
      setAmountInput('');
    }, 1500);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      setTransactionError(t('alertEmptyRechargeAmount'));
      return;
    }
    if (amount > userBalance) {
      setTransactionError(t('alertWithdrawFailBalance'));
      return;
    }
    if (!bankName.trim() || !branchName.trim() || !branchNo.trim() || !bankCard.trim() || !fullName.trim()) {
      setTransactionError(t('alertWithdrawFailInfo'));
      return;
    }
    
    if (onAddFinancialLog) {
      onAddFinancialLog(
        'withdraw',
        '结算提现申请',
        -amount,
        '已提交',
        `申请结算提现至: ${bankName.trim()} (${branchName.trim()} 尾号${bankCard.slice(-4)})，持有人: ${fullName.trim()}`
      );
    } else if (onUpdateBalance) {
      onUpdateBalance(userBalance - amount);
    }

    // Append to withdraw history
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const rand = Math.floor(Math.random() * 900) + 100;
    
    const newRecord = {
      id: `WD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${rand}`,
      amount,
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      branchNo: branchNo.trim(),
      fullName: fullName.trim(),
      bankCard: bankCard.trim(),
      status: '已提交',
      createdAt: `${dateStr} ${timeStr}`
    };
    
    setWithdrawHistory(prev => [newRecord, ...prev]);

    setTransactionSuccess(true);
    setTransactionError('');
    setTimeout(() => {
      setShowWithdrawModal(false);
      setTransactionSuccess(false);
      setAmountInput('');
      setBankName('');
      setBranchName('');
      setBranchNo('');
      setBankCard('');
      setFullName('');
    }, 1200);
  };

  const handleShipAll = () => {
    if (pendingOrders.length === 0) return;
    const allPendingIds = pendingOrders.map(o => o.id);
    onShipOrder(allPendingIds);
  };
  
  // Local states for custom editing
  const [isEditingShopName, setIsEditingShopName] = useState(false);
  const settingsContainerRef = React.useRef<HTMLDivElement>(null);
  const settingsToggleBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isEditingShopName) return;
      // Do not close if a nested modal is visible to prevent unexpected closure
      if (showRechargeModal || showWithdrawModal) return;

      if (
        (settingsContainerRef.current && settingsContainerRef.current.contains(event.target as Node)) ||
        (settingsToggleBtnRef.current && settingsToggleBtnRef.current.contains(event.target as Node))
      ) {
        return;
      }
      setIsEditingShopName(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingShopName, showRechargeModal, showWithdrawModal]);

  const [tempShopName, setTempShopName] = useState(shop.name);
  const [isEditingQr, setIsEditingQr] = useState(false);
  const [tempQr, setTempQr] = useState(shop.qrCode);
  const [tempAvatar, setTempAvatar] = useState(resolveAvatar(shop.avatar));

  useEffect(() => {
    setTempShopName(shop.name);
    setTempQr(shop.qrCode);
    setTempAvatar(resolveAvatar(shop.avatar));
  }, [shop]);

  // Sub tab for the gear configuration menu (Settings dialog)
  const [settingsSubTab, setSettingsSubTab] = useState<'shop' | 'lang' | 'password' | 'logout' | 'admin'>('shop');
  
  // Password modification inputs
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Translation getter helper
  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['zh'][key] || key;
  };
  
  // Custom Clipboard copy confirmation
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  
  // Active statistics calculated from orders
  const pendingOrders = orders.filter(o => o.status === 'pending' && !o.isSelfOrder);
  const shippedOrders = orders.filter(o => o.status === 'shipped' && !o.isSelfOrder);
  const completedOrders = orders.filter(o => o.status === 'completed' && !o.isSelfOrder);
  const selfOrders = orders.filter(o => o.isSelfOrder === true);
  
  // Cumulative GMV according to shipping. Only status === 'shipped' or 'completed'
  const totalGmv = orders
    .filter(o => (o.status === 'shipped' || o.status === 'completed') && !o.isSelfOrder)
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  // Cumulative revenue / earnings (sum of profit of completed/settled orders)
  const totalProfit = orders.filter(o => o.status === 'completed' && !o.isSelfOrder).reduce((sum, o) => sum + o.totalProfit, 0);

  // Cumulative product cost of all shipped or completed orders
  const totalCostOfShipped = orders
    .filter(o => (o.status === 'shipped' || o.status === 'completed') && !o.isSelfOrder)
    .reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => itemSum + (item.costPrice * item.quantity), 0);
    }, 0);

  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShop({
      name: tempShopName,
      qrCode: tempQr,
      avatar: tempAvatar,
    });
    setIsEditingShopName(false);
    setIsEditingQr(false);
  };

  const handleCopyAddress = (order: Order) => {
    const translatedName = getTranslatedProductName(order.items[0]?.productId || '', order.items[0]?.productName || '');
    const textToCopy = `收货人: ${order.customerName}\n手机号: ${order.customerPhone}\n地址: ${order.shippingAddress}\n商品名: ${translatedName} (${order.items[0]?.quantity}件)`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStates(prev => ({ ...prev, [order.id]: true }));
        setTimeout(() => {
          setCopyStates(prev => ({ ...prev, [order.id]: false }));
        }, 2000);
      }).catch(() => {
         // fallback
         alert('复制成功:\n' + textToCopy);
      });
    } else {
      alert('复制内容:\n' + textToCopy);
    }
  };

  // Plain-text Bulk Order Exporter for Dropshipping Platforms
  const generateBulkExportText = () => {
    if (pendingOrders.length === 0) {
      return '今日暂无待配送的订单。';
    }
    
    let text = `【${shop.name}】今日待派单报表 (${new Date().toISOString().slice(0, 10)})\n`;
    text += `===================================\n\n`;
    
    pendingOrders.forEach((o, index) => {
      text += `订单 ${index + 1}：\n`;
      text += `收货姓名：${o.customerName}\n`;
      text += `联系电话：${o.customerPhone}\n`;
      text += `收货地址：${o.shippingAddress}\n`;
      text += `款项合计：$${o.totalPrice.toLocaleString()}\n`;
      text += `明细包含：\n`;
      o.items.forEach(it => {
        const translatedName = getTranslatedProductName(it.productId, it.productName);
        text += `- ${translatedName} [型号ID: ${it.productId}] [数量: ${it.quantity} 件]\n`;
      });
      text += `-----------------------------------\n\n`;
    });
    
    text += `付款备注：下单时系统已提供收款，店主已线上核准付款备注。请货源端核实安排由高端物流急速发货。`;
    return text;
  };

  const handleCopyExportText = () => {
    const text = generateBulkExportText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('📋 待派发订单报表已一键复制到剪贴板，可直接发送至官方客服人员或供货邮箱。');
        setIsExporting(false);
      });
    } else {
      alert('请手动复制提取以下报表：\n\n' + text);
    }
  };

  // Sample quick templates for QR selector testing inside AI Studio iframe preview
  const sampleQrs = [
    { name: '鎏金收款码', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&fit=crop&q=80' },
    { name: '红黑艺术码', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300&fit=crop&q=80' },
    { name: '轻奢印章名片', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&fit=crop&q=80' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* 1. Header Identity card / edit block */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col gap-4">
        
        {/* Subtle royal background element */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-[#e51923]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <label className="w-full h-full rounded-full border border-zinc-200 overflow-hidden bg-zinc-50 group cursor-pointer block relative">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setTempAvatar(base64);
                      onUpdateShop({ avatar: base64 });
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              <img 
                src={resolveAvatar(shop.avatar)} 
                alt={shop.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23fff5f5"/><circle cx="50" cy="40" r="18" fill="%23e51923" fill-opacity="0.85"/><path d="M22 78C22 62.536 34.536 50 50 50C65.464 50 78 62.536 78 78" stroke="%23e51923" stroke-width="8" stroke-linecap="round"/></svg>`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 flex items-center justify-center transition-all">
                <Upload className="w-4 h-4 text-white hover:scale-110 transition-transform" />
              </div>
            </label>
            {/* Mobile-optimized visual indicator badge */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#e51923] text-white p-1 rounded-full border border-white shadow-xs flex items-center justify-center pointer-events-none">
              <Upload className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#e51923] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold scale-90">
                {t('ownerBadge')}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">ID: {displayId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-base text-zinc-905 font-bold tracking-wide text-left">
                {shop.name}
              </h2>
              <button 
                type="button"
                ref={settingsToggleBtnRef}
                onClick={() => {
                  setTempShopName(shop.name);
                  setIsEditingShopName(!isEditingShopName);
                }}
                className="text-[#e51923] hover:text-red-700 p-1 transition-all pointer-events-auto cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Shop Settings Inputs */}
        <AnimatePresence>
          {isEditingShopName && (
            <motion.div 
              ref={settingsContainerRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-200 pt-4 mt-2 flex flex-col gap-4 overflow-hidden text-xs bg-zinc-50/50 p-4 rounded-2xl border border-zinc-150"
            >
              {/* Settings Sub Tabs Bar */}
              <div className={`grid gap-2 border-b border-zinc-205 pb-3 select-none ${
                isMasterOrSalesman
                  ? 'grid-cols-2 sm:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('shop')}
                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    settingsSubTab === 'shop'
                      ? 'bg-[#e51923] text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {t('settingsTabStore')}
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('lang')}
                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    settingsSubTab === 'lang'
                      ? 'bg-[#e51923] text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {t('settingsTabLang')}
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('password')}
                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    settingsSubTab === 'password'
                      ? 'bg-[#e51923] text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {t('settingsTabPass')}
                </button>
                {isMasterOrSalesman && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAdminConsole) {
                        onOpenAdminConsole();
                      } else {
                        setSettingsSubTab('admin');
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                      settingsSubTab === 'admin'
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {t('settingsTabAdmin')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('logout')}
                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    settingsSubTab === 'logout'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-650 hover:bg-red-50/35 hover:border-red-200'
                  }`}
                >
                  {t('settingsTabLogout')}
                </button>
              </div>

              {/* Sub-Tab Panels */}
              <div className="flex flex-col gap-3 min-h-[140px] text-left">
                {settingsSubTab === 'shop' && (
                  <form onSubmit={handleUpdateStore} noValidate className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-zinc-600 font-bold text-left">{t('shopNameLabel')}</label>
                      <input 
                        type="text"
                        required
                        value={tempShopName}
                        onChange={(e) => setTempShopName(e.target.value)}
                        className="w-full text-xs bg-white border border-zinc-300 text-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-[#e51923] font-medium shadow-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <div className="text-zinc-650 font-bold flex items-center justify-between">
                        <span className="text-left">{t('avatarLabel')}</span>
                        <label className="text-[#e51923] hover:text-red-700 cursor-pointer font-extrabold flex items-center gap-1 active:scale-95 transition-all text-[11px]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t('selectLocalImg')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setTempAvatar(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        {tempAvatar && (
                          <img 
                            src={tempAvatar} 
                            alt="预览" 
                            className="w-10 h-10 object-cover rounded-full border border-zinc-205 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23fff5f5"/><circle cx="50" cy="40" r="18" fill="%23e51923" fill-opacity="0.85"/><path d="M22 78C22 62.536 34.536 50 50 50C65.464 50 78 62.536 78 78" stroke="%23e51923" stroke-width="8" stroke-linecap="round"/></svg>`;
                            }}
                          />
                        )}
                        <input 
                          type="text"
                          placeholder={t('inputAvatarUrl')}
                          value={tempAvatar}
                          onChange={(e) => setTempAvatar(e.target.value)}
                          className="flex-1 text-xs bg-white border border-zinc-300 text-zinc-805 rounded-lg p-2.5 focus:outline-none focus:border-[#e51923] font-medium shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button 
                        type="button"
                        onClick={() => setIsEditingShopName(false)}
                        className="px-3.5 py-1.5 border border-zinc-300 rounded-lg text-zinc-500 font-semibold hover:bg-zinc-100 transition-colors"
                      >
                        {t('cancel')}
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-1.5 bg-[#e51923] hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{t('updateConfigBtn')}</span>
                      </button>
                    </div>
                  </form>
                )}

                {settingsSubTab === 'lang' && (
                  <div className="flex flex-col gap-3">
                    <label className="text-zinc-650 font-bold">{t('chooseLanguage')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { code: 'ja', name: '日本語 (Japanese)' },
                        { code: 'ko', name: '한국어 (Korean)' },
                        { code: 'zh', name: '简体中文 (Chinese)' },
                        { code: 'en', name: 'English (English)' },
                        { code: 'es', name: 'Español (Spanish)' },
                        { code: 'vi', name: 'Tiếng Việt (Vietnamese)' }
                      ].map((langItem) => (
                        <button
                          key={langItem.code}
                          type="button"
                          onClick={() => {
                            if (onChangeLanguage) {
                              onChangeLanguage(langItem.code as AppLanguage);
                            }
                            setIsEditingShopName(false);
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                            language === langItem.code
                              ? 'border-[#e51923] bg-red-50/40 text-[#e51923] shadow-3xs'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {renderFlag(langItem.code as AppLanguage)}
                            <span>{langItem.name}</span>
                          </div>
                          {language === langItem.code && (
                            <Check className="w-3.5 h-3.5 text-[#e51923]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {settingsSubTab === 'password' && (
                  <div className="flex flex-col gap-3 text-left">
                    <h3 className="text-zinc-650 font-bold text-left">{t('changePass')}</h3>
                    
                    {passwordError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] font-semibold text-left">
                        ⚠️ {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-left">
                        <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-zinc-500 font-bold text-[10.5px] text-left">{t('curPassword')}</span>
                        <input
                          type="password"
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder={t('curPassPlaceholder')}
                          className="w-full text-xs bg-white border border-zinc-300 text-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-[#e51923] font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-zinc-500 font-bold text-[10.5px] text-left">{t('newPassword')}</span>
                        <input
                          type="password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder={t('newPassPlaceholder')}
                          className="w-full text-xs bg-white border border-zinc-300 text-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-[#e51923] font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-zinc-500 font-bold text-[10.5px] text-left">{t('confirmPass')}</span>
                        <input
                          type="password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder={t('confirmPassPlaceholder')}
                          className="w-full text-xs bg-white border border-zinc-300 text-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-[#e51923] font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPasswordInput('');
                          setNewPasswordInput('');
                          setConfirmPasswordInput('');
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        className="px-3 py-1.5 border border-zinc-200 text-zinc-500 rounded-lg font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        清空
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordError('');
                          setPasswordSuccess('');

                          if (currentPasswordInput !== userPassword) {
                            setPasswordError(t('passwordErrorCur'));
                            return;
                          }
                          if (newPasswordInput.length < 6) {
                            setPasswordError(t('passwordErrorLen'));
                            return;
                          }
                          if (newPasswordInput !== confirmPasswordInput) {
                            setPasswordError(t('passwordErrorMatch'));
                            return;
                          }

                          if (onChangePassword) {
                            onChangePassword(newPasswordInput);
                          }
                          setPasswordSuccess(t('passwordSuccess'));
                          setCurrentPasswordInput('');
                          setNewPasswordInput('');
                          setConfirmPasswordInput('');
                        }}
                        className="px-3.5 py-1.5 bg-[#e51923] text-white rounded-lg font-bold hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        {t('updateConfigBtn')}
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'logout' && (
                  <div className="flex flex-col gap-3 justify-center items-center py-4 text-center w-full">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#e51923] mb-1">
                      <AlertCircle className="w-5 h-5 text-[#e51923] animate-pulse" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-800">{t('logoutTitle')}</h3>
                    <p className="text-[11px] text-zinc-500 max-w-xs">{t('logoutConfirm')}</p>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (onLogout) {
                          onLogout();
                        }
                      }}
                      className="mt-2 px-6 py-2 bg-[#e51923] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{t('logoutBtn')}</span>
                    </button>
                  </div>
                )}

                {settingsSubTab === 'admin' && isMasterOrSalesman && (
                  isMasterOrAdmin ? (
                    <div className="flex flex-col gap-4 text-left">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <h3 className="text-zinc-800 font-bold text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse inline-block"></span>
                        <span>速卖通沙盒超级中控系统 (MASTER CONTROL)</span>
                      </h3>
                      <span className="text-[10px] font-mono bg-zinc-150 text-zinc-600 px-2.5 py-0.5 rounded-full font-bold">
                        USERS: {registeredUsers?.length || 0}
                      </span>
                    </div>

                    {/* Master Launch Card */}
                    <div className="bg-[#0f1115] text-[#b3b9c1] p-5 rounded-2xl border border-zinc-800 flex flex-col gap-3 shadow-lg relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none">
                        <Shield className="w-48 h-48 text-white" />
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#e51923] flex items-center justify-center text-white shadow-lg">
                          <Shield className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">系统超级管理员主控舱</h4>
                          <p className="text-[10px] text-zinc-500 font-medium">独享5维度数据调和、派单配额流及商户结算特权</p>
                        </div>
                      </div>

                      <p className="text-[10.5px] leading-relaxed text-zinc-400 font-medium border-t border-zinc-850 pt-2.5 mt-1">
                        您已成功登录超级管理员控制账户 <span className="text-white font-bold select-all">{userAccountName}</span>。点击下方独立后台系统专用通道，即可全屏调取多商户大屏看板，进行秒级实盘订单派发、提现卡号修改审计。
                      </p>

                      {/* Admin's Promo Link */}
                      <div className="border-t border-zinc-850 pt-3 mt-1 flex flex-col gap-1.5 text-left">
                        <span className="text-[10px] text-zinc-300 font-extrabold tracking-wider uppercase">我的专属管理员招商推广链接 (My Admin Referral Link):</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={`${window.location.origin}/?ref=${encodeURIComponent(userAccountName || '')}`}
                            className="flex-1 bg-zinc-950 border border-zinc-800 text-purple-400 p-2 rounded-xl text-xs font-mono select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(`${window.location.origin}/?ref=${encodeURIComponent(userAccountName || '')}`);
                                alert('您的管理员推广链接已成功复制到剪贴板！可以直接发送给新商家。');
                              } catch (e) {
                                alert('您的链接是: ' + `${window.location.origin}/?ref=${encodeURIComponent(userAccountName || '')}`);
                              }
                            }}
                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors whitespace-nowrap active:scale-95 font-sans"
                          >
                            复制链接
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAdminConsole) {
                            onOpenAdminConsole();
                          }
                        }}
                        className="mt-2 w-full py-3 bg-[#e51923] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4 animate-pulse text-white" />
                        <span>🚀 点击进入独立后台大屏管理系统</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 mt-1 opacity-80 decoration-none">
                      <span className="text-[9.5px] text-zinc-500 font-black uppercase tracking-wider block mb-1">
                        系统在册店家概览 (Registered Merchants Schema):
                      </span>
                      {registeredUsers && registeredUsers.length > 0 ? (
                        registeredUsers.map((user, idx) => (
                          <div 
                            key={user.id || idx} 
                            className="bg-white border border-zinc-200 p-2.5 rounded-xl flex items-center justify-between hover:border-zinc-300 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-zinc-100 text-[#e51923] flex items-center justify-center font-bold text-[10.5px] border border-zinc-200 uppercase font-mono">
                                {user.name.slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-800 break-all select-all">
                                  {user.name}
                                </span>
                                {user.name.toLowerCase() === 'oopqwe001@gmail.com' || user.name.toLowerCase() === 'oopqwe521@gmail.com' ? (
                                  <span className="text-[9px] text-[#e51923] font-bold tracking-wider uppercase font-sans mt-0.5">
                                    总账户 (Master Root)
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[9px] text-zinc-400 font-bold tracking-wider uppercase font-mono">
                                      注册账户 (Reg User)
                                    </span>
                                    {user.isAdmin ? (
                                      <span className="text-[8.5px] bg-purple-50 text-purple-600 border border-purple-150 px-1 py-0.2 rounded font-bold uppercase shrink-0">
                                        ⭐ 超级管理员
                                      </span>
                                    ) : user.isSalesman ? (
                                      <span className="text-[8.5px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1 py-0.2 rounded font-bold uppercase shrink-0">
                                        ⭐ 业务管理员
                                      </span>
                                    ) : (
                                      <span className="text-[8.5px] bg-blue-50 text-blue-600 border border-blue-150 px-1 py-0.2 rounded font-bold uppercase shrink-0">
                                        普通店主
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10.5px] font-mono font-bold bg-zinc-50 text-zinc-700 px-2 py-1 rounded-lg border border-zinc-200 whitespace-nowrap">
                                ID: {user.id || 'N/A'}
                              </span>
                              {user.name.toLowerCase() !== 'oopqwe001@gmail.com' && user.name.toLowerCase() !== 'oopqwe521@gmail.com' && onUpdateMerchantData && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    let nextFields: any = {};
                                    if (user.isAdmin) {
                                      nextFields = { isSalesman: false, isAdmin: false };
                                    } else if (user.isSalesman) {
                                      nextFields = { isSalesman: false, isAdmin: true };
                                    } else {
                                      nextFields = { isSalesman: true, isAdmin: false };
                                    }
                                    onUpdateMerchantData(user.name, nextFields);
                                  }}
                                  className={`text-[9.5px] px-2 py-1 rounded-lg font-bold transition-all border active:scale-95 cursor-pointer whitespace-nowrap ${
                                    user.isAdmin
                                      ? 'bg-purple-50 text-purple-650 border-purple-200 hover:bg-purple-100'
                                      : user.isSalesman
                                      ? 'bg-emerald-50 text-emerald-650 border-emerald-150 hover:bg-emerald-100'
                                      : 'bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  {user.isAdmin ? '角色: 管理员 🔄' : (user.isSalesman ? '角色: 业务员 🔄' : '角色: 普通商家 🔄')}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-zinc-400 font-medium">
                          暂无注册的子账户数据
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-left font-sans">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <h3 className="text-zinc-800 font-bold text-xs flex items-center gap-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                        <span>{t('salesmanConsoleTitle')}</span>
                      </h3>
                      <span className="text-[10px] font-mono bg-emerald-50 border border-emerald-150 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                        PROMOTER ACTIVE
                      </span>
                    </div>

                    {/* Salesman Launch Card */}
                    <div className="bg-[#0b1c15] text-[#b3b9c1] p-5 rounded-2xl border border-emerald-950 flex flex-col gap-3 shadow-lg relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none">
                        <Shield className="w-48 h-48 text-white" />
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shrink-0">
                          <UserPlus className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider font-sans">{t('salesmanWorkstation')}</h4>
                          <p className="text-[10px] text-emerald-400 font-semibold uppercase font-mono tracking-wide">Promoter Business Workstation</p>
                        </div>
                      </div>

                      <div className="border-t border-emerald-900/30 pt-3 mt-1 flex flex-col gap-1.5 text-left">
                        <span className="text-[10px] text-zinc-300 font-extrabold tracking-wider uppercase">{t('myReferralLink')}:</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={`${window.location.origin}/?ref=${encodeURIComponent(userAccountName || '')}`}
                            className="flex-1 bg-zinc-950 border border-zinc-800 text-emerald-400 p-2.5 rounded-xl text-xs font-mono select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(`${window.location.origin}/?ref=${encodeURIComponent(userAccountName || '')}`);
                                alert('您的推广链接已成功复制到剪贴板！可以直接发送给新商家注册。');
                              } catch (e) {
                                alert('您的链接是: ' + `${window.location.origin}/?ref=${encodeURIComponent(userAccountName || '')}`);
                              }
                            }}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors whitespace-nowrap active:scale-95 font-sans"
                          >
                            {t('copyLinkBtn')}
                          </button>
                        </div>
                      </div>

                      <p className="text-[10.5px] leading-relaxed text-zinc-400 font-medium border-t border-emerald-950 pt-2.5 mt-1 font-sans">
                        {t('salesmanDesc')}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAdminConsole) {
                            onOpenAdminConsole();
                          }
                        }}
                        className="mt-2 w-full py-3 bg-emerald-600 hover:bg-[#10b981] text-white font-black text-xs rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
                      >
                        <Shield className="w-4 h-4 animate-pulse text-white" />
                        <span>{t('enterExtSystem')}</span>
                      </button>
                    </div>

                    {/* Promoted merchants list */}
                    <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 mt-1">
                      <span className="text-[9.5px] text-zinc-500 font-black uppercase tracking-wider block mb-1 font-sans">
                        {t('promotedMerchantsTitle')}:
                      </span>
                      {registeredUsers && registeredUsers.filter(u => u.promotedBy?.toLowerCase() === userAccountName?.toLowerCase()).length > 0 ? (
                        registeredUsers.filter(u => u.promotedBy?.toLowerCase() === userAccountName?.toLowerCase()).map((user, idx) => (
                          <div 
                            key={user.id || idx} 
                            className="bg-white border border-zinc-200 p-2.5 rounded-xl flex items-center justify-between hover:border-zinc-300 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10.5px] border border-emerald-200 uppercase font-mono shrink-0">
                                {user.name.slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-800 break-all select-all font-sans">
                                  {user.name}
                                </span>
                                <span className="text-[9px] text-[#059669] font-black tracking-wider uppercase font-mono mt-0.5">
                                  {t('merchantRegistered')}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <span className="text-[10.5px] font-mono font-bold bg-zinc-50 text-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-200">
                                ID: {user.id || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-zinc-400 font-medium bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-xs px-4 font-sans justify-center items-center">
                          {t('noPromotedMerchants')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Core Dashboard Metrics (conspicuous design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV */}
        <div className="bg-gradient-to-br from-[#FFF5F5] via-white to-white p-5 rounded-2xl border border-red-100 flex flex-col justify-between h-28 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-zinc-700/60">
            <BarChart3 className="w-8 h-8 opacity-40 text-[#e51923]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 tracking-wider font-bold flex items-center gap-1.5">
              <span>{t('totalGmv')}</span>
              <span className="w-1 h-3 bg-[#e51923]"></span>
            </span>
            <div className="text-2.5xl font-mono text-[#e51923] font-black mt-1 tracking-tight">
              <span className="text-sm font-sans mr-1 font-extrabold">$</span>
              {totalGmv.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-zinc-450 font-medium font-sans flex items-center justify-between">
            <span>{t('realtimeGmvDesc')}</span>
            <span>{t('realtimeLabel')}</span>
          </div>
        </div>

        {/* Shop Cash Balance */}
        <div className="bg-gradient-to-br from-amber-50/40 via-white to-white p-5 rounded-2xl border border-amber-150 flex flex-col justify-between h-28 relative overflow-hidden shadow-sm">
          {/* Top-right "充值" button */}
          <button 
            type="button"
            onClick={() => {
              setAmountInput('');
              setTransactionError('');
              setTransactionSuccess(false);
              setShowRechargeModal(true);
            }}
            className="absolute right-4 top-4 text-[10px] bg-[#e51923] hover:bg-red-700 active:scale-95 text-white font-extrabold px-3 py-0.5 rounded-full cursor-pointer transition-all shadow-3xs"
          >
            {t('rechargeBtn')}
          </button>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 tracking-wider font-bold flex items-center gap-1.5">
              <span>{t('storeBalanceLong')}</span>
              <span className="w-1 h-3 bg-amber-500"></span>
            </span>
            <div className="text-2.5xl font-mono text-amber-600 font-black mt-1 tracking-tight flex items-baseline gap-1">
              <span className="text-xs font-sans mr-1 font-extrabold">$</span>
              <span>{userBalance.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-450 font-medium font-sans flex items-center justify-between">
            <span>{t('storeBalanceDesc')}</span>
            {/* Bottom-right "提现" button */}
            <button
              type="button"
              onClick={() => {
                setAmountInput('');
                setBankName('');
                setBranchName('');
                setBranchNo('');
                setBankCard('');
                setFullName('');
                setTransactionError('');
                setTransactionSuccess(false);
                setShowWithdrawModal(true);
              }}
              className="text-amber-700 hover:text-white hover:bg-amber-600 bg-amber-50 px-3 py-0.5 text-[10px] font-extrabold rounded-full cursor-pointer transition-all active:scale-95 border border-amber-200 shadow-3xs"
            >
              {t('withdrawBtn')}
            </button>
          </div>
        </div>

        {/* Total revenue / margins */}
        <div className="bg-gradient-to-br from-emerald-50/40 via-white to-white p-5 rounded-2xl border border-emerald-100 flex flex-col justify-between h-28 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-zinc-700/60">
            <Landmark className="w-8 h-8 opacity-45 text-emerald-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 tracking-wider font-bold flex items-center gap-1.5">
              <span>{t('totalCommissions')}</span>
              <span className="w-1 h-3 bg-emerald-500"></span>
            </span>
            <div className="text-2.5xl font-mono text-emerald-600 font-black mt-1 tracking-tight flex items-baseline gap-1">
              <span className="text-xs font-sans mr-1 font-extrabold">$</span>
              <span>{totalProfit.toLocaleString()}</span>
              {totalProfit > 0 && (
                <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-sm border border-emerald-100 uppercase scale-90">
                  {t('instantlyCredited')}
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-zinc-450 font-medium font-sans flex items-center justify-between">
            <span>{t('commissionSubDesc1')}</span>
            <span>{t('commissionSubDesc2')}</span>
          </div>
        </div>

        {/* Total cumulative cost price of shipped and completed orders */}
        <div className="bg-gradient-to-br from-zinc-50/40 via-white to-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-between h-28 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-zinc-700/60">
            <Truck className="w-8 h-8 opacity-35 text-zinc-500" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 tracking-wider font-bold flex items-center gap-1.5">
              <span>{t('cumulativeDeliveryCost')}</span>
              <span className="w-1 h-3 bg-zinc-400"></span>
            </span>
            <div className="text-2.5xl font-mono text-zinc-700 font-black mt-1 tracking-tight flex items-baseline gap-1">
              <span className="text-xs font-sans mr-1 font-extrabold">$</span>
              <span>{totalCostOfShipped.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-450 font-medium font-sans flex items-center justify-between">
            <span>{t('deliveryCostDesc1')}</span>
            <span>{t('deliveryCostDesc2')}</span>
          </div>
        </div>
      </div>



      {/* 3. Order Management System */}
      <div className="flex flex-col gap-4">
        
        {/* Toggle & Export Controls Line */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2 flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveOrderTab('pending')}
              className={`pb-1 text-xs font-bold tracking-wider transition-all relative ${
                activeOrderTab === 'pending'
                  ? 'text-[#e51923] font-sans font-black'
                  : 'text-zinc-450 hover:text-zinc-805'
              }`}
            >
              <span>{t('tabPendingCount')} ({pendingOrders.length})</span>
              {activeOrderTab === 'pending' && (
                <motion.div layoutId="orderTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e51923] mt-1" />
              )}
            </button>
            <button
              onClick={() => setActiveOrderTab('shipped')}
              className={`pb-1 text-xs font-bold tracking-wider transition-all relative ml-4 ${
                activeOrderTab === 'shipped'
                  ? 'text-[#e51923] font-sans font-black'
                  : 'text-zinc-450 hover:text-zinc-805'
              }`}
            >
              <span>{t('tabShippedCount')} ({shippedOrders.length})</span>
              {activeOrderTab === 'shipped' && (
                <motion.div layoutId="orderTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e51923] mt-1" />
              )}
            </button>
            <button
              onClick={() => setActiveOrderTab('completed')}
              className={`pb-1 text-xs font-bold tracking-wider transition-all relative ml-4 ${
                activeOrderTab === 'completed'
                  ? 'text-[#e51923] font-sans font-black'
                  : 'text-zinc-450 hover:text-zinc-805'
              }`}
            >
              <span>{t('tabCompletedCount')} ({completedOrders.length})</span>
              {activeOrderTab === 'completed' && (
                <motion.div layoutId="orderTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e51923] mt-1" />
              )}
            </button>
            <button
              onClick={() => setActiveOrderTab('self')}
              className={`pb-1 text-xs font-bold tracking-wider transition-all relative ml-4 ${
                activeOrderTab === 'self'
                  ? 'text-[#e51923] font-sans font-black'
                  : 'text-zinc-450 hover:text-[#e51923]'
              }`}
            >
              <span>🛒 {t('tabSelfCount')} ({selfOrders.length})</span>
              {activeOrderTab === 'self' && (
                <motion.div layoutId="orderTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e51923] mt-1" />
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShipAll}
              disabled={pendingOrders.length === 0}
              className={`px-3 py-1.5 text-[10px] font-extrabold border rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                pendingOrders.length === 0 
                  ? 'border-zinc-200 text-zinc-350 cursor-not-allowed bg-transparent' 
                  : 'bg-[#e51923] border-transparent text-white hover:bg-red-700 shadow-sm shadow-red-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-white" />
              <span>{t('oneClickShip')}</span>
            </button>
          </div>
        </div>

        {/* Selected queue rendering */}
        {activeOrderTab === 'pending' ? (
          /* PENDING LIST */
          pendingOrders.length === 0 ? (
            <div className="bg-white py-10 rounded-2xl border border-dashed border-zinc-200 text-center flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-zinc-300" />
              <div className="font-bold">{t('pendingOrdersEmpty')}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {pendingOrders.map((order, idx) => (
                <div 
                  key={`${order.id}-${idx}`}
                  className="bg-white border border-zinc-200 rounded-2xl p-3 flex flex-col gap-2 hover:border-[#e51923] transition-all shadow-xs"
                >
                  {/* Order Head */}
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-100 pb-1.5 font-bold">
                    <span className="text-[#e51923]">{t('orderIdLabel')}{order.id}</span>
                    <span className="text-zinc-400">{t('orderDateLabel')}{order.orderDate}</span>
                  </div>

                  {/* Customer details & copy */}
                  <div className="flex flex-col gap-1 text-xs text-zinc-750 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-zinc-900 font-bold">{order.customerName}</span>
                      <span className="text-zinc-500 font-mono font-bold">{order.customerPhone}</span>
                    </div>
                    <div className="text-zinc-600 font-normal flex items-start gap-1">
                      <span className="text-[9px] bg-zinc-100 border border-zinc-200 px-1 py-0.2 rounded-xs mt-0.5 text-zinc-500 font-mono font-bold shrink-0">{t('addressLabelShort')}</span>
                      <span className="leading-relaxed select-all font-medium truncate">{order.shippingAddress}</span>
                    </div>
                  </div>

                  {/* Order items info */}
                  <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl flex gap-2.5 text-xs items-center shadow-xs">
                    <img 
                      src={getProductImage(order.items[0]?.productId, order.items[0]?.image)} 
                      alt=""
                      className="w-8.5 h-8.5 object-cover rounded-md border border-zinc-200 bg-white"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0 pr-2">
                       <h4 className="text-zinc-850 font-sans font-bold truncate text-[11.5px]">{getTranslatedProductName(order.items[0]?.productId || '', order.items[0]?.productName || '')}</h4>
                      <p className="text-zinc-500 text-[10px]">{t('quantityLabelCount').replace('{count}', String(order.items[0]?.quantity))}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-zinc-900 font-bold">${order.totalPrice.toLocaleString()}</span>
                      <span className="text-[9px] text-[#e51923] font-mono font-bold">{t('netProfitLabel')}{order.totalProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Interactive line */}
                  <div className="flex justify-end gap-2 border-t border-zinc-100 pt-1.5">
                    {/* Direct delivery */}
                    <button
                      type="button"
                      onClick={() => onShipOrder(order.id)}
                      className="px-4 py-1.5 bg-[#e51923] text-white hover:bg-red-700 rounded-lg text-[10.5px] font-extrabold tracking-wide flex items-center gap-1 cursor-pointer border border-transparent shadow shadow-red-100 transition-colors"
                    >
                      <Truck className="w-3 h-3 text-white" />
                      <span>{t('shipBtnLabel')}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )
        ) : activeOrderTab === 'shipped' ? (
          /* SHIPPED LIST (IN-TRANSIT) */
          shippedOrders.length === 0 ? (
            <div className="bg-white py-10 rounded-2xl border border-dashed border-zinc-200 text-center flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs shadow-xs">
              <Truck className="w-6 h-6 text-zinc-300 animate-pulse" />
              <div className="font-bold">{t('shippedOrdersEmpty')}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {shippedOrders.map((order, idx) => (
                <div 
                  key={`${order.id}-${idx}`}
                  className="border p-3 flex flex-col gap-2 rounded-2xl transition-all shadow-xs text-left bg-indigo-50/15 border-indigo-150"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-150 pb-1.5 font-bold">
                    <span className="text-zinc-500">{t('orderIdLabel')}{order.id}</span>
                    <span className="text-zinc-500">{t('orderDateLabelDetail')}{order.orderDate}</span>
                  </div>

                  <div className="text-xs text-zinc-650 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 font-bold">
                      <span className="text-zinc-850 font-sans">{order.customerName}</span>
                      <span className="text-zinc-500 font-mono font-medium">({order.customerPhone})</span>
                    </div>
                    <p className="font-normal truncate text-zinc-500 font-sans mt-0.5">{order.shippingAddress}</p>
                  </div>

                  <div className="bg-white p-2 rounded-xl flex gap-2 text-xs items-center border border-zinc-150 shadow-xxs">
                    <img 
                      src={getProductImage(order.items[0]?.productId, order.items[0]?.image)} 
                      alt=""
                      className="w-8.5 h-8.5 object-cover rounded-md border border-zinc-200 bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 pr-2">
                       <h4 className="text-zinc-800 truncate text-[11px] font-sans font-bold">{getTranslatedProductName(order.items[0]?.productId || '', order.items[0]?.productName || '')}</h4>
                      <p className="text-zinc-500 text-[10px] font-medium mt-0.5">{t('quantityLabelCount').replace('{count}', String(order.items[0]?.quantity))}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-zinc-900 font-bold">${order.totalPrice.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-400 font-bold mt-0.5">{t('estProfitAmtLabel')}{order.totalProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer Actions: Button */}
                  <div className="flex justify-between items-center border-t border-zinc-100 pt-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10.5px] font-extrabold text-indigo-750 font-sans">
                        {t('shippedStatusInTransit')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeOrderTab === 'completed' ? (
          /* COMPLETED LIST */
          completedOrders.length === 0 ? (
            <div className="bg-white py-10 rounded-2xl border border-dashed border-zinc-200 text-center flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-zinc-300" />
              <div className="font-bold">{t('completedOrdersEmpty')}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {completedOrders.map((order, idx) => (
                <div 
                  key={`${order.id}-${idx}`}
                  className="border p-3 flex flex-col gap-2 rounded-2xl transition-all shadow-xs text-left bg-emerald-50/15 border-emerald-150"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-150 pb-1.5 font-bold">
                    <span className="text-zinc-500">{t('orderIdLabel')}{order.id}</span>
                    <span className="text-zinc-500">{t('orderTimeLabel')}{order.orderDate}</span>
                  </div>

                  <div className="text-xs text-zinc-650 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 font-bold">
                      <span className="text-zinc-850 font-sans">{order.customerName}</span>
                      <span className="text-zinc-500 font-mono font-medium">({order.customerPhone})</span>
                    </div>
                    <p className="font-normal truncate text-zinc-500 font-sans mt-0.5">{order.shippingAddress}</p>
                  </div>

                  <div className="bg-white p-2 rounded-xl flex gap-2 text-xs items-center border border-zinc-150 shadow-xxs">
                    <img 
                      src={getProductImage(order.items[0]?.productId, order.items[0]?.image)} 
                      alt=""
                      className="w-8.5 h-8.5 object-cover rounded-md border border-zinc-200 bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-zinc-805 truncate text-[11px] font-sans font-bold">{getTranslatedProductName(order.items[0]?.productId || '', order.items[0]?.productName || '')}</h4>
                      <p className="text-zinc-500 text-[10px] font-medium mt-0.5">{t('quantityLabelCount').replace('{count}', String(order.items[0]?.quantity))}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-zinc-900 font-bold">${order.totalPrice.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-600 font-bold mt-0.5">{t('selfBenefitLabel')}{order.totalProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer Actions: Status */}
                  <div className="flex justify-between items-center border-t border-zinc-100 pt-1.5 mt-0.5">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10.5px] font-extrabold text-emerald-750">
                        {t('txnCompletedLabel')}
                      </span>
                    </div>
                    
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-150 font-extrabold px-2.5 py-0.5 rounded-full shadow-3xs uppercase font-sans">
                      {t('txnSettledLabel')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* SELF-PURCHASE ORDERS LIST */
          selfOrders.length === 0 ? (
            <div className="bg-white py-12 rounded-2xl border border-dashed border-zinc-200 text-center flex flex-col items-center justify-center gap-2.5 text-zinc-400 text-xs shadow-xs animate-fadeIn">
              <span className="text-3xl select-none">🛍️</span>
              <div className="font-bold text-zinc-750">{t('selfOrdersEmpty')}</div>
              <p className="text-[10.5px] text-zinc-405 font-medium leading-relaxed max-w-xs px-4">
                {t('selfOrdersEmptyDesc')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 animate-fadeIn">
              <div className="text-[10.5px] bg-red-50/50 border border-red-200/50 rounded-xl p-3 text-zinc-650 leading-relaxed font-semibold text-left font-sans">
                {t('selfPurchaseModeTip')}
              </div>
              {selfOrders.map((order, idx) => (
                <div 
                  key={`${order.id}-${idx}`}
                  className={`bg-white border rounded-2xl p-3 flex flex-col gap-2 hover:border-[#e51923] transition-all shadow-xs text-left ${
                    order.status === 'completed'
                      ? 'border-emerald-250 bg-emerald-50/10'
                      : order.status === 'shipped'
                      ? 'border-indigo-250 bg-indigo-50/10'
                      : 'border-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-100 pb-1.5 font-bold flex-wrap gap-1">
                    <span className="text-[#e51923]">{t('purchaseIdLabel')}{order.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{t('purchaseTimeLabel')}{order.orderDate}</span>
                      {onDeleteOrder && (
                        <div className="flex items-center gap-1.5 pb-0.5">
                          {deletingOrderId === order.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteOrder(order.id);
                                  setDeletingOrderId(null);
                                }}
                                className="px-2 py-0.5 bg-[#e51923] text-white rounded-md text-[10px] font-bold cursor-pointer hover:bg-red-700 transition-colors"
                              >
                                {t('confirm')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingOrderId(null)}
                                className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-md text-[10px] font-bold cursor-pointer hover:bg-zinc-200 transition-colors"
                              >
                                {t('cancel')}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingOrderId(order.id);
                              }}
                              className="px-2 py-0.5 border border-zinc-200 hover:border-[#e51923] text-zinc-400 hover:text-[#e51923] hover:bg-red-50/20 rounded-md text-[10px] font-bold cursor-pointer transition-all"
                            >
                              {t('deleteOrderBtn')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-zinc-750 font-medium whitespace-pre-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 font-sans">{order.customerName}</span>
                      <span className="text-zinc-500 font-mono">({order.customerPhone})</span>
                    </div>
                    <div className="text-zinc-600 font-medium flex items-start gap-1">
                      <span className="text-[8px] bg-zinc-100 border border-zinc-200 px-1 py-px rounded-xs text-zinc-550 select-none font-sans">{t('shippingAddressLabelShort')}</span>
                      <span className="leading-normal flex-1 truncate font-sans">{order.shippingAddress}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl flex gap-2.5 text-xs items-center shadow-xs">
                    <img 
                      src={getProductImage(order.items[0]?.productId, order.items[0]?.image)} 
                      alt=""
                      className="w-8.5 h-8.5 object-cover rounded-md border border-zinc-200 bg-white"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0 pr-2 text-left">
                      <span className="text-[8.5px] bg-red-50 text-[#e51923] border border-red-150 px-1 rounded-sm font-semibold mb-1 inline-block select-none leading-none font-sans">{t('selfStockLabel')}</span>
                      <h4 className="text-zinc-850 font-sans font-bold truncate text-[11.5px] text-left">{getTranslatedProductName(order.items[0]?.productId || '', order.items[0]?.productName || '')}</h4>
                      <p className="text-zinc-500 text-[10px] text-left font-sans">{t('quantityLabelCount').replace('{count}', String(order.items[0]?.quantity))}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-zinc-400 font-medium whitespace-nowrap font-sans">{t('selfStockLabelDesc')}</span>
                      <span className="font-mono text-zinc-900 font-black text-xs sm:text-sm">${order.totalPrice.toLocaleString()}</span>
                      <span className="text-[9px] text-zinc-450 font-bold mt-0.5 select-none text-emerald-600 font-sans">{t('selfAirFreight')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-100 pt-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className={`w-2 h-2 rounded-full ${
                        order.status === 'completed' ? 'bg-emerald-500' :
                        order.status === 'shipped' ? 'bg-indigo-500 animate-pulse' :
                        'bg-amber-500 animate-bounce'
                      }`} />
                      <span className={`text-[10.5px] font-extrabold ${
                        order.status === 'completed' ? 'text-emerald-750' :
                        order.status === 'shipped' ? 'text-indigo-750' :
                        'text-amber-705'
                      }`}>
                        {order.status === 'completed' ? t('selfStatusCompleted') :
                         order.status === 'shipped' ? t('selfStatusShipped') :
                         t('selfStatusPending')}
                      </span>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            onShipOrder(order.id);
                            alert(t('alertSelfShipped'));
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-extrabold tracking-wide flex items-center gap-1 cursor-pointer transition-colors shadow-xs font-sans"
                        >
                          <RefreshCw className="w-3 h-3 text-white animate-spin" />
                          <span>{t('selfActionAlertPrefix')}</span>
                        </button>
                      )}

                      {order.status === 'shipped' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onConfirmReceiveOrder) {
                              onConfirmReceiveOrder(order.id);
                              const transName = getTranslatedProductName(order.items[0]?.productId || '', order.items[0]?.productName || '');
                              alert(t('alertSelfReceived').replace('{name}', transName));
                            }
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold tracking-wide flex items-center gap-1 cursor-pointer transition-colors shadow-sm font-sans"
                        >
                          <Check className="w-3 h-3 text-white" />
                          <span>{t('selfActionConfirmReceipt')}</span>
                        </button>
                      )}

                      {order.status === 'completed' && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-150 font-bold px-2 py-0.5 rounded-full select-none shadow-3xs font-sans">
                          {t('selfCompletedBadge')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* 4. Dropship supplier bulk data export Modal */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsExporting(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 bg-zinc-50 border-b border-zinc-200/85">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#e51923]" />
                  <h3 className="font-sans text-sm font-bold text-zinc-900 tracking-wide">
                    待派发货品一键排单报表
                  </h3>
                </div>
                <button 
                  onClick={() => setIsExporting(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-zinc-700 leading-relaxed font-medium shadow-xs">
                  为您汇总了今日所有收款确认、<b>需要核对发货</b>的订单信息。请点击下方【一键复制】提取大文本，直接发给您的官方货源物流助手，或者导入供货邮箱，即可快速发货！
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Formatted plain-text report</span>
                  <textarea
                    readOnly
                    rows={10}
                    value={generateBulkExportText()}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded-xl p-3 text-xs font-mono text-zinc-700 focus:outline-none focus:border-[#e51923] resize-none font-medium shadow-[#000000]/5 shadow-inner"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setIsExporting(false)}
                    className="px-4 py-2.5 text-xs border border-zinc-300 rounded-xl text-zinc-500 hover:bg-zinc-100 font-bold"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCopyExportText}
                    className="px-6 py-2.5 bg-[#e51923] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-red-100"
                  >
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>一键复制提取并保存</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Store Cash Recharge Modal */}
      <AnimatePresence>
        {showRechargeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={() => setShowRechargeModal(false)} />
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col font-sans"
            >
              <div className="flex items-center justify-between p-4 bg-zinc-50 border-b border-zinc-150">
                <span className="text-sm font-black text-zinc-800 tracking-wide">{t('shopBalanceRecharge')}</span>
                <button 
                  onClick={() => setShowRechargeModal(false)}
                  className="p-1 text-zinc-450 hover:text-zinc-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRechargeSubmit} noValidate className="p-5 flex flex-col gap-4">
                {transactionSuccess ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                    <span className="font-extrabold text-sm text-zinc-800">{t('rechargeSuccess')}</span>
                    <p className="text-zinc-400 text-[11px]">{t('rechargeSuccessDesc')}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">{t('enterRechargeAmount')}</label>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        autoFocus
                        placeholder={t('rechargePlaceholder')}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full text-base font-mono font-bold bg-zinc-50 border border-zinc-300 rounded-xl p-3 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-900 shadow-3xs"
                      />
                    </div>

                    {transactionError && (
                      <span className="text-[11px] text-[#e51923] font-bold text-left block">
                        ⚠️ {transactionError}
                      </span>
                    )}

                    {/* Presets */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wide">{t('quickPresetTitle')}</span>
                      <div className="grid grid-cols-4 gap-2">
                        {[100, 500, 1000, 3000].map(val => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => {
                              setAmountInput(String(val));
                              setTransactionError('');
                            }}
                            className="bg-zinc-50 hover:bg-zinc-100/80 active:scale-95 text-zinc-650 hover:text-zinc-850 py-2 rounded-xl text-xs font-mono font-bold border border-zinc-200 transition-all cursor-pointer"
                          >
                            ${val.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setShowRechargeModal(false)}
                        className="px-4 py-2 hover:bg-zinc-100 text-zinc-500 text-xs font-bold rounded-xl border border-zinc-200 transition-colors cursor-pointer"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#e51923] hover:bg-red-700 active:scale-95 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm shadow-red-100 cursor-pointer"
                      >
                        {t('confirmRechargeBtn')}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Store Cash Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={() => setShowWithdrawModal(false)} />
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col font-sans max-h-[96vh] md:max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 bg-zinc-50 border-b border-zinc-150 sticky top-0 z-10">
                <button
                  type="button"
                  onClick={() => setShowHistoryView(!showHistoryView)}
                  className="px-3 py-1.5 border border-red-200 text-[#e51923] bg-red-50/55 hover:bg-neutral-100 rounded-xl text-[11px] font-black tracking-wide flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showHistoryView ? t('backToWithdrawBtn') : t('withdrawHistoryBtn')}</span>
                </button>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="p-1 text-zinc-450 hover:text-zinc-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showHistoryView ? (
                <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[78vh] md:max-h-[72vh]">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="text-xs font-bold text-zinc-500">{t('allWithdrawHistoryTitle').replace('{count}', String(withdrawHistory.length))}</span>
                  </div>

                  {withdrawHistory.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-zinc-400">
                      <Landmark className="w-8 h-8 opacity-30 animate-pulse" />
                      <span className="text-xs font-bold">{t('noWithdrawHistory')}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {withdrawHistory.map((record) => (
                        <div 
                          key={record.id} 
                          className="bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 rounded-xl p-3.5 flex flex-col gap-2.5 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-zinc-100/50 pb-1.5">
                            <span>{record.id}</span>
                            <span>{record.createdAt}</span>
                          </div>
                          
                          <div className="flex items-baseline justify-between">
                            <span className="text-base font-mono font-black text-amber-600">
                              - ${record.amount.toLocaleString()}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border shadow-3xs ${
                              record.status === '已提交' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : record.status === '已拒绝' 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {record.status === '已提交' 
                                ? t('statusSubmitted') 
                                : record.status === '已拒绝' 
                                  ? t('statusRejected') 
                                  : t('statusApproved')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10.5px] border-t border-dashed border-zinc-200 pt-2 text-zinc-650 font-sans">
                            <div className="flex flex-col">
                              <span className="text-zinc-400 text-[9px] font-bold uppercase">{t('withdrawAccountNameLabel')}</span>
                              <span className="font-extrabold text-zinc-800 mt-0.5">{record.fullName}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-400 text-[9px] font-bold uppercase">{t('settlementAccountLabel')}</span>
                              <span className="font-mono font-bold text-zinc-700 mt-0.5 break-all">{record.bankCard}</span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-zinc-400 text-[9px] font-bold uppercase">{t('settlementBankInfoLabel')}</span>
                              <span className="font-bold text-zinc-700 mt-0.5">
                                {record.bankName} <span className="text-[9.5px] text-zinc-500">({record.branchName} · {record.branchNo})</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowHistoryView(false)}
                    className="mt-4 w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-650 transition-all active:scale-95 cursor-pointer"
                  >
                    {t('backToNewWithdrawBtn')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} noValidate className="p-5 flex flex-col gap-4">
                  {transactionSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                      <span className="font-extrabold text-sm text-zinc-800">{t('withdrawSubmittedTitle')}</span>
                      <p className="text-zinc-400 text-[11px]">{t('withdrawSubmittedDesc')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 text-left">
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">{t('inputWithdrawAmountLabel')}</label>
                          <span className="text-[10px] text-amber-600 font-extrabold">{t('maxWithdrawableLabelText').replace('{amount}', userBalance.toLocaleString())}</span>
                        </div>
                        <input 
                          type="number"
                          step="0.01"
                          required
                          autoFocus
                          placeholder=""
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                          className="w-full text-base font-mono font-bold bg-zinc-50 border border-zinc-300 rounded-xl p-3 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-900 shadow-3xs"
                        />
                      </div>

                      {/* Presets */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wide">{t('quickPresetWithdrawTitle')}</span>
                        <div className="grid grid-cols-4 gap-2">
                          {[100, 500, 1000].map(val => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => {
                                setAmountInput(String(val));
                                setTransactionError('');
                              }}
                              className="bg-zinc-50 hover:bg-zinc-100/80 active:scale-95 text-zinc-650 hover:text-zinc-850 py-2 rounded-xl text-xs font-mono font-bold border border-zinc-200 transition-all cursor-pointer"
                            >
                              ${val.toLocaleString()}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setAmountInput(String(Math.floor(userBalance)));
                              setTransactionError('');
                            }}
                            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-750 font-extrabold py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                          >
                            {t('allWithdrawBtn')}
                          </button>
                        </div>
                      </div>

                      {/* Bank Transfer Details Form as explicitly requested */}
                      <div className="flex flex-col gap-2.5 border-t border-zinc-150 pt-3 text-left">
                        <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">{t('bankAccountInfoTitle')}</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] text-zinc-500 font-bold">{t('bankNameLabel')}</label>
                            <input 
                              type="text"
                              required
                              placeholder={t('bankNamePlaceholder')}
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="text-xs bg-zinc-50 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-805"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] text-zinc-500 font-bold">{t('branchNameLabel')}</label>
                            <input 
                              type="text"
                              required
                              placeholder={t('branchNamePlaceholder')}
                              value={branchName}
                              onChange={(e) => setBranchName(e.target.value)}
                              className="text-xs bg-zinc-50 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-805"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] text-zinc-500 font-bold">{t('branchNoLabel')}</label>
                            <input 
                              type="text"
                              required
                              placeholder={t('branchNoPlaceholder')}
                              value={branchNo}
                              onChange={(e) => setBranchNo(e.target.value)}
                              className="text-xs bg-zinc-50 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-805 font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] text-zinc-500 font-bold">{t('holderNameLabel')}</label>
                            <input 
                              type="text"
                              required
                              placeholder={t('holderNamePlaceholder')}
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="text-xs bg-zinc-50 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-805"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <label className="text-[10px] text-zinc-500 font-bold">{t('bankCardLabel')}</label>
                          <input 
                            type="text"
                            required
                            placeholder={t('bankCardPlaceholder')}
                            value={bankCard}
                            onChange={(e) => setBankCard(e.target.value)}
                            className="text-xs bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-[#e51923] focus:bg-white text-zinc-805 font-mono"
                          />
                        </div>
                      </div>

                      {transactionError && (
                        <span className="text-[11px] text-[#e51923] font-bold text-left block">
                          ⚠️ {transactionError}
                        </span>
                      )}

                      <div className="flex gap-2.5 justify-end pt-3 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setShowWithdrawModal(false)}
                          className="px-4 py-2 hover:bg-zinc-100 text-zinc-500 text-xs font-bold rounded-xl border border-zinc-200 transition-colors cursor-pointer"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm shadow-amber-50 cursor-pointer"
                        >
                          {t('confirmWithdrawBtn')}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// X component helper for local dialog closing
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
