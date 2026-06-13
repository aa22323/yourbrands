import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Copy, Check, Share2, CreditCard, Sparkles } from 'lucide-react';
import { Shop, Product } from '../types';
import { ALL_PRODUCTS } from '../data';
import { AppLanguage, translateProduct, TRANSLATIONS } from '../utils/translations';

const MODAL_LOCALES: Record<string, Record<string, string>> = {
  zh: {
    hubTitle: "我的商品推广枢纽",
    hubSubtitle: "上架自主货源与精准投流",
    emptyTitle: "店铺暂未上架任何商品",
    emptyDesc: "您目前还没有上架任何商品，因此无法使用推广功能，请先前往选品中心上架商品。",
    emptyBtn: "前往选品中心上架",
    balanceLabel: "推广账户余额",
    inputBudgetLabel: "填写投流推广金额：",
    enterAmountPlaceholder: "请输入推广金额",
    allBalanceBtn: "全部余额",
    confirmPromoTitle: "确认已上架推广商品：",
    clickDetailHint: "点击商品查看成本及利润",
    suggestedRetail: "建议零售价",
    collapseDetails: "收起明细 ▲",
    expandDetails: "点击查看 成本与利润 ↴",
    costPrice: "采购成本价",
    merchantProfit: "店主分佣净利",
    profitMargin: "纯毛收益率",
    promoSubmitBtn: "确认消耗余额一键推广全部商品",
    
    errNoProducts: "❌ 请先上架至少一件商品进行推广！",
    errBudgetZero: "❌ 推广预算必须大于 0！",
    errNoBalance: "❌ 您的账户可用余额不足 (当前: ${balance})！请调整推广投流金额。",
    
    shareTitle: "✨【{shopName}】官方特惠精选专属商城✨",
    shareBudgetBonus: "🔥 本期店铺特向总部追加投流 ${budget}，官方正品保障，支持顺丰返点！",
    sharePrice: "特奢入手价",
    shareMainShowroom: "👉 点击主推橱窗，直享最惠出厂价：",
    sharePostal: "🎁 顺丰极速包邮 · 一物一卡正品检测 · 贴心售后保障",
    shareSuccessMsg: "🎉 推广投流成功！已从账户余额中扣除 ${budget}。您的专属商场网址是：\n{link}",
    
    successAlertTitle: "🎉 投流推广启动成功！",
    successAlertDesc: "已从您的可用余额中扣减 ${budget}！该资金已成功作为曝光权重加权！",
    successAlertCopied: "带有本期真实返点参数的【专属推广客流文案与链接】已成功复制到您的系统剪切板。可直接分享至各大社群或朋友圈！",
    gotItBtn: "我知道了"
  },
  en: {
    hubTitle: "My Products Expansion Hub",
    hubSubtitle: "List Your Source Goods & Smart Traffic Boost",
    emptyTitle: "No Listed Products in Your Store",
    emptyDesc: "You haven't added any products to your storefront yet, which in turn disables automatic promotions. Go to the Wholesale section first.",
    emptyBtn: "Go to Wholesale Center",
    balanceLabel: "Promo Hub Balance",
    inputBudgetLabel: "Input Promotion Budget Amount:",
    enterAmountPlaceholder: "Enter promotion amount",
    allBalanceBtn: "All Balance",
    confirmPromoTitle: "Confirm Listed Products to Promote:",
    clickDetailHint: "Click items to view cost and profit margins",
    suggestedRetail: "Retail Price",
    collapseDetails: "Collapse details ▲",
    expandDetails: "Click to inspect cost and net profit ↴",
    costPrice: "Wholesale Cost",
    merchantProfit: "Merchant Net Profit",
    profitMargin: "Net Profit Margin",
    promoSubmitBtn: "Confirm Balance & One-Click Bulk Promote Storefront",
    
    errNoProducts: "❌ Please list at least one product before promoting!",
    errBudgetZero: "❌ Promotion budget must be greater than 0!",
    errNoBalance: "❌ Insufficient store account balance (Current: ${balance})! Please customize your promotion budget.",
    
    shareTitle: "✨【{shopName}】Official Premier Curated Storefront✨",
    shareBudgetBonus: "🔥 This round of shop promotion added ${budget} in direct traffic funding. Official authenticity guaranteed with mail-in rebates!",
    sharePrice: "Special Promo Cost",
    shareMainShowroom: "👉 Open our main catalog to access wholesale rates directly:",
    sharePostal: "🎁 Speed Postal Shipping · Certified Authenticity Box · Devoted Post-Sales Guard",
    shareSuccessMsg: "🎉 Traffic setup success! Deducted ${budget} from your storefront. Your exclusive retail link is:\n{link}",
    
    successAlertTitle: "🎉 Traffic Launch Successful!",
    successAlertDesc: "Successfully debited ${budget} from your account balance as smart exposure points expansion!",
    successAlertCopied: "Your promotional content copy and shopping links featuring realistic commissions tracking parameters have been copied to your clipboard!",
    gotItBtn: "Got it"
  },
  es: {
    hubTitle: "Centro de Promoción de Productos",
    hubSubtitle: "Sincroniza y Promociona con Tráfico Inteligente",
    emptyTitle: "No hay productos en su tienda",
    emptyDesc: "No ha agregado ningún producto a su tienda todavía. Por favor, vaya primero a la pestaña de venta al por mayor.",
    emptyBtn: "Ir a Venta al por Mayor",
    balanceLabel: "Saldo para Promoción",
    inputBudgetLabel: "Presupuesto de Promoción:",
    enterAmountPlaceholder: "Ingrese presupuesto",
    allBalanceBtn: "Todo el Saldo",
    confirmPromoTitle: "Confirmar productos para promocionar:",
    clickDetailHint: "Clic para ver costos y márgenes de ganancia",
    suggestedRetail: "Precio Sugerido",
    collapseDetails: "Ocultar detalles ▲",
    expandDetails: "Clic para inspeccionar costos y margen neto ↴",
    costPrice: "Costo Mayorista",
    merchantProfit: "Ganancia Neta del Vendedor",
    profitMargin: "Porcentaje de Ganancia",
    promoSubmitBtn: "Confirmar Saldo y Promocionar Tienda en un Clic",
    
    errNoProducts: "❌ ¡Sincronice al menos un producto antes de promocionar!",
    errBudgetZero: "❌ ¡El presupuesto de promoción debe ser mayor que 0!",
    errNoBalance: "❌ ¡Saldo insuficiente (Actual: ${balance})! Por favor ajuste el presupuesto.",
    
    shareTitle: "✨ Tienda Exclusiva de Selección Oficial de 【{shopName}】✨",
    shareBudgetBonus: "🔥 ¡Agregamos ${budget} en inversión de tráfico para esta campaña. Autenticidad oficial garantizada!",
    sharePrice: "Precio de Oferta",
    shareMainShowroom: "👉 Acceda a nuestro catálogo principal para tarifas de fábrica:",
    sharePostal: "🎁 Envío Express Asegurado · Tarjeta de Autenticidad Oficial · Garantía Post-venta",
    shareSuccessMsg: "🎉 ¡Promoción exitosa! Se han deducido ${budget}. Su enlace comercial exclusivo es:\n{link}",
    
    successAlertTitle: "🎉 ¡Campaña de Tráfico Iniciada con Éxito!",
    successAlertDesc: "¡Se descontaron ${budget} de su saldo para aumentar la visibilidad de su tienda!",
    successAlertCopied: "¡El texto promocional con su enlace exclusivo de afiliado ha sido copiado al portapapeles con éxito!",
    gotItBtn: "Entendido"
  },
  ja: {
    hubTitle: "マイ店舗・プロモーションセンター",
    hubSubtitle: "商品の自主掲載と精密トラフィック投資",
    emptyTitle: "掲載商品がありません",
    emptyDesc: "現在、ストアに掲載されている商品がないため、宣伝プロモーションを開始できません。卸売センターで商品を追加してください。",
    emptyBtn: "卸売センターへ移動する",
    balanceLabel: "プロモーション用残高",
    inputBudgetLabel: "プロモーション追加予算を入力：",
    enterAmountPlaceholder: "金額を入力してください",
    allBalanceBtn: "全額充当",
    confirmPromoTitle: "プロモーション対象商品を確認する：",
    clickDetailHint: "商品をクリックして卸価格と獲得純利益を確認",
    suggestedRetail: "推奨小売価格",
    collapseDetails: "詳細を閉じる ▲",
    expandDetails: "クリックして卸価格と利益内訳を表示 ↴",
    costPrice: "仕入れ原価",
    merchantProfit: "店舗獲得純利益",
    profitMargin: "粗利（マージン）率",
    promoSubmitBtn: "残高を投入して全商品を一括プロモーションする",
    
    errNoProducts: "❌ プロモーションを開始する前に、商品を掲載してください！",
    errBudgetZero: "❌ 空のプロモーション予算は設定できません！",
    errNoBalance: "❌ 店舗残高が不足しています (現在残高: ${balance})。プロモーション投資額を調整してください。",
    
    shareTitle: "✨【{shopName}】公式ラグジュアリー特別セレクトモール✨",
    shareBudgetBonus: "🔥 今期は公式プロモーション予算 ${budget} を追加投入！100%正規品保証・スピード配送！",
    sharePrice: "特選特別提供価格",
    shareMainShowroom: "👉 プレミアム展示ウィンドウはこちら。工場直送最安値：",
    sharePostal: "🎁 スピード対応全国送料無料 · 正規品個別鑑定証明付 · 安心アフターセグメント保証",
    shareSuccessMsg: "🎉 プロモーション設定完了！店舗残高から ${budget} を差し引きました。店舗URL：\n{link}",
    
    successAlertTitle: "🎉 トラフィックの追加買い付けに成功！",
    successAlertDesc: "店舗残高からプロモーション枠 ${budget} 分の枠支払いを実行し、お薦め度加給が完了しました。",
    successAlertCopied: "本期の販売紹介キートラック引数を持つ【特定宣真リンク付のセールスコピータグ】をシステムクリップボードにコピーしました！",
    gotItBtn: "了解しました"
  },
  ko: {
    hubTitle: "내 상품 홍보 및 광고 센터",
    hubSubtitle: "독자 상품 목록 구성 및 정밀 트래픽 투입",
    emptyTitle: "등록된 상점 품목이 없습니다",
    emptyDesc: "현재 상점에 동기화된 상품이 없어 프로모션 기능을 사용할 수 없습니다. 대행 센터로 이동하세요.",
    emptyBtn: "도매 에이전시로 이동",
    balanceLabel: "광고 프로모션 잔액",
    inputBudgetLabel: "광고 투입 금액 설정:",
    enterAmountPlaceholder: "금액 입력",
    allBalanceBtn: "전체 잔액",
    confirmPromoTitle: "홍보 광고 진행할 품목:",
    clickDetailHint: "상품을 클릭해 원가 및 마진 구조 확인",
    suggestedRetail: "권장 소비자 가격",
    collapseDetails: "정보 접기 ▲",
    expandDetails: "클릭하여 도매가 및 점주 순리익 보기 ↴",
    costPrice: "도매 원가",
    merchantProfit: "점주 정산 순리익",
    profitMargin: "순수익 마진 비율",
    promoSubmitBtn: "잔액 소모하여 전체 상품 원클릭 일괄 프로모션",
    
    errNoProducts: "❌ 프로모션을 시작하기 전에 최소 1개 상품을 상점에 올리세요!",
    errBudgetZero: "❌ 프로모션 예산은 0보다 커야 합니다!",
    errNoBalance: "❌ 보유한 가용 잔액이 부족합니다 (현재: ${balance}). 금액을 재설정해 주세요.",
    
    shareTitle: "✨【{shopName}】공식 인증 특별 셀렉트 스토어✨",
    shareBudgetBonus: "🔥 이번 특별 캠페인으로 광고 예산 ${budget}이 추가로 투입되었습니다. 안심 품질 보장!",
    sharePrice: "최종 특별 혜택가",
    shareMainShowroom: "👉 메인 컬렉션을 확인하고 최저 유통가로 바로 진입하세요:",
    sharePostal: "🎁 안전 신속 우편 배송 · 일대일 감정 인증 카드 제공 · 특별 사후 지원 혜택",
    shareSuccessMsg: "🎉 광고 캠페인 가동 완료! 가용 잔액에서 ${budget}이 차감되었습니다. 스토어 주소는:\n{link}",
    
    successAlertTitle: "🎉 스마트 광고 트래픽 증량 성공!",
    successAlertDesc: "가용 잔액에서 ${budget}만큼 차감되었으며 해당 금액이 노출 지수로 전환되었습니다!",
    successAlertCopied: "추적 파라미터가 적용된 [스페셜 홍보 문안과 공유 쇼핑 URL]이 고객님의 클립보드에 바로 복사되었습니다!",
    gotItBtn: "확인 완료"
  },
  vi: {
    hubTitle: "Trung Tâm Quảng Bá Cửa Hàng",
    hubSubtitle: "Đăng bán sản phẩm & Kích hoạt Traffic thông minh",
    emptyTitle: "Chưa có sản phẩm được đăng bán",
    emptyDesc: "Cửa hàng của bạn hiện chưa có sản phẩm nào, vui lòng đăng bán sản phẩm tại Trung tâm Bán Sỉ trước.",
    emptyBtn: "Đi tới Trung tâm Bán Sỉ",
    balanceLabel: "Số dư tài khoản quảng cáo",
    inputBudgetLabel: "Nhập số tiền ngân sách quảng cáo:",
    enterAmountPlaceholder: "Nhập số tiền",
    allBalanceBtn: "Tất cả số dư",
    confirmPromoTitle: "Chọn sản phẩm đăng ký quảng cáo:",
    clickDetailHint: "Bấm vào sản phẩm để xem giá gốc và lợi nhuận",
    suggestedRetail: "Giá Bán Lẻ Đề Xuất",
    collapseDetails: "Thu gọn chi tiết ▲",
    expandDetails: "Xem chi tiết vốn và lợi nhuận ↴",
    costPrice: "Giá Sỉ Gốc",
    merchantProfit: "Lợi Nhuận CTV Nhận",
    profitMargin: "Tỷ Suất Lợi Nhuận",
    promoSubmitBtn: "Xác nhận ngân sách & Kích hoạt quảng cáo toàn bộ sản phẩm",
    
    errNoProducts: "❌ Vui lòng có ít nhất một sản phẩm để quảng cáo!",
    errBudgetZero: "❌ Ngân sách quảng cáo phải lớn hơn 0!",
    errNoBalance: "❌ Số dư tài khoản không đủ (Hiện tại: ${balance})! Vui lòng điều chỉnh ngân sách.",
    
    shareTitle: "✨ Cửa Hàng Tuyển Chọn Chính Hãng 【{shopName}】✨",
    shareBudgetBonus: "🔥 Đợt này cửa hàng hỗ trợ thêm ngân sách quảng cáo ${budget}, đảm bảo chính hãng 100%!",
    sharePrice: "Giá Sốc Ưu Đãi",
    shareMainShowroom: "👉 Nhấp vào tủ kính trưng bày để mua lẻ với giá gốc cực rẻ:",
    sharePostal: "🎁 Giao Hàng Miễn Phí Hoả Tốc · Thẻ Kiểm Định Chính Hãng · Chăm Sóc Hậu Mãi Chu Đáo",
    shareSuccessMsg: "🎉 Thiết lập thành công! Đã trừ số dư ${budget}. Link cửa hàng chuyên dụng là:\n{link}",
    
    successAlertTitle: "🎉 Kích Hoạt Chiến Dịch Thành Công!",
    successAlertDesc: "Đã khấu trừ ${budget} từ số dư của bạn để nâng cao mức độ tiếp cận khách hàng!",
    successAlertCopied: "Nội dung quảng cáo chứa liên kết độc quyền chính xác của cửa hàng đã được sao chép vào bộ nhớ tạm!",
    gotItBtn: "Đã hiểu"
  }
};

interface MyShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
  onNavigate: (tab: 'home' | 'pick' | 'cart' | 'profile') => void;
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  language?: AppLanguage;
}

export default function MyShopModal({ 
  isOpen, 
  onClose, 
  shop, 
  onNavigate, 
  userBalance, 
  onDeductBalance,
  language = 'zh'
}: MyShopModalProps) {
  const t = (key: string, replacements?: Record<string, string | number>) => {
    let text = MODAL_LOCALES[language]?.[key] || MODAL_LOCALES['zh'][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // Filter products that are currently listed in this shop
  const rawListed = ALL_PRODUCTS.filter(p => shop.addedProductIds.includes(p.id));
  const listedProducts = rawListed.map(p => translateProduct(p, language));

  // Selected products for promotion
  const [selectedPromoIds, setSelectedPromoIds] = useState<string[]>([]);
  
  // Expanded product ID for showing cost price and profit
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  
  // Promotion budget state input
  const [promoBudget, setPromoBudget] = useState<number>(50);
  
  // Success feedback state
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize selection state to all listed products
  useEffect(() => {
    setSelectedPromoIds(listedProducts.map(p => p.id));
  }, [shop.addedProductIds]);

  const getShareLink = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?shopId=${shop.id}`;
  };

  const handleExecutePromotion = () => {
    // 1. Validation checks
    if (selectedPromoIds.length === 0) {
      setErrorMsg(t('errNoProducts'));
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    if (promoBudget <= 0) {
      setErrorMsg(t('errBudgetZero'));
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    if (promoBudget > userBalance) {
      setErrorMsg(t('errNoBalance', { balance: userBalance.toLocaleString() }));
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    // 2. Perform balance deduction
    onDeductBalance(promoBudget);

    // 3. Prepare copy template automatically incorporating the actual promo funding
    const activeProducts = listedProducts.filter(p => selectedPromoIds.includes(p.id));
    const promoLink = getShareLink();
    
    let textToCopy = t('shareTitle', { shopName: shop.name }) + '\n';
    textToCopy += t('shareBudgetBonus', { budget: promoBudget.toLocaleString() }) + '\n\n';
    activeProducts.forEach((p, idx) => {
      textToCopy += `${idx + 1}. 💎 ${p.name}\n   ✦ ${t('sharePrice')}: $${p.retailPrice.toLocaleString()}\n\n`;
    });
    textToCopy += t('shareMainShowroom') + `\n🔗 ${promoLink}\n\n`;
    textToCopy += t('sharePostal');

    // 4. Try copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 4500);
      });
    } else {
      alert(t('shareSuccessMsg', { budget: promoBudget, link: promoLink }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      {/* Background click to dismiss overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl z-20 border border-zinc-150 p-6 flex flex-col gap-5 text-xs font-sans text-zinc-900 h-[92vh] max-h-[780px]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#e51923] p-2 rounded-2xl text-white shadow-sm shadow-red-200">
              <ShoppingBag className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div className="text-left font-sans">
              <span className="text-zinc-950 font-black text-sm tracking-wide block font-sans">
                {t('hubTitle')}
              </span>
              <span className="text-[10px] text-zinc-400 block font-semibold">{t('hubSubtitle')}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-700 p-1 font-bold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Dynamic content scroll frame */}
        <div className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-4.5 scrollbar-none">
          {listedProducts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-20/40 border border-zinc-150 flex items-center justify-center text-2xl select-none">
                🛖
              </div>
              <div className="max-w-[240px]">
                <h5 className="font-extrabold text-zinc-805 text-sm font-sans">{t('emptyTitle')}</h5>
                <p className="text-[10.5px] text-zinc-400 font-light leading-relaxed mt-1.5 font-sans">
                  {t('emptyDesc')}
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('pick');
                }}
                className="mt-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 active:scale-95 text-white font-extrabold text-[11px] rounded-xl shadow-md transition-all cursor-pointer font-sans"
              >
                {t('emptyBtn')}
              </button>
            </div>
          ) : (
            <>
              {/* Account Balance and Budget Input Configuration Console */}
              <div className="bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-transparent p-4 rounded-2xl border border-amber-500/15 text-left flex flex-col gap-3.5 shrink-0 shadow-3xs">
                <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💰</span>
                    <span className="text-[11px] text-zinc-700 font-extrabold font-sans">{t('balanceLabel')}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-amber-700 bg-white border border-amber-200/65 px-2.5 py-0.5 rounded-lg shadow-2xl">
                    ${userBalance.toLocaleString()}
                  </span>
                </div>
                
                {/* Custom Budget Selection */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-sans font-bold text-zinc-800">
                      {t('inputBudgetLabel')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold font-mono text-xs">$</span>
                      <input 
                        type="number" 
                        value={promoBudget === 0 ? '' : promoBudget}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          setPromoBudget(val);
                        }}
                        className="w-full bg-white border border-zinc-250 rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#e51923] focus:border-transparent text-zinc-900 shadow-3xs"
                        placeholder={t('enterAmountPlaceholder')}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setPromoBudget(userBalance)}
                      className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-[10px] rounded-xl shrink-0 cursor-pointer active:scale-95 transition-all shadow-xs font-sans"
                    >
                      {t('allBalanceBtn')}
                    </button>
                  </div>
                  
                  {/* Preset Real Cash Quick Chips */}
                  <div className="flex gap-2 justify-between">
                    {[50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (preset <= userBalance) {
                            setPromoBudget(preset);
                          } else {
                            setPromoBudget(userBalance);
                          }
                        }}
                        className={`flex-1 text-center py-1.5 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                          promoBudget === preset 
                            ? 'bg-amber-500/10 border-amber-400 text-amber-950 font-black' 
                            : 'bg-white border-zinc-200 text-zinc-550 hover:bg-zinc-50'
                        }`}
                      >
                        ${preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Listed Products (with Image & Info) */}
              <div className="flex flex-col gap-2 text-left">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">
                  <span className="font-sans">{t('confirmPromoTitle')}</span>
                  <span className="text-[9px] text-[#e51923] normal-case bg-red-50 px-1 py-0.5 rounded-sm font-sans">
                    {t('clickDetailHint')}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {listedProducts.map((p) => {
                    const isExpanded = expandedProductId === p.id;
                    return (
                      <div 
                        key={p.id}
                        className="flex flex-col bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden transition-all duration-200"
                      >
                        {/* Interactive Main Row */}
                        <div 
                          onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                          className="flex gap-3.5 p-2.5 items-center transition-all hover:bg-zinc-100/60 cursor-pointer select-none"
                        >
                          {/* Product Image */}
                          <div className="w-11 h-11 rounded-lg bg-white overflow-hidden border border-zinc-200 shrink-0 shadow-3xs">
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 pr-1 text-left">
                            <span className="font-extrabold text-[11px] text-zinc-900 block truncate">
                              {p.name}
                            </span>
                            <span className="text-[9.5px] text-zinc-450 block truncate font-medium mt-0.5 font-sans">
                              {isExpanded ? t('collapseDetails') : t('expandDetails')}
                            </span>
                          </div>

                          {/* Product Price */}
                          <div className="text-right shrink-0">
                            <span className="font-mono text-zinc-800 font-extrabold text-[11.5px] block">
                              ${p.retailPrice.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-semibold block scale-90 origin-right font-sans">
                              {t('suggestedRetail')}
                            </span>
                          </div>
                        </div>

                        {/* Collapsible Details Panel */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden border-t border-zinc-150 bg-zinc-100/40"
                            >
                              <div className="p-3 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-white p-2 rounded-xl border border-zinc-150 flex flex-col justify-center items-center shadow-3xs">
                                  <span className="text-[9px] text-zinc-400 font-black mb-0.5 font-sans">{t('costPrice')}</span>
                                  <span className="font-mono text-[10.5px] text-zinc-600 font-bold">${p.costPrice.toLocaleString()}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-zinc-150 flex flex-col justify-center items-center shadow-3xs">
                                  <span className="text-[9px] text-zinc-400 font-black mb-0.5 font-sans">{t('merchantProfit')}</span>
                                  <span className="font-mono text-[10.5px] text-emerald-600 font-black">${p.profit.toLocaleString()}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-zinc-150 flex flex-col justify-center items-center shadow-3xs">
                                  <span className="text-[9px] text-zinc-400 font-black mb-0.5 font-sans">{t('profitMargin')}</span>
                                  <span className="font-mono text-[10.5px] text-amber-600 font-black">
                                    {((p.profit / p.retailPrice) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer trigger button for replicating link */}
        {listedProducts.length > 0 && (
          <div className="shrink-0 border-t border-zinc-150 pt-3 bg-white">
            <button
              onClick={handleExecutePromotion}
              className="w-full py-4 text-white border border-transparent bg-[#e51923] hover:bg-red-700 rounded-2xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-100 active:scale-98 font-sans"
            >
              <Copy className="w-4 h-4" />
              <span>{t('promoSubmitBtn')}</span>
            </button>
          </div>
        )}

        {/* Toast Error Alert Banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute inset-x-8 bottom-16 z-30 bg-[#e51923] text-white text-center py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 shadow-lg"
            >
              <span className="text-[10px] font-sans leading-tight">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Copy / Deduction Promo success modal overlay dialog */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-40 bg-zinc-950/95 border border-zinc-805 text-white text-left p-5 rounded-2xl font-sans flex flex-col gap-2.5 shadow-2xl"
            >
              <div className="flex gap-2 items-center text-emerald-400 font-black text-xs font-sans">
                <Check className="w-4 h-4 animate-bounce shrink-0" />
                <span>{t('successAlertTitle')}</span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed font-light font-sans">
                {t('successAlertDesc', { budget: promoBudget.toLocaleString() })}
              </p>
              <div className="bg-zinc-850 p-2.5 rounded-xl font-mono text-[9px] text-zinc-400 break-all select-all border border-zinc-800 leading-normal">
                {t('successAlertCopied')}
              </div>
              <button 
                onClick={() => setCopied(false)} 
                className="w-full mt-2 py-2.5 bg-[#e51923] hover:bg-red-700 text-white font-extrabold rounded-xl text-[10.5px] transition-colors cursor-pointer font-sans"
              >
                {t('gotItBtn')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
