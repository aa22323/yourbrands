import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShoppingBag, Globe, ArrowRight, ShieldCheck, Heart, 
  Search, Camera, Zap, Flame, Coins, Trophy, Clock, ChevronRight, Star,
  ShoppingCart, TrendingUp, X
} from 'lucide-react';
import { AppTab, Product } from '../types';
import { ALL_PRODUCTS } from '../data';

import { AppLanguage, translateProduct, TRANSLATIONS } from '../utils/translations';

interface HomeViewProps {
  onNavigate: (tab: AppTab) => void;
  shopName: string;
  onAddToCart: (product: Product) => void;
  onSearch: (query: string) => void;
  userCoins?: number;
  onClaimCoins?: (amount: number) => void;
  language?: AppLanguage;
}

export default function HomeView({ 
  onNavigate, 
  shopName, 
  onAddToCart, 
  onSearch,
  userCoins = 1500,
  onClaimCoins,
  language = 'zh'
}: HomeViewProps) {
  // Translator
  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['zh'][key] || key;
  };

  const getFallbackImage = (category: string) => {
    const fallbacks: Record<string, string> = {
      '臻选腕表': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80',
      '化妆品': 'https://images.unsplash.com/photo-1629152204043-4cccee1aa921?w=600&auto=format&fit=crop&q=80',
      '高级珠宝': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      '匠心皮具': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
      '大师器物': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
      '香水': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
      '家用电器': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      '情趣用品': 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
    };
    return fallbacks[category] || fallbacks['臻选腕表'];
  };

  const getDealProductCategory = (id: string, name: string): string => {
    if (id === 'P1' || id === 'P4' || id === 'P7' || name.includes('腕表') || name.includes('Ro') || name.includes('Patek') || name.includes('手表')) {
      return '臻选腕表';
    }
    if (id === 'P2' || id === 'P5' || name.includes('珠宝') || name.includes('手镯') || name.includes('项链')) {
      return '高级珠宝';
    }
    if (id === 'P3' || id === 'P9' || name.includes('皮具') || name.includes('包') || name.includes('Louis') || name.includes('爱马仕')) {
      return '匠心皮具';
    }
    if (id === 'P6' || id === 'P8' || name.includes('香') || name.includes('Creed') || name.includes('Maison')) {
      return '化妆品';
    }
    return '臻选腕表';
  };
  const [homeSearchText, setHomeSearchText] = useState('');
  
  // High-fidelity active Coins Game state with daily limitations
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showBrandOffersModal, setShowBrandOffersModal] = useState(false);
  const [showGoldListModal, setShowGoldListModal] = useState(false);
  const [showLiveShotsModal, setShowLiveShotsModal] = useState(false);
  const [clearanceImgErr, setClearanceImgErr] = useState(false);
  
  const [activeStreakDay, setActiveStreakDay] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('aliexpress_streak_day');
      return stored ? parseInt(stored, 10) : 4;
    } catch {
      return 4;
    }
  });

  const [lastCheckInDate, setLastCheckInDate] = useState<string>(() => {
    return localStorage.getItem('aliexpress_last_checkin_date') || '';
  });

  const [lastTappedDate, setLastTappedDate] = useState<string>(() => {
    return localStorage.getItem('aliexpress_last_tapped_date') || '';
  });

  const [claimNotification, setClaimNotification] = useState<string | null>(null);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [brandMessage, setBrandMessage] = useState<string | null>(null);
  const [coinGlow, setCoinGlow] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  
  // States for sub-interactions inside new modals
  const [activeListTab, setActiveListTab] = useState<'watches' | 'jewelry' | 'scents'>('watches');
  const [activeLiveIndex, setActiveLiveIndex] = useState(0);
  const [claimedExclusiveCoupon, setClaimedExclusiveCoupon] = useState(false);

  // Real-time rollover active streak day if calendar day rolled over
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastCheckInDate && lastCheckInDate !== todayStr) {
      setActiveStreakDay(prev => {
        const next = prev < 7 ? prev + 1 : 1;
        localStorage.setItem('aliexpress_streak_day', String(next));
        return next;
      });
    }
  }, [lastCheckInDate]);

  useEffect(() => {
    localStorage.setItem('aliexpress_streak_day', String(activeStreakDay));
  }, [activeStreakDay]);

  // State for AliExpress-style automatic carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerSlides = [
    {
      title: t('slide1Title'),
      subtitle: t('slide1Subtitle'),
      tag: t('slide1Tag'),
      image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop&q=80",
      accent: t('slide1Accent')
    },
    {
      title: t('slide2Title'),
      subtitle: t('slide2Subtitle'),
      tag: t('slide2Tag'),
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
      accent: t('slide2Accent')
    },
    {
      title: t('slide3Title'),
      subtitle: t('slide3Subtitle'),
      tag: t('slide3Tag'),
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
      accent: t('slide3Accent')
    }
  ];

  // Auto-play the carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Real-time ticking Countdown for SuperDeals AliExpress style, persistent 82 hours cycle
  const [countdown, setCountdown] = useState({ hours: 82, minutes: 0, seconds: 0 });
  useEffect(() => {
    const CYCLE_MS = 82 * 60 * 60 * 1000; // 82 hours in milliseconds
    const getDeadline = () => {
      try {
        const stored = localStorage.getItem('aliexpress_superdeals_deadline');
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > Date.now()) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error reading countdown deadline', e);
      }
      // If no valid deadline in the future, set a new deadline (82 hours from now)
      const newDeadline = Date.now() + CYCLE_MS;
      try {
        localStorage.setItem('aliexpress_superdeals_deadline', String(newDeadline));
      } catch (e) {
        console.error(e);
      }
      return newDeadline;
    };

    let deadline = getDeadline();

    const updateCountdown = () => {
      const now = Date.now();
      let diff = deadline - now;

      if (diff <= 0) {
        // Countdown ended! Start a brand new 82-hour cycle
        const newDeadline = Date.now() + CYCLE_MS;
        deadline = newDeadline;
        try {
          localStorage.setItem('aliexpress_superdeals_deadline', String(newDeadline));
        } catch (e) {
          console.error(e);
        }
        diff = CYCLE_MS;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCountdown({ hours, minutes, seconds });
    };

    // Calculate immediately and then start interval
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Quick Action category buttons
  const categories = [
    { id: 'all', label: '首推 Explore', tag: 'NEW' },
    { id: 'watches', label: '臻选腕表', tag: 'HOT' },
    { id: 'scents', label: '化妆品', tag: 'LUX' },
    { id: 'jewelry', label: '高级珠宝', tag: 'GEM' },
    { id: 'crafts', label: '大师器物', tag: 'ART' }
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  // Channel Circle Shortcuts (AliExpress icons vibe but luxury Red-Gold)
  const shortcuts = [
    { 
      label: "领金币 Coins", 
      sub: "抵扣 20%", 
      badge: "+20%", 
      icon: <Coins className="w-5 h-5 text-[#e51923]" />, 
      color: "bg-[#FFF1F1] border-[#FFD8D6]" 
    },
    { 
      label: "超级折扣", 
      sub: "震撼低价", 
      badge: "狂欢", 
      icon: <Zap className="w-5 h-5 text-[#e51923] animate-pulse" />, 
      color: "bg-[#FFF1F1] border-[#FFD8D6]" 
    },
    { 
      label: "大牌特惠", 
      sub: "红人独家", 
      badge: "特", 
      icon: <Flame className="w-5 h-5 text-[#e51923]" />, 
      color: "bg-[#FFF1F1] border-[#FFD8D6]" 
    },
    { 
      label: "每日金榜", 
      sub: "名店霸榜", 
      badge: "榜", 
      icon: <Trophy className="w-5 h-5 text-[#e51923]" />, 
      color: "bg-[#FFF1F1] border-[#FFD8D6]" 
    },
    { 
      label: "现场实拍", 
      sub: "专属推荐", 
      badge: "Live", 
      icon: <Star className="w-5 h-5 text-[#e51923]" />, 
      color: "bg-[#FFF1F1] border-[#FFD8D6]" 
    }
  ];

  // SuperDeals list showcasing AliExpress layout
  const dealProducts = [
    {
      id: "P1",
      name: "百达翡丽 Nautilus Ref. 5711 经典钢王蓝盘",
      originalPrice: "$165,000",
      promoPrice: "$98,000",
      discount: "40% OFF",
      rating: "5.0",
      reviewsCount: "420",
      image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=280&auto=format&fit=crop&q=80",
      badge: "今日销冠"
    },
    {
      id: "P2",
      name: "Cartier 卡地亚 Panthère 18K猎豹密镶手镯",
      originalPrice: "$76,000",
      promoPrice: "$49,800",
      discount: "34% OFF",
      rating: "4.9",
      reviewsCount: "135",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=280&auto=format&fit=crop&q=80",
      badge: "高奢名媛"
    },
    {
      id: "P3",
      name: "Hermes 爱马仕 Connaître 限量金扣鸵鸟皮 Birkin",
      originalPrice: "$62,000",
      promoPrice: "$41,500",
      discount: "33% OFF",
      rating: "5.0",
      reviewsCount: "98",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=280&auto=format&fit=crop&q=80",
      badge: "典藏殿堂"
    },
    {
      id: "P4",
      name: "Rolex Daytona Ref.116508 18K黄金 经典绿金迪",
      originalPrice: "$115,000",
      promoPrice: "$78,500",
      discount: "31% OFF",
      rating: "4.9",
      reviewsCount: "310",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=280&auto=format&fit=crop&q=80",
      badge: "尖货爆款"
    },
    {
      id: "P5",
      name: "VCA 梵克雅宝 四叶草中号红玉髓项链 18K金镶嵌",
      originalPrice: "$4,880",
      promoPrice: "$3,980",
      discount: "18% OFF",
      rating: "4.8",
      reviewsCount: "256",
      image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=280&auto=format&fit=crop&q=80",
      badge: "情侣臻选"
    },
    {
      id: "P6",
      name: "Chanel 19系列 经典黑金亮面重磅小羊皮手提袋",
      originalPrice: "$11,500",
      promoPrice: "$8,600",
      discount: "25% OFF",
      rating: "5.0",
      reviewsCount: "188",
      image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=280&auto=format&fit=crop&q=80",
      badge: "女神专享"
    },
    {
      id: "P7",
      name: "Audemars Piguet Royal Oak 八角皇家橡树自动表",
      originalPrice: "$75,000",
      promoPrice: "$49,500",
      discount: "34% OFF",
      rating: "4.9",
      reviewsCount: "142",
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=280&auto=format&fit=crop&q=80",
      badge: "典藏热销"
    },
    {
      id: "P8",
      name: "BYREDO 百瑞德 荒漠孤魂 顶级沙龙限定香氛 100ml",
      originalPrice: "$385",
      promoPrice: "$280",
      discount: "27% OFF",
      rating: "4.7",
      reviewsCount: "389",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=280&auto=format&fit=crop&q=80",
      badge: "迷人沙龙"
    },
    {
      id: "P9",
      name: "Louis Vuitton KEEPALL 全黑皮独行旅行箱包 50号",
      originalPrice: "$4,650",
      promoPrice: "$3,250",
      discount: "30% OFF",
      rating: "4.9",
      reviewsCount: "215",
      image: "https://images.unsplash.com/photo-1627124118123-e4d31159ddf7?w=280&auto=format&fit=crop&q=80",
      badge: "行旅格调"
    }
  ];

  const handleDealProductClick = (dp: typeof dealProducts[0]) => {
    // Parse numeric price from currency string
    const priceNum = parseFloat(dp.promoPrice.replace(/[^\d.]/g, '')) || 1000;
    
    // Calculate 70% cost price, leaving 30% margin as the owner's commission/profit
    const costPrice = Math.round(priceNum * 0.7);
    const profit = Math.round(priceNum - costPrice);
    
    const translatedName = t(`deal_${dp.id}_name`) || dp.name;
    
    const mappedProduct: Product = {
      id: `deal-${dp.id}`,
      name: translatedName,
      image: dp.image,
      category: language === 'zh' ? '限时低价' : 'SuperDeals',
      costPrice: costPrice,
      retailPrice: priceNum,
      profit: profit,
      description: language === 'zh' ? `${translatedName}，官方极奢大促低价货源！` : `${translatedName} - Official exclusive luxury promo deal item.`,
      sku: `SD-${dp.id}`
    };
    
    // Core checkout addition
    onAddToCart(mappedProduct);
    
    // Direct navigate to cart purchase view
    onNavigate('cart');
  };

  return (
    <div className="flex flex-col gap-4 pb-6">      
      {/* ================= AliExpress Style Header Capsule ================= */}
      <div className="flex flex-col gap-2 p-2 rounded-2xl bg-white border border-zinc-200 shadow-sm">
        {/* Search Input bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(homeSearchText);
          }}
          className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200/50 rounded-full pl-3 pr-1 py-1 relative"
        >
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input 
            type="text" 
            placeholder={t('homeSearchPlaceholder')} 
            value={homeSearchText}
            onChange={(e) => setHomeSearchText(e.target.value)}
            className="bg-transparent text-xs text-zinc-900 placeholder-zinc-400 w-full outline-none font-medium"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {homeSearchText && (
              <button
                type="button"
                onClick={() => setHomeSearchText('')}
                className="text-zinc-400 hover:text-[#e51923] focus:outline-none p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Camera className="w-4 h-4 text-zinc-400 hover:text-[#e51923] cursor-pointer" onClick={() => onSearch('')} />
            <button 
              type="submit" 
              className="px-3.5 py-1.5 bg-[#e51923] hover:bg-red-700 text-white text-xs font-semibold rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <span>{t('searchBtn')}</span>
            </button>
          </div>
        </form>

        {/* Hot Horizontal Categories Tags bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                const keywordMap: Record<string, string> = {
                  watches: "表",
                  scents: "香",
                  jewelry: "珠宝",
                  crafts: "器物",
                };
                onSearch(keywordMap[cat.id] || "");
              }}
              className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 border ${
                activeCategory === cat.id 
                  ? 'bg-[#e51923] text-white border-transparent font-semibold shadow-sm' 
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200/60 hover:text-[#e51923]'
              }`}
            >
              <span>
                {cat.id === 'all' 
                  ? t('catAll') 
                  : cat.id === 'watches' 
                    ? t('catWatch') 
                    : cat.id === 'scents' 
                      ? t('catFragrance') 
                      : cat.id === 'jewelry' 
                        ? t('catJewelry') 
                        : cat.id === 'crafts' 
                          ? t('catMaster') 
                          : cat.label}
              </span>
              {cat.tag && (
                <span className="text-[7px] scale-90 font-mono px-1 rounded bg-[#e51923] text-white font-extrabold animate-pulse">
                  {cat.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Modified Size Dynamic Carousel slideshow ================= */}
      <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-sm bg-zinc-950">
        {/* Dark film-style ambient layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-red-600/5 mix-blend-color-burn z-10" />
        
        {/* Auto Slide Banner Frame */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={bannerSlides[currentSlide].image} 
              alt={bannerSlides[currentSlide].title} 
              className="w-full h-full object-cover brightness-[0.6]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {/* Slide Details Overlay */}
            <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end">
              <span className="text-[9px] font-mono font-semibold tracking-widest text-white bg-[#e51923] px-2 py-0.5 rounded w-max mb-1 uppercase">
                {bannerSlides[currentSlide].tag}
              </span>
              <h2 className="font-sans text-base font-bold text-white tracking-wide">
                {bannerSlides[currentSlide].title}
              </h2>
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-zinc-200 font-light italic">
                  {bannerSlides[currentSlide].subtitle}
                </p>
                <span className="text-[9px] text-yellow-300 font-sans font-light opacity-90">
                  {bannerSlides[currentSlide].accent}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicator Dots */}
        <div className="absolute right-3 top-3 z-30 flex gap-1.5 bg-black/45 px-2 py-1 rounded-full border border-white/5">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                currentSlide === i ? 'bg-[#e51923] scale-125 w-3' : 'bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================= AliExpress Shortcut Circles Entry Icons ================= */}
      <div className="grid grid-cols-5 gap-1.5 py-1 px-0.5">
        {shortcuts.map((sc, index) => {
          const transKeys = [
            { label: 'shortcutCoins', sub: 'shortcutCoinsSub' },
            { label: 'shortcutDiscount', sub: 'shortcutDiscountSub' },
            { label: 'shortcutBrands', sub: 'shortcutBrandsSub' },
            { label: 'shortcutCharts', sub: 'shortcutChartsSub' },
            { label: 'shortcutLive', sub: 'shortcutLiveSub' }
          ];
          const keys = transKeys[index];
          const displayLabel = keys ? t(keys.label) : sc.label;
          const displaySub = keys ? t(keys.sub) : sc.sub;
          
          // Badge localizations
          let displayBadge = sc.badge;
          if (index === 1) { // 狂欢
            displayBadge = language === 'zh' ? '狂欢' : language === 'en' ? 'Sale' : language === 'es' ? 'Promo' : language === 'ja' ? '祭り' : language === 'ko' ? '축제' : 'Hội';
          } else if (index === 2) { // 特
            displayBadge = language === 'zh' ? '特' : language === 'en' ? 'Club' : language === 'es' ? 'Club' : language === 'ja' ? '特選' : language === 'ko' ? '특가' : 'Đặc';
          } else if (index === 3) { // 榜
            displayBadge = language === 'zh' ? '榜' : language === 'en' ? 'Top' : language === 'es' ? 'Top' : language === 'ja' ? '1位' : language === 'ko' ? '랭킹' : 'Top';
          }

          return (
            <motion.div 
              key={index}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                if (index === 0) {
                  setShowCoinModal(true);
                } else if (index === 1) {
                  setShowDiscountModal(true);
                } else if (index === 2) {
                  setShowBrandOffersModal(true);
                } else if (index === 3) {
                  setShowGoldListModal(true);
                } else if (index === 4) {
                  setShowLiveShotsModal(true);
                } else {
                  onNavigate('pick');
                }
              }}
              className="flex flex-col items-center text-center cursor-pointer relative min-w-0"
            >
              {/* Top red hot/coupon badge */}
              <span className="absolute -top-1.5 right-0.5 z-25 bg-[#e51923] text-white text-[7px] font-bold px-1 py-0.25 rounded-full scale-90 leading-none shadow-sm whitespace-nowrap">
                {displayBadge}
              </span>
              {/* Rounded glass container */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${sc.color} border border-red-100 shadow-sm mb-1 transition-all hover:brightness-105 shrink-0`}>
                {sc.icon}
              </div>
              <div className="flex flex-col items-center justify-start min-h-[30px] w-full px-0.5 select-none">
                <span className="text-[9px]/[11px] sm:text-[10.5px]/[12px] text-zinc-850 font-black tracking-tight text-center break-words w-full">
                  {displayLabel}
                </span>
                <span className="text-[8px] sm:text-[8.5px] text-[#e51923] font-semibold tracking-tight text-center break-words w-full line-clamp-1 mt-0.5">
                  {displaySub}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ================= AliExpress SuperDeals Live Section ================= */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-[#FFF2F3] via-white to-white border border-red-100 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center p-1.5 bg-[#e51923] rounded-md text-white animate-pulse shadow-sm shadow-red-200">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <h3 className="font-sans text-xs font-black text-zinc-900 tracking-wide uppercase">
              SuperDeals {language === 'zh' ? '限时独家低价' : language === 'en' ? 'Exclusive Flash Deals' : language === 'es' ? 'Ofertas Exclusivas' : language === 'ja' ? '限定タイムセール' : language === 'ko' ? '단독 번개 특가' : 'Đại tiệc giảm giá'}
            </h3>
            {/* Simulated Live status badge */}
            <span className="text-[8px] bg-red-600 text-white px-1.5 rounded-full font-bold">LIVE</span>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold">
            <span className="text-zinc-500 font-light">{t('endsIn')}</span>
            <div className="px-1 py-0.5 rounded bg-[#e51923] text-white font-bold">
              {String(countdown.hours).padStart(2, '0')}
            </div>
            <span className="text-[#e51923] font-bold">:</span>
            <div className="px-1 py-0.5 rounded bg-zinc-800 text-white font-bold">
              {String(countdown.minutes).padStart(2, '0')}
            </div>
            <span className="text-[#e51923] font-bold">:</span>
            <div className="px-1 py-0.5 rounded bg-zinc-800 text-white font-bold">
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* 3 Columns Product Grid exactly like AliExpress screenshot */}
        <div className="grid grid-cols-3 gap-2 py-0.5">
          {dealProducts.map((p) => {
            const tName = t(`deal_${p.id}_name`) || p.name;
            const tBadge = t(`deal_${p.id}_badge`) || p.badge;
            return (
              <motion.div 
                key={p.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDealProductClick(p)}
                className="bg-white rounded-xl overflow-hidden border border-zinc-150 flex flex-col justify-between relative cursor-pointer hover:border-red-300 transition-all shadow-xs"
              >
                {/* Product Badge ribbon */}
                <div className="absolute top-1 left-1 z-20 bg-[#e51923] text-white text-[8px] px-1 py-0.25 rounded font-medium">
                  {tBadge}
                </div>
                
                <div className="relative w-full pt-[100%]">
                  <img 
                    src={p.image} 
                    alt={tName} 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(getDealProductCategory(p.id, p.name));
                    }}
                  />
                </div>

                {/* Product Pricing Details */}
                <div className="p-1.5 flex flex-col gap-0.5 bg-zinc-50/60">
                  <p className="text-[9px] text-zinc-500 line-clamp-1 leading-normal font-medium">
                    {tName}
                  </p>
                  <div className="flex flex-col">
                    {/* Current Discount Price */}
                    <span className="font-bold text-xs text-[#e51923] leading-none font-mono">
                      {p.promoPrice}
                    </span>
                    {/* Original Strikethrough pricing */}
                    <span className="text-[8px] text-zinc-400 line-through font-mono">
                      {p.originalPrice}
                    </span>
                  </div>
                
                {/* Red Discount tag */}
                <div className="flex items-center justify-between mt-1">
                  <span className="bg-[#e51923] text-white text-[8px] font-bold px-1 rounded shadow-xs">
                    {p.discount}
                  </span>
                  <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <ArrowRight className="w-2.5 h-2.5 text-[#e51923]" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>

      {/* ================= Core Sourcing Guarantee values (AliExpress Trust) ================= */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-150/40 border border-zinc-200/80 p-2 rounded-xl text-[9px] text-zinc-650 font-bold">
        <div className="flex items-center gap-1 justify-center border-r border-zinc-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#e51923]" />
          <span>{t('guaranteeAuthentic')}</span>
        </div>
        <div className="flex items-center gap-1 justify-center border-r border-zinc-200">
          <Globe className="w-3.5 h-3.5 text-[#e51923]" />
          <span>{t('guaranteeSandbox')}</span>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <ShoppingBag className="w-3.5 h-3.5 text-[#e51923]" />
          <span>{t('guaranteeDelivery')}</span>
        </div>
      </div>

      {/* ================= Multi-merchant Guides 1 Minute Startup ================= */}
      <div className="relative overflow-hidden p-4 rounded-xl flex flex-col gap-2.5 border border-zinc-200 shadow-sm bg-gradient-to-br from-white to-zinc-50">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
          <Heart className="w-32 h-32 text-[#e51923]" />
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-mono text-[#e51923] font-bold uppercase tracking-wider">{t('guideReadyTitle')}</span>
          <h3 className="font-sans text-xs font-bold text-zinc-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e51923]"></span>
            <span>{t('guideTitle')}</span>
          </h3>
        </div>
        
        <div className="flex flex-col gap-1.5 text-[10.5px]">
          <div className="p-2.5 bg-zinc-100/50 rounded-xl border border-zinc-200/40 flex gap-2 items-start">
            <div className="w-5 h-5 rounded-full bg-red-100 text-[#e51923] flex items-center justify-center text-xs font-bold border border-red-200 flex-shrink-0 mt-0.5">1</div>
            <div className="text-zinc-600 font-normal leading-relaxed">
              <span className="text-zinc-900 font-bold">{t('guideStep1Title')}</span>{t('guideStep1Desc')}
            </div>
          </div>
          <div className="p-2.5 bg-zinc-100/50 rounded-xl border border-zinc-200/40 flex gap-2 items-start">
            <div className="w-5 h-5 rounded-full bg-red-100 text-[#e51923] flex items-center justify-center text-xs font-bold border border-red-200 flex-shrink-0 mt-0.5">2</div>
            <div className="text-zinc-600 font-normal leading-relaxed">
              <span className="text-zinc-900 font-bold">{t('guideStep2Title')}</span>{t('guideStep2Desc')}
            </div>
          </div>
          <div className="p-2.5 bg-zinc-100/50 rounded-xl border border-zinc-200/40 flex gap-2 items-start">
            <div className="w-5 h-5 rounded-full bg-red-100 text-[#e51923] flex items-center justify-center text-xs font-bold border border-red-200 flex-shrink-0 mt-0.5">3</div>
            <div className="text-zinc-600 font-normal leading-relaxed">
              <span className="text-zinc-900 font-bold">{t('guideStep3Title')}</span>{t('guideStep3Desc')}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 爆款直降专区 · Midnight Madness Clearance ================= */}
      {(() => {
        const clearanceProduct = translateProduct(ALL_PRODUCTS[9] || ALL_PRODUCTS[2], language);
        return (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3 relative overflow-hidden">
            {/* Corner Badge */}
            <div className="absolute right-0 top-0 bg-yellow-400 text-amber-950 text-[9px] px-3 py-1 font-bold rounded-bl-xl shadow-xs">
              {t('clearanceLimit')}
            </div>
            
            <div className="flex flex-col gap-0.5 animate-pulse">
              <span className="text-[9px] font-mono font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span>{t('clearanceSub')}</span>
              </span>
              <h4 className="font-sans text-xs font-black text-zinc-900">
                {t('clearanceTitle')}
              </h4>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 relative flex-shrink-0 bg-white rounded-xl border border-orange-200 shadow-xxs overflow-hidden flex items-center justify-center">
                {clearanceImgErr ? (
                  <div className="w-full h-full bg-orange-100/70 flex flex-col items-center justify-center gap-1 p-1 text-center select-none">
                    <Zap className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
                    <span className="text-[8px] font-black text-orange-700 leading-none tracking-tight">SPECIAL</span>
                  </div>
                ) : (
                  <img 
                    src={clearanceProduct.image} 
                    alt="" 
                    className="w-full h-full object-cover text-transparent text-[0px]"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setClearanceImgErr(true);
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-left">
                <span className="text-[9px] text-zinc-400 font-mono font-bold uppercase">{clearanceProduct.category} · Ref.{clearanceProduct.id}</span>
                <h5 className="font-sans text-xs font-bold text-zinc-800 leading-tight truncate">{clearanceProduct.name}</h5>
                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{clearanceProduct.description}</p>
                
                {/* Sale and Progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 font-semibold pr-1">
                    <span>{t('clearanceStock').replace('{pct}', '12')}</span>
                    <span className="text-orange-600 font-bold">{t('clearanceSold').replace('{pct}', '88')}</span>
                  </div>
                  {/* Progress bar info */}
                  <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-orange-500 to-red-500 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-orange-100 pt-3 mt-1">
              <div className="flex flex-col text-left">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-[10px] text-zinc-400 font-bold">{t('clearanceSpecialPrice')}</span>
                  <span className="text-sm font-black font-mono text-[#e51923]">${Math.round(clearanceProduct.retailPrice * 0.75).toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-400 line-through">${clearanceProduct.retailPrice.toLocaleString()}</span>
                </div>
                <span className="text-[9px] text-green-600 font-bold mt-0.5">
                  {t('clearanceSaving').replace('{saving}', Math.round(clearanceProduct.retailPrice * 0.25).toLocaleString())}
                </span>
              </div>
              
              <div className="flex gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => onAddToCart(clearanceProduct)}
                  className="flex-1 sm:flex-initial px-2.5 py-1.5 bg-white border border-red-200 text-[#e51923] hover:bg-red-50 active:bg-red-100 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-xxs whitespace-nowrap flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('addToCart')}</span>
                </button>
                <button
                  onClick={() => {
                    onAddToCart(clearanceProduct);
                    onNavigate('cart');
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-[#e51923] hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-sm shadow-red-100 whitespace-nowrap text-center"
                >
                  {t('buyNow')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 速卖通热销榜单 · AliExpress Hot Trends ================= */}
      {(() => {
        const rankingProducts = ALL_PRODUCTS.slice(4, 7).map(p => translateProduct(p, language));
        const medals = ["🥇", "🥈", "🥉"];
        const medalColors = [
          "from-amber-50 via-white to-white border-amber-200/50",
          "from-zinc-50 via-white to-white border-zinc-200/50",
          "from-orange-50 via-white to-white border-orange-200/50"
        ];
        return (
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="p-1 px-2 bg-red-50 border border-red-200 text-[#e51923] rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 font-bold" />
                </div>
                <h4 className="font-sans text-xs font-black text-zinc-900 uppercase tracking-tight">
                  {t('rankingMainTitle')}
                </h4>
              </div>
              <button 
                onClick={() => onNavigate('pick')}
                className="text-zinc-400 hover:text-zinc-650 text-[10px] font-bold flex items-center gap-0.5"
              >
                <span>{language === 'zh' ? '查看全部' : language === 'en' ? 'View All' : language === 'es' ? 'Ver Todo' : language === 'ja' ? 'すべて見る' : language === 'ko' ? '전체보기' : 'Xem tất cả'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {rankingProducts.map((p, idx) => (
                <div 
                  key={p.id}
                  className={`bg-gradient-to-r ${medalColors[idx]} p-3 rounded-xl border flex items-center gap-3 shadow-xxs`}
                >
                  {/* Medal Place */}
                  <div className="text-lg font-bold font-mono text-center flex-shrink-0 w-8">
                    {medals[idx]}
                  </div>

                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-12 h-12 object-cover rounded-lg border border-zinc-200 bg-white"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(p.category);
                    }}
                  />

                  <div className="flex-grow min-w-0 flex flex-col justify-center">
                    <h5 className="font-sans text-[11.5px] font-bold text-zinc-800 truncate">{p.name}</h5>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10.5px] font-bold text-[#e51923] font-mono">${p.retailPrice.toLocaleString()}</span>
                      <span className="text-[9px] bg-red-50 border border-red-100 text-[#e51923] font-bold px-1 rounded scale-90">
                        {t('rankingRatio').replace('{num}', (9 - idx).toString())}
                      </span>
                    </div>
                  </div>

                  {/* Add action */}
                  <button
                    onClick={() => onAddToCart(p)}
                    className="p-2 bg-white hover:bg-red-50 text-[#e51923] rounded-full border border-zinc-200 hover:border-red-200 cursor-pointer shadow-xxs transition-colors"
                    title={t('addToCart')}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ================= 猜你喜欢 · More to Love / Infinite Exploration Feed ================= */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e51923] animate-ping" />
            <span className="font-sans text-xs font-black text-zinc-950 tracking-wide uppercase">
              {language === 'zh' ? '猜你喜欢 · More To Love' : language === 'en' ? 'More To Love' : language === 'es' ? 'También Te Puede Gustar' : language === 'ja' ? 'おすすめ商品' : language === 'ko' ? '추천 상품' : 'Có thể bạn sẽ thích'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-405 font-bold">
            {language === 'zh' ? '24小时极速安全派送' : language === 'en' ? '24h Safe Delivery' : language === 'es' ? 'Envío rápido y seguro 24h' : language === 'ja' ? '24時間安心スピード配送' : language === 'ko' ? '24시간 고속 안전 배송' : 'Giao hàng an toàn 24h'}
          </span>
        </div>

        {/* 2 Column Bento Grid recommendation items */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          {ALL_PRODUCTS.slice(3, 9).map((p, idx) => {
            const translatedP = translateProduct(p, language);
            const randSale = Math.floor(100 + (parseInt(p.id.split('-')[1]) || idx) * 4.5);
            const randRating = (4.7 + (idx % 3) * 0.1).toFixed(1);
            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl border border-zinc-200 p-3 flex flex-col justify-between hover:border-[#e51923] transition-all shadow-xs relative overflow-hidden group"
              >
                {/* Category small indicator label */}
                <span className="absolute top-2 left-2 z-10 bg-black/45 text-white backdrop-blur-xs text-[8px] px-1.5 py-0.5 rounded-md font-medium tracking-wide">
                  {translatedP.category}
                </span>

                <div className="w-full pt-[100%] rounded-xl overflow-hidden relative border border-zinc-100 bg-zinc-50 flex-shrink-0">
                  <img 
                    src={translatedP.image} 
                    alt={translatedP.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(translatedP.category);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2 mt-2.5">
                  <h4 className="font-sans text-xs font-bold text-zinc-850 line-clamp-2 leading-snug tracking-tight">
                    {translatedP.name}
                  </h4>

                  {/* Rating + Sold bar details */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center text-[9px] text-amber-500 font-bold gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-transparent" />
                      <span>{randRating}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-semibold">
                      {t('soldCount').replace('{count}', randSale.toString())}
                    </span>
                  </div>

                  {/* Pricing tag row with Shipping Tag */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-green-600 bg-green-50 border border-green-100 p-0.5 px-1.5 rounded w-max font-bold">
                      {t('freeShippingLabel')}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xs font-black text-[#e51923]">
                        ${translatedP.retailPrice.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-zinc-400 line-through font-mono">
                        ${Math.round(translatedP.retailPrice * 1.6)}
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons bar inside card */}
                  <div className="flex gap-1.5 mt-1 border-t border-zinc-100 pt-2.5">
                    <button
                      onClick={() => onAddToCart(translatedP)}
                      className="flex-1 py-1.5 bg-zinc-50 border border-zinc-250 hover:bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-700 hover:text-zinc-900 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3 text-zinc-505" />
                      <span>{t('addToCart')}</span>
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(translatedP);
                        onNavigate('cart');
                      }}
                      className="flex-1 py-1.5 bg-[#e51923] hover:bg-red-700 text-white rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer shadow-xxs"
                    >
                      <span>{t('buyNow')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= HIGH FIDELITY GOLD COINS MODAL & MINI GAME ================= */}
      <AnimatePresence>
        {showCoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setShowCoinModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm mr-auto ml-auto bg-gradient-to-b from-[#FFFDF0] via-white to-white rounded-2xl overflow-hidden shadow-2xl z-20 border border-amber-200 p-3.5 flex flex-col gap-2 text-xs font-sans text-zinc-900"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-amber-100 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🪙</span>
                  <span className="font-sans text-amber-955 font-black text-xs tracking-wide">
                    {t('coinHubTitle')}
                  </span>
                </div>
                <button 
                  onClick={() => setShowCoinModal(false)} 
                  className="text-zinc-400 hover:text-zinc-650 p-1 font-bold bg-white/80 border border-zinc-150 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition-all text-[10px]"
                >
                  ✕
                </button>
              </div>

              {/* Balance Widget */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-2.5 text-white text-center shadow-xs relative overflow-hidden">
                <div className="absolute right-2 bottom-[-10px] text-4xl opacity-10 font-bold select-none font-mono">COIN</div>
                <span className="text-[9px] text-amber-100 font-bold tracking-widest uppercase">{t('coinHubMyCoins')}</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight animate-pulse">
                    {userCoins}
                  </span>
                  <span className="font-bold text-[9px] bg-amber-400/30 px-1 py-0.5 rounded-full border border-amber-300/30 text-amber-100">
                    {t('coinHubRedeemable')}
                  </span>
                </div>
                <p className="text-[8.5px] text-[#FFECEE] mt-0.5 font-semibold leading-tight">
                  {t('coinHubDescription')}
                </p>
              </div>

              {/* Active Tapping Mini-Game! */}
              <div className="bg-amber-500/5 rounded-xl p-2.5 border border-amber-200/50 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-amber-900 font-extrabold text-center leading-tight">
                  {t('coinHubTappingGame')}
                </span>
                
                {/* Spinnable click item with scale interaction */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.90 }}
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (lastTappedDate === todayStr) {
                      setClaimNotification(t('coinHubAlreadyClaimed'));
                      setTimeout(() => setClaimNotification(null), 2500);
                      return;
                    }
                    setCoinGlow(true);
                    setTimeout(() => setCoinGlow(false), 200);
                    onClaimCoins?.(50);
                    setLastTappedDate(todayStr);
                    localStorage.setItem('aliexpress_last_tapped_date', todayStr);
                    // Show a quick success floating notification
                    setClaimNotification(t('coinHubEarnedTip'));
                    setTimeout(() => setClaimNotification(null), 1500);
                  }}
                  className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center shadow-md border border-amber-100 cursor-pointer ${
                    coinGlow ? 'brightness-125' : ''
                  } ${lastTappedDate === new Date().toISOString().split('T')[0] ? 'grayscale-[65%] opacity-85' : ''}`}
                >
                  <span className="text-2xl select-none animate-spin" style={{ animationDuration: '8s' }}>🪙</span>
                  <div className="absolute inset-0 rounded-full border border-yellow-105/50 animate-ping opacity-30" />
                </motion.button>

                <span className="text-[8px] text-zinc-500 font-semibold select-none leading-none">
                  {lastTappedDate === new Date().toISOString().split('T')[0] 
                    ? t('coinHubTappingLocked') 
                    : t('coinHubStreakVal').replace('{day}', activeStreakDay.toString())}
                </span>
              </div>

              {/* Weekly Streak challenge */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-zinc-850">{t('coinHubCheckinTitle')}</span>
                <div className="grid grid-cols-7 gap-0.5">
                  {[
                    { day: 1, reward: 100, label: t('coinHubMonday'), state: 'claimed' },
                    { day: 2, reward: 150, label: t('coinHubTuesday'), state: 'claimed' },
                    { day: 3, reward: 200, label: t('coinHubWednesday'), state: 'claimed' },
                    { day: 4, reward: 300, label: t('coinHubThursday'), state: 'current' },
                    { day: 5, reward: 400, label: t('coinHubFriday'), state: 'future' },
                    { day: 6, reward: 500, label: t('coinHubSaturday'), state: 'future' },
                    { day: 7, reward: 800, label: t('coinHubChest'), state: 'chest' },
                  ].map((d) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isAlreadyCheckedInToday = lastCheckInDate === todayStr;

                    const isClaimed = d.day < activeStreakDay || (d.day === activeStreakDay && isAlreadyCheckedInToday);
                    const isToday = d.day === activeStreakDay;
                    const canClaim = isToday && !isAlreadyCheckedInToday;

                    return (
                      <button
                        key={d.day}
                        disabled={!canClaim}
                        onClick={() => {
                          if (canClaim) {
                            onClaimCoins?.(d.reward);
                            setLastCheckInDate(todayStr);
                            localStorage.setItem('aliexpress_last_checkin_date', todayStr);
                            setClaimNotification(t('coinHubCheckinSuccess').replace('{reward}', d.reward.toString()));
                            setTimeout(() => setClaimNotification(null), 3000);
                          }
                        }}
                        className={`p-0.5 flex flex-col items-center justify-between rounded-md border text-center transition-all min-h-10 ${
                          isClaimed 
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                            : isToday
                              ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold scale-102 shadow-xs shadow-amber-200 group relative cursor-pointer'
                              : d.state === 'chest'
                                ? 'bg-red-50 border-red-200 text-red-700 font-semibold cursor-not-allowed'
                                : 'bg-zinc-50 border-zinc-150 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-[7.5px] whitespace-nowrap block scale-90">{d.label}</span>
                        <span className="text-[9px] block my-0.5 leading-none">
                          {isClaimed ? '✅' : d.state === 'chest' ? '🎁' : '🪙'}
                        </span>
                        <span className="text-[7.5px] font-mono leading-none font-bold">+{d.reward}</span>
                        {canClaim && (
                          <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-1 h-1 rounded-full animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra Task List with Real Action Rewards */}
              <div className="flex flex-col gap-1 border-t border-zinc-100 pt-1.5">
                <span className="text-[10px] font-bold text-zinc-850">{t('coinHubTaskTitle')}</span>
                
                <div className="flex flex-col gap-1.5">
                  {/* Task 1 */}
                  <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 border border-zinc-150">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[9.5px] leading-tight text-zinc-800">{t('coinHubTaskDiscoverTitle')}</span>
                      <span className="text-[8px] text-zinc-400 text-left leading-normal">{t('coinHubTaskDiscoverDesc')}</span>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('pick');
                        onClaimCoins?.(300);
                        setShowCoinModal(false);
                        alert(t('coinHubTaskDiscoverSuccess'));
                      }}
                      className="bg-[#e51923] text-white font-bold text-[8.5px] px-2 py-0.5 rounded-md block cursor-pointer hover:bg-red-700 whitespace-nowrap"
                    >
                      {t('coinHubTaskDiscoverBtn')}
                    </button>
                  </div>

                  {/* Task 2 */}
                  <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 border border-zinc-150">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[9.5px] leading-tight text-zinc-800">{t('coinHubTaskShareTitle')}</span>
                      <span className="text-[8px] text-zinc-400 text-left leading-normal">{t('coinHubTaskShareDesc')}</span>
                    </div>
                    <button
                      onClick={() => {
                        onClaimCoins?.(50);
                        setCompletedTasks(prev => ({ ...prev, share: true }));
                        setClaimNotification(t('coinHubTaskShareSuccess'));
                        setTimeout(() => setClaimNotification(null), 3000);
                      }}
                      className={`font-bold text-[8.5px] px-2 py-0.5 rounded-md block transition cursor-pointer whitespace-nowrap ${
                        completedTasks.share 
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      }`}
                      disabled={completedTasks.share}
                    >
                      {completedTasks.share ? t('coinHubTaskShareProgress') : t('coinHubTaskShareBtn')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Overlay notification */}
              <AnimatePresence>
                {claimNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute inset-x-4 bottom-10 z-30 bg-green-50 text-green-800 border border-green-200 text-center p-2 rounded-xl font-bold flex items-center justify-center gap-1 shadow-md animate-bounce"
                  >
                    <span>🎁</span>
                    <span className="text-[9px]">{claimNotification}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowCoinModal(false)}
                className="w-full py-1.5 bg-zinc-900 text-white border border-transparent hover:bg-zinc-800 rounded-xl font-bold font-sans tracking-wide shadow-xs cursor-pointer text-[10px] mt-1"
              >
                {t('coinHubBackToStore')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH FIDELITY SUPER DISCOUNT OVERLAY MODAL ================= */}
      <AnimatePresence>
        {showDiscountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setShowDiscountModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm mr-auto ml-auto bg-gradient-to-b from-[#FFF5F5] via-white to-white rounded-3xl overflow-hidden shadow-2xl z-20 border border-red-100 p-5 flex flex-col gap-4 text-xs font-sans text-zinc-900"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-red-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl animate-bounce">⚡</span>
                  <div className="text-left">
                    <span className="font-sans text-red-700 font-black text-sm tracking-wide block">
                      {t('superDiscountTitle')}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-semibold block">{t('superDiscountSub')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDiscountModal(false)} 
                  className="text-zinc-400 hover:text-zinc-650 p-1 font-bold bg-white/80 border border-zinc-150 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Promo Banner Info */}
              <div className="bg-gradient-to-r from-[#e51923] to-red-500 rounded-2xl p-3 text-white text-left shadow-xs relative overflow-hidden">
                <div className="absolute right-1 bottom-[-10px] text-4xl opacity-10 font-bold select-none font-mono">SALE</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  <div>
                    <span className="text-[10px] text-red-100 font-extrabold tracking-widest uppercase block">
                      {t('superDiscountBannerTag')}
                    </span>
                    <span className="text-[10.5px] font-bold block mt-0.5">
                      {t('superDiscountBannerDesc')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Low-Price Products Container */}
              <div className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1">
                {ALL_PRODUCTS.filter(p => p.retailPrice <= 3500)
                  .sort((a, b) => a.retailPrice - b.retailPrice)
                  .map((p) => {
                    const translatedP = translateProduct(p, language);
                    const originalMockPrice = Math.round(translatedP.retailPrice * 1.5);
                    return (
                      <div 
                        key={translatedP.id} 
                        className="flex gap-2.5 p-2 bg-zinc-50 border border-zinc-150 rounded-xl hover:bg-zinc-100/50 transition-all text-left"
                      >
                        {/* Img with custom fallback */}
                        <div className="w-16 h-16 rounded-lg bg-zinc-200 overflow-hidden shrink-0 border border-zinc-150">
                          <img 
                            src={translatedP.image} 
                            alt={translatedP.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFallbackImage(translatedP.category);
                            }}
                          />
                        </div>

                        {/* Product details info */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-[11px] text-zinc-850 truncate block">
                                {translatedP.name}
                              </span>
                              <span className="shrink-0 bg-red-100 text-red-700 text-[8px] font-black px-1 rounded-sm leading-none py-0.5">
                                {t('superDiscountProductBadge')}
                              </span>
                            </div>
                            <span className="text-[9px] text-zinc-400 block truncate mt-0.5">
                              {translatedP.description || t('superDiscountDescriptionDefault')}
                            </span>
                          </div>

                          {/* Price & Buy triggers */}
                          <div className="flex justify-between items-end mt-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#e51923] font-mono font-black text-xs">
                                ${translatedP.retailPrice.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-zinc-450 line-through font-mono">
                                ${originalMockPrice.toLocaleString()}
                              </span>
                            </div>

                            {/* Direct mini buy / cart buttons */}
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  onAddToCart(translatedP);
                                  setDiscountMessage(t('superDiscountCartSuccess').replace('{name}', translatedP.name.split(' ')[0]));
                                  setTimeout(() => setDiscountMessage(null), 2500);
                                }}
                                className="px-2 py-1 bg-white border border-zinc-250 hover:bg-zinc-50 rounded-md font-bold text-[9px] text-zinc-700 cursor-pointer"
                              >
                                {t('superDiscountAddCartBtn')}
                              </button>
                              <button
                                onClick={() => {
                                  onAddToCart(translatedP);
                                  setShowDiscountModal(false);
                                  onNavigate('cart');
                                }}
                                className="px-2.5 py-1 bg-[#e51923] hover:bg-red-700 text-white rounded-md font-extrabold text-[9px] shadow-xxs cursor-pointer"
                              >
                                {t('superDiscountDirectBuyBtn')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Toast for action feedback inside Super Discount */}
              <AnimatePresence>
                {discountMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute inset-x-5 bottom-12 z-30 bg-red-50 text-red-800 border border-red-200 text-center p-2.5 rounded-xl font-bold flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>🎯</span>
                    <span className="text-[9.5px] leading-snug">{discountMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-transparent rounded-xl font-bold tracking-wide shadow-sm cursor-pointer text-[11px]"
              >
                {t('superDiscountBackBtn')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH FIDELITY BRAND OFFERS OVERLAY MODAL ================= */}
      <AnimatePresence>
        {showBrandOffersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setShowBrandOffersModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm mr-auto ml-auto bg-gradient-to-b from-[#FAF4EC] via-white to-white rounded-3xl overflow-hidden shadow-2xl z-20 border border-amber-300 p-5 flex flex-col gap-4 text-xs font-sans text-zinc-900"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-amber-200 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl animate-pulse">👑</span>
                  <div className="text-left">
                    <span className="font-sans text-amber-900 font-black text-sm tracking-wide block">
                      {t('luxuryBrandsTitle')}
                    </span>
                    <span className="text-[9px] text-[#A77943] font-bold block">{t('luxuryBrandsSub')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBrandOffersModal(false)} 
                  className="text-[#A77943] hover:text-amber-950 p-1 font-bold bg-white/80 border border-amber-200 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Exclusive Interactive Coupon */}
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!claimedExclusiveCoupon) {
                      onClaimCoins?.(500);
                      setClaimedExclusiveCoupon(true);
                      setBrandMessage(t('luxuryBrandsCouponSuccess'));
                      setTimeout(() => setBrandMessage(null), 3500);
                    }
                  }}
                  className={`p-3.5 rounded-2xl flex justify-between items-center border transition-all cursor-pointer overflow-hidden ${
                    claimedExclusiveCoupon 
                      ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                      : "bg-gradient-to-r from-amber-600 via-[#A77943] to-yellow-600 text-white border-amber-450 shadow-md shadow-amber-100"
                  }`}
                >
                  <div className="flex flex-col text-left font-sans">
                    <span className="font-black text-[11px] uppercase tracking-wider block">
                      {claimedExclusiveCoupon ? t('luxuryBrandsCouponClaimed') : t('luxuryBrandsCouponText')}
                    </span>
                    <span className="text-[9px] opacity-80 mt-0.5 font-semibold">
                      {claimedExclusiveCoupon ? t('luxuryBrandsCouponClaimedDesc') : t('luxuryBrandsCouponDesc')}
                    </span>
                  </div>
                  <div className="border-l border-white/20 pl-3 font-mono font-black text-sm tracking-tight shrink-0 text-yellow-101">
                    {claimedExclusiveCoupon ? t('luxuryBrandsCouponClaimedBtn') : "$5"}
                  </div>
                </motion.div>
              </div>

              {/* High End Brand Products Feed */}
              <div className="max-h-64 overflow-y-auto flex flex-col gap-3 pr-1">
                {ALL_PRODUCTS.filter(p => p.retailPrice >= 6000 && p.retailPrice <= 45000)
                  .slice(0, 10)
                  .map((p) => {
                    const translatedP = translateProduct(p, language);
                    const brandOriginalPrice = Math.round(translatedP.retailPrice * 1.45);
                    return (
                      <div 
                        key={translatedP.id} 
                        className="flex gap-2.5 p-2 bg-gradient-to-r from-amber-500/[0.02] to-white border border-amber-200/55 rounded-xl text-left"
                      >
                        <div className="w-16 h-16 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-amber-200/40 relative">
                          <img 
                            src={translatedP.image} 
                            alt={translatedP.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFallbackImage(translatedP.category);
                            }}
                          />
                          <span className="absolute left-0 top-0 bg-amber-550 text-white text-[7px] font-bold px-1 rounded-br-md scale-95 origin-top-left">
                            {t('luxuryBrandsProductBadge')}
                          </span>
                        </div>

                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-[11px] text-zinc-850 truncate block">
                                {translatedP.name}
                              </span>
                            </div>
                            <span className="text-[9px] text-[#A77943] font-semibold block truncate mt-0.5">
                              {translatedP.description || t('luxuryBrandsDescriptionDefault')}
                            </span>
                          </div>

                          <div className="flex justify-between items-end mt-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#e51923] font-mono font-black text-xs">
                                ${translatedP.retailPrice.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-zinc-400 line-through font-mono scale-95">
                                ${brandOriginalPrice.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  onAddToCart(translatedP);
                                  setBrandMessage(t('luxuryBrandsCartSuccess').replace('{name}', translatedP.name.split(' ')[0]));
                                  setTimeout(() => setBrandMessage(null), 2500);
                                }}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-250 rounded-md font-bold text-[9px] text-amber-900 cursor-pointer"
                              >
                                {t('luxuryBrandsAddCartBtn')}
                              </button>
                              <button
                                onClick={() => {
                                  onAddToCart(translatedP);
                                  setShowBrandOffersModal(false);
                                  onNavigate('cart');
                                }}
                                className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-md font-extrabold text-[9px] cursor-pointer"
                              >
                                {t('luxuryBrandsDirectBuyBtn')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Toast notifier inside */}
              <AnimatePresence>
                {brandMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute inset-x-5 bottom-12 z-30 bg-amber-50 text-amber-900 border border-amber-200 text-center p-2.5 rounded-xl font-bold flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>🎁</span>
                    <span className="text-[9.5px]/snug font-sans">{brandMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowBrandOffersModal(false)}
                className="w-full py-2 bg-amber-950 hover:bg-amber-900 text-white border border-transparent rounded-xl font-bold tracking-wide shadow-sm cursor-pointer text-[11px]"
              >
                {t('luxuryBrandsBackBtn')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH FIDELITY DAILY GOLD LIST OVERLAY MODAL ================= */}
      <AnimatePresence>
        {showGoldListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setShowGoldListModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm mr-auto ml-auto bg-gradient-to-b from-[#F2F7F2] via-white to-white rounded-3xl overflow-hidden shadow-2xl z-20 border border-emerald-200 p-5 flex flex-col gap-3.5 text-xs font-sans text-zinc-900"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl animate-bounce">🏆</span>
                  <div className="text-left">
                    <span className="font-sans text-emerald-900 font-black text-sm tracking-wide block">
                      {t('dailyGoldTitle')}
                    </span>
                    <span className="text-[9px] text-[#2E7D32] font-semibold block">{t('dailyGoldSub')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGoldListModal(false)} 
                  className="text-emerald-700 hover:text-emerald-950 p-1 font-bold bg-white/80 border border-emerald-200 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Sub Categories inside Daily Gold List */}
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1 rounded-xl">
                {[
                  { key: 'watches', name: t('dailyGoldTabWatches') },
                  { key: 'jewelry', name: t('dailyGoldTabJewelry') },
                  { key: 'scents', name: t('dailyGoldTabScents') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveListTab(tab.key as any)}
                    className={`py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                      activeListTab === tab.key 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs"
                        : "text-zinc-650 hover:bg-zinc-200/50"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Leaderboard scrollable entries */}
              <div className="max-h-72 overflow-y-auto flex flex-col gap-2.5 pr-1">
                {ALL_PRODUCTS.filter((p) => {
                  if (activeListTab === 'watches') return p.category === 'watches' || p.name.includes('劳力士') || p.name.includes('百达翡丽') || p.name.includes('爱彼');
                  if (activeListTab === 'jewelry') return p.category === 'jewelry' || p.name.includes('宝格丽') || p.name.includes('卡地亚') || p.name.includes('手镯');
                  return p.category === 'scents' || p.category === 'crafts' || p.name.includes('香水') || p.name.includes('香氛') || p.name.includes('大红袍') || p.name.includes('普洱');
                })
                  .slice(0, 5)
                  .map((p, idx) => {
                    const translatedP = translateProduct(p, language);
                    const originalMockPrice = Math.round(translatedP.retailPrice * 1.3);
                    const isTopThree = idx < 3;
                    const rankMedal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️";
                    const score = 99 - idx * 2.5;

                    return (
                      <div 
                        key={translatedP.id} 
                        className={`flex gap-2 p-2 rounded-xl transition-all border text-left scale-100 ${
                          idx === 0 
                            ? "bg-gradient-to-r from-amber-500/[0.04] to-transparent border-amber-300"
                            : "bg-zinc-50 border-zinc-150"
                        }`}
                      >
                        {/* Medal Ranking Frame */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-8 pr-1 font-sans font-black text-sm text-center">
                          <span className="text-lg">{rankMedal}</span>
                          <span className="text-[8.5px] text-zinc-400 mt-0.5">N0.{idx + 1}</span>
                        </div>

                        {/* Img of top ranking list */}
                        <div className="w-14 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                          <img 
                            src={translatedP.image} 
                            alt={translatedP.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFallbackImage(translatedP.category);
                            }}
                          />
                        </div>

                        {/* Title and stats bar */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="font-extrabold text-[11px] text-zinc-900 truncate block">
                              {translatedP.name}
                            </span>
                            
                            {/* Score stats */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-[#2E7D32] font-bold">
                                {t('dailyGoldPopularity')}🔥 {score}%
                              </span>
                              <div className="w-16 bg-zinc-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full" style={{ width: `${score}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-end mt-0.5">
                            <span className="text-[#e51923] font-mono font-black text-xs leading-none">
                              ${translatedP.retailPrice.toLocaleString()}
                            </span>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  onAddToCart(translatedP);
                                  setBrandMessage(t('dailyGoldCartSuccess').replace('{name}', translatedP.name.split(' ')[0]));
                                  setTimeout(() => setBrandMessage(null), 2500);
                                }}
                                className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-md font-bold text-[8.5px] cursor-pointer"
                              >
                                {t('dailyGoldAddCartBtn')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => setShowGoldListModal(false)}
                className="w-full py-2 bg-emerald-900 hover:bg-emerald-850 text-white border border-transparent rounded-xl font-bold tracking-wide shadow-sm cursor-pointer text-[11px]"
              >
                {t('dailyGoldBackBtn')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH FIDELITY LIVE SHOTS OVERLAY MODAL ================= */}
      <AnimatePresence>
        {showLiveShotsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setShowLiveShotsModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm mr-auto ml-auto bg-gradient-to-b from-[#F0F5FA] via-white to-white rounded-3xl overflow-hidden shadow-2xl z-20 border border-blue-200 p-5 flex flex-col gap-4 text-xs font-sans text-zinc-900"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-blue-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl animate-pulse">📷</span>
                  <div className="text-left font-sans">
                    <span className="font-sans text-blue-900 font-black text-sm tracking-wide block">
                      {t('liveShotsTitle')}
                    </span>
                    <span className="text-[9px] text-[#1976D2] font-semibold block">{t('liveShotsSub')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLiveShotsModal(false)} 
                  className="text-blue-700 hover:text-blue-950 p-1 font-bold bg-white/80 border border-blue-150 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Live Image Showroom Display Carousel */}
              {[
                {
                  id: "PP-5711",
                  name: t('deal_P1_name'),
                  pIndex: 2, // mapped real item Fallback
                  weight: "142.6g",
                  colorCode: language === 'zh' ? 'Calibre 324 SC 芯' : language === 'en' ? 'Calibre 324 SC Movement' : language === 'es' ? 'Movimiento Calibre 324 SC' : language === 'ja' ? 'キャリバー 324 SC 搭載' : language === 'ko' ? '칼리버 324 SC 무브먼트' : 'Bộ máy Calibre 324 SC',
                  inspectionNotes: language === 'zh' ? '极佳微距金属丝拉折磨砂质感，金属扣密咬顺滑，机底红蓝轴承颗颗莹润。蓝盘太阳放射纹饱满无偏色。' : language === 'en' ? 'Superb micro-brushed metal hairline satin texture. The folding clasp operates with buttery smoothness. All rubies are vivid; the blue sunburst dial is perfectly uniform.' : language === 'es' ? 'Excelente textura satinada de metal microcepillado. El cierre desplegable funciona con total suavidad. Las joyas del movimiento son vívidas y la esfera azul es uniforme.' : language === 'ja' ? '極上のマイクロサテン仕上げ。折りたたみ式バックルは非常にスムーズに作動。ムーブメントのルビーも鮮やかで、ブルーサンバーストダイヤルは完璧な仕上がり。' : language === 'ko' ? '정교한 마이크로 브러시드 아웃라인 피팅. 폴딩 디플로이언트 버클이 부드럽게 작동합니다. 블루 썬레이 다이얼은 완벽한 색감 정밀도를 보여줍니다.' : 'Kết cấu chải xước micro tuyệt vời. Khóa gập hoạt động cực kỳ mượt mà. Mặt số xanh tia mặt trời hoàn hảo không tì vết.',
                  image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80",
                  liveStatus: language === 'zh' ? '仓库物理通关检验完成 · 准现货' : language === 'en' ? 'Warehouse physical inspection complete · Dispatch Ready' : language === 'es' ? 'Inspección física de almacén completada · Listo para envío' : language === 'ja' ? '倉庫物理検品完了 ・ 即納可能' : language === 'ko' ? '공식 물류 창고 물리 통관 검수 완비 · 즉시 출하 가능' : 'Kiểm tra vật lý lưu kho hoàn tất · Sẵn sàng giao hàng'
                },
                {
                  id: "CARTIER-PANTHERE",
                  name: t('deal_P2_name'),
                  pIndex: 4,
                  weight: "44.2g",
                  colorCode: language === 'zh' ? '18K厚金微雕微密镶' : language === 'en' ? '18K Gold Micro-Pave Diamond Setting' : language === 'es' ? 'Engaste de Diamantes en Oro de 18K' : language === 'ja' ? '18K厚金マイクロパヴェダイヤモンド' : language === 'ko' ? '18K 미세 밀착 다이아몬드 파베' : 'Khảm vi kim cương vàng 18K',
                  inspectionNotes: language === 'zh' ? '通体豹身黄金圆润度优秀，双边精工安全锁扣无虚位。每一粒爪镶水钻均在40倍微距下完成牢固验证，无溢胶残留。' : language === 'en' ? 'The 18K gold panther form is perfectly rounded and sculpted. Dual safety lock triggers firmly with zero play. Each diamond setting was audited under 40x macro with zero glue residue.' : language === 'es' ? 'La forma de pantera en oro de 18 quilates está perfectamente esculpida. El cierre de seguridad funciona firme y sin holguras. Cada diamante ha sido verificado bajo macro 40x.' : language === 'ja' ? '18Kゴールドのパンサーは完璧にラウンドされた彫刻。安全ダブルロックは隙間なく強固に固定。すべての爪留めダイヤは40倍ルーペ検証済み、接着剤痕なし。' : language === 'ko' ? '18K 팬더 바디 실루엣 라운딩 마감이 정말 뛰어납니다. 이중 정밀 잠금 장치가 격차 없이 완벽 맞물립니다. 모든 발물림 다이아몬드는 40배 현미경 검수 완료.' : 'Dáng báo vàng bọc dày tinh tế, khóa bảo hiểm kép chắc chắn. Từng hạt kim cương giả được kiểm tra độ sáng chắc dưới độ phóng đại 40x, không có keo dư.',
                  image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
                  liveStatus: language === 'zh' ? '主理人钦点特推 · 实拍无色差' : language === 'en' ? 'Curator Top Pick · Zero-distortion Studio Reals' : language === 'es' ? 'Selección del Curador · Foto real de estudio sin distorsiones' : language === 'ja' ? 'オーナー推薦限定品 ・ スタジオ実物写真' : language === 'ko' ? '점주 적극 대추천 · 완벽한 실사 구현' : 'Chủ shop đề xuất cao · Ảnh chụp thực tế không lệch màu'
                },
                {
                  id: "ROLEX-116508",
                  name: t('deal_P4_name'),
                  pIndex: 6,
                  weight: "148.5g",
                  colorCode: language === 'zh' ? '经典4130导轮柱芯' : language === 'en' ? 'Classic 4130 Chronograph Calibre' : language === 'es' ? 'Calibre de Cronógrafo Clásico 4130' : language === 'ja' ? '傑作4130クロノグラフムーブメント' : language === 'ko' ? '클래식 4130 크로노그래프 무브먼트' : 'Bộ máy bấm giờ cổ điển 4130',
                  inspectionNotes: language === 'zh' ? '绿金迪面盘微距立体雕刻完美，刻度黄金包边闪耀。计时按键防滑阻尼适中，表带蚝式折扣紧致不刮手。实机已经过24小时多维震荡机测，微弱日差通关。' : language === 'en' ? 'Green sunburst dial 3D index engravings are impeccable. Golden hour borders shine bright. Smooth pusher resistance; Oysterlock buckle is secure and comfortable. Chronometer tests within specs.' : language === 'es' ? 'Esfera verde de sol impecable con índices brillantes en oro. Empujadores de cronógrafo de excelente tacto. Correa Oysterlock firme y segura. Tests de cronómetro conformes.' : language === 'ja' ? 'グリーンサンバーストダイヤルの立体インデックス彫刻。インナーゴールドリングは美しく輝き、プッシャーの押し心地も秀逸。オイスターロックバックルも抜群の質感、振幅日差良好。' : language === 'ko' ? '녹금디 메탈릭 레터링의 디테일과 골드 외곽 림이 완벽합니다. 크로노그래프 버튼 반발력이 부드럽고 오이스터 버클이 단단하게 채워집니다. 24시간 정확도 진동 기계 테스트 패스.' : 'Mặt xanh lá hoàn mỹ, các viền khắc nổi vàng sáng bóng. Nút bấm giờ có cảm giác nhấn đầm tay, khóa dây khít khao không cấn tay. Đã vượt qua kiểm tra máy đo độ chuẩn xác.',
                  image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80",
                  liveStatus: language === 'zh' ? '240小时实机动态测试完毕 · 零缺陷' : language === 'en' ? '240H Dynamic Machine Rig Passed · Zero Defects' : language === 'es' ? 'Pasado test de máquina dinámica de 240H · Cero defectos' : language === 'ja' ? '240時間実稼働ダイナミックテスト完了 ・不具合なし' : language === 'ko' ? '240시간 연속 다이내믹 시뮬레이션 측정 완료 · 무결점 패스' : 'Đã chạy thử máy đo động năng 240 giờ · Không có lỗi kỹ thuật'
                }
              ].map((live, idx) => {
                if (activeLiveIndex !== idx) return null;
                const untranslatedCorrelatedProduct = ALL_PRODUCTS.find(ap => ap.name.includes("百达翡丽") || ap.name.includes("卡地亚") || ap.name.includes("迪")) || ALL_PRODUCTS[live.pIndex];
                const correlatedProduct = untranslatedCorrelatedProduct ? translateProduct(untranslatedCorrelatedProduct, language) : null;
                
                return (
                  <div key={live.id} className="flex flex-col gap-3">
                    {/* Media container */}
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-zinc-200 bg-black/5 group">
                      <img 
                        src={live.image} 
                        alt={live.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-2.5 left-2.5 bg-blue-600 text-white font-extrabold text-[8.5px] px-2 py-0.5 rounded-lg shadow-sm">
                        🔴 LIVE REALS
                      </span>
                    </div>

                    {/* Selector Dots */}
                    <div className="flex justify-center gap-1.5 py-0.5">
                      {[0, 1, 2].map(dot => (
                        <button
                          key={dot}
                          onClick={() => setActiveLiveIndex(dot)}
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                            activeLiveIndex === dot ? "bg-blue-600 scale-125 w-3" : "bg-zinc-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Item Details Specs Grid */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-left flex flex-col gap-1.5">
                      <span className="font-sans font-extrabold text-[11px] text-zinc-900 block truncate">
                        {live.name}
                      </span>
                      
                      {/* Grid labels */}
                      <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-100 py-1.5 text-[9.5px]">
                        <div>
                          <span className="text-zinc-400 block">{t('liveShotsProductWeight')}</span>
                          <span className="font-bold text-zinc-800 font-mono text-[10px]">{live.weight}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">{t('liveShotsProductGrade')}</span>
                          <span className="font-bold text-zinc-800 font-mono text-[10px]">{live.colorCode}</span>
                        </div>
                      </div>

                      {/* Handwritten Vibe Appraisal Notes */}
                      <div className="bg-blue-500/[0.03] border border-blue-100 rounded-lg p-2 flex flex-col gap-1">
                        <span className="text-[#1976D2] font-black text-[9px] block">{t('liveShotsAppraisalTitle')}</span>
                        <p className="text-[9.5px] text-zinc-650 leading-relaxed font-semibold italic">
                          "{live.inspectionNotes}"
                        </p>
                      </div>

                      {/* Status indicator */}
                      <span className="text-[9px] text-[#1976D2] font-black text-center mt-0.5 animate-pulse bg-blue-100/50 p-1 rounded-md">
                        🛡️ {live.liveStatus}
                      </span>
                    </div>

                    {/* Quick checkout elements */}
                    <div className="flex justify-between items-center bg-white mt-1">
                      <div className="flex flex-col text-left">
                        <span className="text-zinc-400 text-[8.5px] leading-none">{t('liveShotsInspectLabel')}</span>
                        <span className="text-lg font-mono font-black text-[#e51923] mt-1 leading-none">
                          ${correlatedProduct ? correlatedProduct.retailPrice.toLocaleString() : "99"}
                        </span>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            if (correlatedProduct) {
                              onAddToCart(correlatedProduct);
                              setBrandMessage(t('liveShotsCartSuccess').replace('{name}', correlatedProduct.name.split(' ')[0]));
                              setTimeout(() => setBrandMessage(null), 2500);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-250 font-bold text-[9.5px] rounded-lg cursor-pointer animate-fade-in"
                        >
                          {t('liveShotsAddCartBtn')}
                        </button>
                        <button
                          onClick={() => {
                            if (correlatedProduct) {
                              onAddToCart(correlatedProduct);
                              setShowLiveShotsModal(false);
                              onNavigate('cart');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[9.5px] rounded-lg shadow-sm cursor-pointer"
                        >
                          {t('liveShotsBuyBtn')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setShowLiveShotsModal(false)}
                className="w-full py-2 bg-blue-900 hover:bg-blue-850 text-white border border-transparent rounded-xl font-bold tracking-wide shadow-sm cursor-pointer text-[11px]"
              >
                {t('liveShotsCloseBtn')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
