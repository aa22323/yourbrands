import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Shield, Coins, Sparkles, Filter, Check, ShoppingCart, 
  MapPin, Phone, User as UserIcon, X, Wallet, Heart, Info, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Product, Shop, OrderItem, Order } from '../types';
import { ALL_PRODUCTS } from '../data';

import { AppLanguage, translateProduct, TRANSLATIONS } from '../utils/translations';

interface ProductSectionProps {
  shop: Shop;
  viewRole: 'merchant' | 'customer';
  onChangeViewRole: (role: 'merchant' | 'customer') => void;
  onToggleProductInStore: (productId: string) => void;
  onAddOrder: (order: Order) => void;
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  language?: AppLanguage;
}

export default function ProductSection({
  shop,
  viewRole,
  onChangeViewRole,
  onToggleProductInStore,
  onAddOrder,
  onAddToCart,
  searchQuery,
  onSearchQueryChange,
  language = 'zh'
}: ProductSectionProps) {
  // Category & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  
  // Checkout Modal State
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [qty, setQty] = useState(1);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [newOrderId, setNewOrderId] = useState<string>('');

  // Categories list
  const categories = ['全部', '臻选腕表', '奢享沙龙香', '高级珠宝', '匠心皮具', '大师器物', '香水', '家用电器', '情趣用品'];

  // Translator
  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['zh'][key] || key;
  };

  const getFallbackImage = (category: string) => {
    const fallbacks: Record<string, string> = {
      '臻选腕表': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80',
      '奢享沙龙香': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
      '高级珠宝': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      '匠心皮具': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
      '大师器物': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
      '香水': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
      '家用电器': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      '情趣用品': 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
    };
    return fallbacks[category] || fallbacks['臻选腕表'];
  };

  // Filter products based on active viewRole and search triggers
  const filteredProducts = useMemo(() => {
    let list = ALL_PRODUCTS;

    // 1. If customer, only show products selected/added by this merchant
    if (viewRole === 'customer') {
      list = list.filter(p => shop.addedProductIds.includes(p.id));
    }

    // 2. Category filtering
    if (selectedCategory !== '全部') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 3. Search query (matches title, id, sku, description, category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Translate each product on-the-fly depending on selected language
    return list.map(item => translateProduct(item, language));
  }, [viewRole, shop.addedProductIds, selectedCategory, searchQuery, language]);

  // Paginated viewing for rendering performance of 1000 products
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, itemsPerPage);
  }, [filteredProducts, itemsPerPage]);

  const hasMore = filteredProducts.length > itemsPerPage;

  const handleLoadMore = () => {
    setItemsPerPage(prev => Math.min(prev + 20, filteredProducts.length));
  };

  const handleOpenCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setQty(1);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setOrderComplete(false);
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;

    if (!customerName || !customerPhone || !customerAddress) {
      alert(t('alertFieldsEmpty'));
      return;
    }

    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItem: OrderItem = {
      productId: checkoutProduct.id,
      productName: checkoutProduct.name,
      quantity: qty,
      retailPrice: checkoutProduct.retailPrice,
      costPrice: checkoutProduct.costPrice,
      image: checkoutProduct.image
    };

    const newOrder: Order = {
      id: orderId,
      shopId: shop.id,
      customerName,
      customerPhone,
      shippingAddress: customerAddress,
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: [orderItem],
      totalPrice: checkoutProduct.retailPrice * qty,
      totalProfit: (checkoutProduct.retailPrice - checkoutProduct.costPrice) * qty,
      status: 'pending',
      isSelfOrder: viewRole === 'merchant'
    };

    onAddOrder(newOrder);
    setNewOrderId(orderId);
    setOrderComplete(true);
  };

  const categoryKeys: Record<string, string> = {
    '全部': 'catAll',
    '臻选腕表': 'catWatch',
    '奢享沙龙香': 'catFragrance',
    '高级珠宝': 'catJewelry',
    '匠心皮具': 'catLeather',
    '大师器物': 'catMaster',
    '香水': 'catPerfume',
    '家用电器': 'catAppliance',
    '情趣用品': 'catAdult'
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* 1000 Items Selector Search Bar and Category Banner */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder={viewRole === 'merchant' ? t('searchWholesalePlaceholder') : t('homeSearchPlaceholder')} 
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              setItemsPerPage(20);
            }}
            className="w-full text-xs placeholder-zinc-400 bg-white border border-zinc-200 rounded-xl px-10 py-3 text-zinc-800 focus:outline-none focus:border-[#e51923] transition-all font-medium shadow-xs"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button 
              onClick={() => { onSearchQueryChange(''); setItemsPerPage(20); }}
              className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rich Dual-Row Grid Category Selector - Perfect wrap matching annotated region */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 rounded-xl bg-zinc-50/50 border border-zinc-200/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setItemsPerPage(20);
              }}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all duration-300 border ${
                selectedCategory === cat
                  ? 'bg-[#e51923] text-white border-transparent shadow-[0_2px_8px_rgba(229,25,35,0.2)] font-black scale-[1.02]'
                  : 'bg-white text-zinc-600 border-zinc-250/70 hover:border-[#e51923]/40 hover:text-zinc-900 shadow-xxs'
              }`}
            >
              {t(categoryKeys[cat] || cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Query count details */}
      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase px-1 font-bold">
        <span>Filtered Catalog density</span>
        <span>{filteredProducts.length} items found</span>
      </div>

      {/* Products Grid */}
      {visibleProducts.length === 0 ? (
        <div className="bg-white py-12 rounded-2xl border border-zinc-200 text-center flex flex-col items-center justify-center gap-3">
          <Filter className="w-8 h-8 text-zinc-300" />
          <div className="text-zinc-500 text-sm font-medium">
            {viewRole === 'customer' 
              ? t('customerEmptyStore') 
              : t('merchantEmptyStore')}
          </div>
          {viewRole === 'customer' && (
            <button
              onClick={() => onChangeViewRole('merchant')}
              className="mt-2 text-xs text-[#e51923] hover:underline font-bold"
            >
              {t('merchantAddTip')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {visibleProducts.map((product, idx) => {
            const isAdded = shop.addedProductIds.includes(product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-white border border-zinc-200 overflow-hidden hover:border-[#e51923] transition-all duration-300 shadow-xs"
              >
                {/* SKU Badges */}
                <div className="absolute left-2 top-2 z-10 flex gap-1 bg-white/95 border border-zinc-200 rounded-md px-1 py-0.5 text-[8px] sm:text-[9px] font-mono text-zinc-550 font-bold shadow-xxs">
                  <span>{product.id}</span>
                </div>

                <div className="absolute right-2 top-2 z-10 bg-[#e51923] text-white rounded-md px-1 py-0.5 text-[8px] sm:text-[9px] font-sans font-bold shadow-xxs">
                  {product.category}
                </div>

                {/* Perfect square aspect image for standard catalog lists */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(product.category);
                    }}
                  />
                </div>

                {/* Body Details */}
                <div className="p-2 sm:p-2.5 flex flex-col gap-1 sm:gap-1.5 flex-grow">
                  <div className="text-[8px] sm:text-[9.5px] font-mono text-zinc-400 font-bold leading-none">
                    SKU: {product.sku}
                  </div>
                  <h3 className="font-sans text-[11px] sm:text-xs md:text-[13px] font-bold text-zinc-900 tracking-wide line-clamp-1 leading-normal group-hover:text-[#e51923] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[9.5px] sm:text-[11px] text-zinc-400 font-normal line-clamp-1 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Multi-perspective pricing matrices */}
                  {viewRole === 'merchant' ? (
                    /* 店主模式: 显示出厂价格,零售指导价,纯利润 */
                    <div className="bg-zinc-50 border border-zinc-200 p-1 sm:p-1.5 rounded-md sm:rounded-lg grid grid-cols-3 gap-0.5 sm:gap-1 text-center shadow-xxs">
                      <div className="flex flex-col justify-center">
                        <span className="text-[7.5px] sm:text-[8px] text-zinc-500 font-medium font-sans">{t('cardSuggestedPrice')}</span>
                        <span className="text-[9.5px] sm:text-[11px] md:text-xs font-mono text-zinc-900 font-bold flex items-center justify-center gap-px">
                          <span className="text-[7.5px] sm:text-[9px] font-sans font-semibold">¥</span>
                          <span>{product.retailPrice.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="flex flex-col justify-center border-x border-zinc-200">
                        <span className="text-[7.5px] sm:text-[8px] text-zinc-400">{t('cardCost')}</span>
                        <span className="text-[9.5px] sm:text-[11px] md:text-xs font-mono text-zinc-500 font-medium flex items-center justify-center gap-px">
                          <span className="text-[7.5px] sm:text-[9px] font-sans">¥</span>
                          <span>{product.costPrice.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[7.5px] sm:text-[8px] text-[#e51923] font-bold">{t('cardProfit')}</span>
                        <span className="text-[9.5px] sm:text-[11px] md:text-xs font-mono text-[#e51923] font-black flex items-center justify-center gap-px">
                          <span className="text-[7.5px] sm:text-[9px] font-sans">¥</span>
                          <span>{(product.retailPrice - product.costPrice).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* 顾客模式: 优雅大方的单一大标价 */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 py-0.5 bg-transparent">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] sm:text-[9px] text-zinc-400 font-medium leading-none">{t('cardCustomerPriceLabel')}</span>
                        <div className="text-xs sm:text-base font-mono text-[#e51923] font-black flex items-baseline gap-px mt-0.5">
                          <span className="text-[8px] sm:text-[10px] font-sans">¥</span>
                          <span>{product.retailPrice.toLocaleString()}</span>
                          <span className="text-[8px] sm:text-[9px] font-sans text-zinc-400 font-light ml-1 line-through">
                            ¥{Math.round(product.retailPrice * 1.5).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-[7.5px] sm:text-[9px] w-fit bg-red-50 text-[#e51923] border border-red-200 px-1.5 py-0.5 rounded-md font-sans font-bold leading-none">
                        {t('cardPostalBadge')}
                      </div>
                    </div>
                  )}

                  {/* Actions depending on role */}
                  <div className="mt-0.5 sm:mt-1">
                    {viewRole === 'merchant' ? (
                      <button
                        onClick={() => onToggleProductInStore(product.id)}
                        className={`w-full py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[9.5px] sm:text-[11px] font-bold cursor-pointer tracking-wider flex items-center justify-center gap-1 transition-all duration-300 ${
                          isAdded 
                            ? 'bg-zinc-100 text-zinc-450 border border-zinc-200' 
                            : 'bg-[#e51923] text-white hover:bg-red-700 font-bold shadow-sm'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3 text-[#e51923]" />
                            <span className="hidden sm:inline">{t('cardButtonListed')}</span>
                            <span className="inline sm:hidden">{t('cardButtonListMobile')}</span>
                          </>
                        ) : (
                          <>
                            <span>{t('cardButtonAdd')}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex gap-1 sm:gap-1.5">
                        <button
                          onClick={() => handleOpenCheckout(product)}
                          className="flex-1 py-1.5 sm:py-2 cursor-pointer bg-red-50 hover:bg-red-100/80 text-[#e51923] border border-red-200 rounded-md sm:rounded-lg text-[9.5px] sm:text-[11px] font-bold tracking-wide transition-all text-center flex items-center justify-center gap-0.5"
                        >
                          <span>{t('cardButtonBuy')}</span>
                        </button>
                        <button
                          onClick={() => onAddToCart(product)}
                          className="flex-1 py-1.5 sm:py-2 cursor-pointer bg-[#e51923] hover:bg-red-700 text-white rounded-md sm:rounded-lg text-[9.5px] sm:text-[11px] font-bold tracking-wide shadow-xs flex items-center justify-center gap-1 transition-all"
                        >
                          <ShoppingCart className="w-3 h-3 text-white" />
                          <span>{t('cardButtonAddToCart')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dynamic Show More Trigger (For 1000 items loading) */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-white hover:bg-zinc-50 text-zinc-650 text-xs rounded-full border border-zinc-300 cursor-pointer transition-colors font-bold hover:text-[#e51923]"
          >
            {t('showMoreProducts')}
          </button>
        </div>
      )}

      {/* 4. Checkout Dialog / Drawer */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            {/* Background Closer */}
            <div className="absolute inset-0" onClick={() => setCheckoutProduct(null)} />

            {/* Modal Body */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white border-t sm:border border-zinc-200 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl z-20 max-h-[92vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Close pin handler */}
              <div className="flex sm:hidden justify-center items-center py-2 bg-zinc-50 border-b border-zinc-100/50">
                <div className="w-10 h-1 bg-zinc-300 rounded-full cursor-pointer" onClick={() => setCheckoutProduct(null)}></div>
              </div>

              {/* Title Header */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 border-b border-zinc-200/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e51923]" />
                  <h3 className="font-sans text-sm font-bold text-zinc-900 tracking-wide">
                    {orderComplete ? t('checkoutTitleSuccess') : t('checkoutTitleForm')}
                  </h3>
                </div>
                <button 
                  onClick={() => setCheckoutProduct(null)}
                  className="p-1 px-1.5 rounded-full hover:bg-zinc-200/60 text-zinc-450 hover:text-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 flex-grow">
                {orderComplete ? (
                  /* Success Screen */
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-full text-[#e51923] animate-bounce shadow-xs">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-sans text-base font-bold text-zinc-900">{t('orderLockedSuccess')}</h4>
                      <p className="text-xs text-zinc-500 font-mono font-bold">{t('orderNoLabel')}{newOrderId}</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-205 p-4 rounded-xl text-left text-xs text-zinc-700 w-full flex flex-col gap-2 shadow-xs">
                      <div className="font-sans text-[#e51923] font-bold text-center border-b border-zinc-200 pb-1.5 mb-1 flex items-center justify-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{t('verifyCheckDetails')}</span>
                      </div>
                      <p className="font-normal leading-relaxed text-zinc-650" dangerouslySetInnerHTML={{ __html: t('checkoutStep1') }} />
                      <p className="font-normal leading-relaxed text-zinc-650" dangerouslySetInnerHTML={{ __html: t('checkoutStep2').replace('{price}', (checkoutProduct.retailPrice * qty).toLocaleString()).replace('{name}', customerName) }} />
                      <p className="font-semibold leading-relaxed text-[#e51923]" dangerouslySetInnerHTML={{ __html: t('checkoutStep3') }} />
                    </div>

                    <button
                      onClick={() => setCheckoutProduct(null)}
                      className="mt-4 px-8 py-2.5 bg-[#e51923] text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer shadow-sm"
                    >
                      {t('backToBrowse')}
                    </button>
                  </div>
                ) : (
                  /* Form View */
                  <form onSubmit={handleSubmitCheckout} className="flex flex-col gap-4">
                    {/* Compact Product Details summary */}
                    <div className="flex gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
                      <img 
                        src={checkoutProduct.image} 
                        alt={checkoutProduct.name} 
                        className="w-16 h-16 object-cover rounded-lg border border-zinc-200 bg-white flex-shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackImage(checkoutProduct.category);
                        }}
                      />
                      <div className="flex flex-col justify-between overflow-hidden">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold">{checkoutProduct.id}</span>
                          <h4 className="font-sans text-xs font-bold text-zinc-800 truncate">{checkoutProduct.name}</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-[#e51923] font-bold">
                            ¥{checkoutProduct.retailPrice.toLocaleString()}
                          </span>
                          {/* Qty changer */}
                          <div className="flex items-center gap-2 border border-zinc-300 rounded-lg p-0.5 bg-white scale-90">
                            <button 
                              type="button"
                              onClick={() => setQty(q => Math.max(1, q - 1))}
                              className="px-1.5 text-zinc-500 hover:text-zinc-900 font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono text-zinc-850 font-bold min-w-4 text-center">{qty}</span>
                            <button 
                              type="button"
                              onClick={() => setQty(q => q + 1)}
                              className="px-1.5 text-zinc-500 hover:text-zinc-900 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-zinc-200" />

                    {/* Offline notification banner as requested */}
                    <div className="bg-red-50 p-3.5 rounded-xl text-xs leading-relaxed text-zinc-700 border border-red-200/60">
                      <span className="text-[#e51923] font-bold block mb-1">{t('paymentGuideTitle')}</span>
                      {t('paymentGuideDesc')}
                    </div>

                    {/* Form Inputs */}
                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-zinc-600 font-bold flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-[#e51923]" />
                          <span>{t('receiverName')} <span className="text-red-500">*</span></span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder={t('placeholderReceiverName')}
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#e51923] font-medium shadow-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-zinc-600 font-bold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#e51923]" />
                          <span>{t('receiverPhone')} <span className="text-red-500">*</span></span>
                        </label>
                        <input 
                          type="tel" 
                          required
                          placeholder={t('placeholderReceiverPhone')}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-zinc-850 placeholder-zinc-400 focus:outline-none focus:border-[#e51923] font-medium shadow-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-zinc-600 font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#e51923]" />
                          <span>{t('receiverAddress')} <span className="text-red-500">*</span></span>
                        </label>
                        <textarea 
                          rows={3}
                          required
                          placeholder={t('placeholderReceiverAddress')}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#e51923] resize-none font-medium shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Order Total Display */}
                    <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 flex justify-between items-center text-xs shadow-xs">
                      <span className="text-zinc-500 font-medium">{t('totalCheckoutAmount')}</span>
                      <span className="text-base font-mono text-[#e51923] font-black">
                        ¥{(checkoutProduct.retailPrice * qty).toLocaleString()}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutProduct(null)}
                        className="px-4 py-2.5 border border-zinc-300 text-zinc-500 rounded-xl hover:bg-zinc-100 hover:text-zinc-805 font-semibold transition-colors"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#e51923] hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span>{t('confirmSubmitOffline')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
