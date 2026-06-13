import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Sparkles, Trash2, MapPin, Phone, User as UserIcon, 
  Wallet, Check, ArrowRight, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Product, Shop, OrderItem, Order, CartItem } from '../types';

import { AppLanguage, translateProduct, TRANSLATIONS } from '../utils/translations';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onAddOrder: (order: Order) => void;
  shop: Shop;
  viewRole: 'merchant' | 'customer';
  onChangeTab: (tab: 'home' | 'pick' | 'cart' | 'profile') => void;
  userCoins?: number;
  onDeductCoins?: (amount: number) => void;
  language?: AppLanguage;
}

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddOrder,
  shop,
  viewRole,
  onChangeTab,
  userCoins = 1500,
  onDeductCoins,
  language = 'zh',
}: CartViewProps) {
  // Translator
  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['zh'][key] || key;
  };

  // Translate product info on the fly
  const localizedCartItems = cartItems.map(item => ({
    ...item,
    product: translateProduct(item.product, language)
  }));
  // Input Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Checkout Order flow state
  const [checkoutComplete, setCheckoutComplete] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(0);
  const [lastCustomerName, setLastCustomerName] = useState('');

  // Coin toggle state
  const [useCoinsDiscount, setUseCoinsDiscount] = useState<boolean>(true); // default true to maximize savings

  // Computations
  const totalItemsCount = localizedCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = localizedCartItems.reduce((acc, item) => acc + (item.product.retailPrice * item.quantity), 0);
  
  // 100 coins = 1 USD discount, max 20% discount
  const maxCoinDiscountInDollars = Math.floor(totalPrice * 0.2);
  const maxCoinDiscountInCoins = maxCoinDiscountInDollars * 100;
  const coinsToDeduct = Math.min(userCoins, maxCoinDiscountInCoins);
  const coinDiscountInDollars = coinsToDeduct / 100;
  const finalPrice = useCoinsDiscount ? totalPrice - coinDiscountInDollars : totalPrice;

  const totalProfit = localizedCartItems.reduce(
    (acc, item) => acc + ((item.product.retailPrice - item.product.costPrice) * item.quantity), 
    0
  );

  const handleSubmitCartOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (localizedCartItems.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      const alertMap: Record<AppLanguage, string> = {
        zh: '请完整填写收货人姓名、手机号和详细收货地址！',
        en: 'Please fill in the recipient\'s name, phone number, and detailed address.',
        es: 'Por Por favor, complete el nombre del destinatario, el teléfono y la dirección detallada.',
        ja: 'お届け先の氏名、電話番号、および詳細な住所を入力してください。',
        ko: '수령인 이름, 전화번호 및 상세 배송 주소를 모두 입력해 주세요.',
        vi: 'Vui lòng điền đầy đủ tên người nhận, số điện thoại và địa chỉ giao hàng chi tiết.'
      };
      alert(alertMap[language] || alertMap['zh']);
      return;
    }

    const orderId = `CRD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems: OrderItem[] = localizedCartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      retailPrice: item.product.retailPrice,
      costPrice: item.product.costPrice,
      image: item.product.image
    }));

    const newOrder: Order = {
      id: orderId,
      shopId: shop.id,
      customerName,
      customerPhone,
      shippingAddress: customerAddress,
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: orderItems,
      totalPrice: finalPrice,
      totalProfit: totalProfit - (useCoinsDiscount ? coinDiscountInDollars : 0),
      status: 'pending',
      isSelfOrder: viewRole === 'merchant'
    };

    onAddOrder(newOrder);
    setCreatedOrderId(orderId);
    setLastOrderTotal(finalPrice);
    setLastCustomerName(customerName);
    
    // Deduct coins from global store
    if (useCoinsDiscount && coinsToDeduct > 0) {
      onDeductCoins?.(coinsToDeduct);
    }
    
    // Reset and close
    onClearCart();
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCheckoutComplete(true);
  };

  if (checkoutComplete) {
    return (
      <div className="flex flex-col gap-5 py-2">
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center gap-5">
          <div className="p-4 bg-red-50 border border-red-200 rounded-full text-[#e51923] animate-bounce shadow-xs">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-sans text-lg font-black text-zinc-900">{t('checkoutSuccessDialogTitle')}</h4>
            <p className="text-xs text-zinc-500 font-mono font-bold">{t('orderNoLabel')}{createdOrderId}</p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-left text-xs text-zinc-700 w-full flex flex-col gap-2.5 shadow-xs">
            <div className="font-sans text-[#e51923] font-bold text-center border-b border-zinc-200 pb-2 mb-1 flex items-center justify-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>{t('checkoutSuccessCheckDetails')}</span>
            </div>
            <p className="font-normal leading-relaxed text-zinc-650" dangerouslySetInnerHTML={{ __html: t('checkoutSuccessStep1') }} />
            <p className="font-normal leading-relaxed text-zinc-650" dangerouslySetInnerHTML={{ __html: t('checkoutSuccessStep2').replace('{price}', lastOrderTotal.toLocaleString()).replace('{name}', lastCustomerName) }} />
            <p className="font-semibold leading-relaxed text-[#e51923]" dangerouslySetInnerHTML={{ __html: t('checkoutSuccessStep3') }} />
          </div>

          <div className="flex flex-col w-full gap-2 mt-2">
            <button
              onClick={() => {
                setCheckoutComplete(false);
                onChangeTab('pick');
              }}
              className="w-full py-3 bg-[#e51923] text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer shadow-sm text-center"
            >
              {t('continueSourcing')}
            </button>
            <button
              onClick={() => {
                setCheckoutComplete(false);
                onChangeTab('profile');
              }}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-bold rounded-xl cursor-pointer text-center"
            >
              {t('viewOrdersInProfile')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-[#e51923] to-red-600 p-5 rounded-2xl text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide">{t('cartTitleText')}</h2>
            <p className="text-[11px] text-red-100/90 font-light">
              {viewRole === 'merchant' ? t('cartSubtitleMerchant') : t('cartSubtitleCustomer')}
            </p>
          </div>
        </div>
      </div>

      {localizedCartItems.length === 0 ? (
        /* Empty Cart View */
        <div className="bg-white py-14 rounded-3xl border border-zinc-200 text-center flex flex-col items-center justify-center gap-4 px-6 shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-[#e51923] rounded-full flex items-center justify-center border border-red-100 shadow-xxs">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-sm font-bold text-zinc-800">{t('cartEmpty')}</h3>
          </div>
          <button
            onClick={() => onChangeTab('pick')}
            className="mt-2.5 px-6 py-2.5 bg-[#e51923] text-white text-xs font-bold rounded-xl hover:bg-red-700 transition shadow-sm cursor-pointer"
          >
            {t('goToPick')}
          </button>
        </div>
      ) : (
        /* Cart List and Form */
        <div className="flex flex-col gap-5">
          
          {/* Cart Header count */}
          <div className="flex items-center justify-between px-1 text-xs font-bold text-zinc-500">
            <span>{t('cartTotalItemsCount').replace('{count}', String(totalItemsCount)).replace('{bonus_text}', '')}</span>
            <button 
              onClick={onClearCart} 
              className="text-zinc-400 hover:text-red-600 font-semibold transition flex items-center gap-1 scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearCartBtn')}</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex flex-col gap-3">
            {localizedCartItems.map((item) => (
              <div 
                key={item.product.id}
                className="bg-white p-3.5 rounded-2xl border border-zinc-200 flex gap-3.5 shadow-xs relative overflow-hidden"
              >
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded-xl border border-zinc-205 flex-shrink-0 bg-zinc-50"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                
                <div className="flex-grow flex flex-col justify-between overflow-hidden">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono font-bold text-zinc-400">{item.product.category} · SKU: {item.product.id}</span>
                    <h4 className="font-sans text-xs font-bold text-zinc-805 truncate pr-5">{item.product.name}</h4>
                  </div>
                  
                  <div className="flex items-end justify-between mt-1">
                    <div className="text-xs font-mono font-bold text-[#e51923]">
                      ¥{item.product.retailPrice.toLocaleString()}
                    </div>
                    
                    {/* Quantity modifier */}
                    <div className="flex items-center gap-2 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50 scale-90">
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-2 text-zinc-500 hover:text-[#e51923] font-black cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-zinc-800 min-w-[16px] text-center">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 text-zinc-500 hover:text-[#e51923] font-black cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="absolute top-3.5 right-3.5 p-1 rounded-full text-zinc-400 hover:text-red-600 transition hover:bg-zinc-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Guidance banner */}
          <div className="bg-red-50 p-4 rounded-2xl text-xs leading-relaxed text-zinc-700 border border-red-200/50">
            <span className="text-[#e51923] font-bold block mb-1">{t('checkoutInstructionTitle')}</span>
            {t('checkoutInstructionDesc')}
          </div>

          {/* Receiver Form Block */}
          <form onSubmit={handleSubmitCartOrder} noValidate className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col gap-4 shadow-xs">
            <h3 className="font-sans font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-1.5 text-xs">
              <MapPin className="w-4 h-4 text-[#e51923]" />
              <span>{t('enterReceiverInfoTitle')}</span>
            </h3>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-zinc-600 font-bold flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#e51923]" />
                <span>{t('receiverInfoNameLabel')} <span className="text-red-500">*</span></span>
              </label>
              <input 
                type="text" 
                required
                placeholder={t('receiverInfoNamePlaceholder')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-zinc-350 rounded-xl p-2.5 text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-[#e51923] font-medium shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-zinc-600 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#e51923]" />
                <span>{t('receiverInfoPhoneLabel')} <span className="text-red-500">*</span></span>
              </label>
              <input 
                type="tel" 
                required
                placeholder={t('receiverInfoPhonePlaceholder')}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white border border-zinc-350 rounded-xl p-2.5 text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-[#e51923] font-medium shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-zinc-600 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e51923]" />
                <span>{t('receiverInfoAddressLabel')} <span className="text-red-500">*</span></span>
              </label>
              <textarea 
                rows={3}
                required
                placeholder={t('receiverInfoAddressPlaceholder')}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-white border border-zinc-350 rounded-xl p-2.5 text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-[#e51923] resize-none font-medium shadow-xs"
              />
            </div>

            <hr className="border-zinc-100 my-1" />

            {/* Interactive Coin deduction controller */}
            {userCoins > 0 && (
              <div className="bg-gradient-to-r from-amber-500/5 to-orange-550/[0.02] border border-amber-300 rounded-xl p-3 flex items-center justify-between shadow-xxs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪙</span>
                  <div className="flex flex-col text-left font-sans">
                    <span className="font-bold text-[11px] text-amber-950">
                      {t('coinDeductionTitle').replace('{state}', useCoinsDiscount ? t('coinDeductionActive') : t('coinDeductionInactive'))}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold" dangerouslySetInnerHTML={{ __html: t('coinDeductionStatusText').replace('{balance}', String(userCoins)).replace('{deduct}', String(coinDiscountInDollars)) }} />
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {useCoinsDiscount && coinsToDeduct > 0 && (
                    <span className="text-[10px] text-amber-950 bg-amber-100 border border-amber-250 font-bold p-0.5 px-2 rounded-lg font-mono animate-pulse">
                      -${coinDiscountInDollars.toLocaleString()}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setUseCoinsDiscount(!useCoinsDiscount)}
                    className={`w-9 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${
                      useCoinsDiscount ? 'bg-[#e51923]' : 'bg-zinc-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                        useCoinsDiscount ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Total prices & profit summary for admins */}
            <div className="flex flex-col gap-1">
              {viewRole === 'merchant' && (
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono font-semibold px-1">
                  <span>{t('merchantCostLabel').replace('{cost}', (totalPrice - totalProfit).toLocaleString())}</span>
                  <span className="text-[#e51923]">{t('merchantProfitLabel').replace('{profit}', (totalProfit - (useCoinsDiscount ? coinDiscountInDollars : 0)).toLocaleString())}</span>
                </div>
              )}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-205 flex justify-between items-center text-xs shadow-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 font-bold">{t('checkoutTotalPayableLabel')}</span>
                  <span className="text-[10px] text-zinc-400">
                    {t('cartTotalItemsCount').replace('{count}', String(totalItemsCount)).replace('{bonus_text}', useCoinsDiscount && coinsToDeduct > 0 ? t('checkoutCoinsUsedText').replace('{coins}', String(coinsToDeduct)) : '')}
                  </span>
                </div>
                <span className="text-lg font-mono text-[#e51923] font-black">
                  ${finalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Form action */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#e51923] hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Check className="w-4 h-4 text-white" />
              <span>{t('confirmPaidSubmitBtn')}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
