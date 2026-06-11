import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

// 1. Gather all keys and values from 'en' block (lines 501 to 985, which is 0-based lines 500 to 984)
const enKeys: string[] = [];
const enMap: Record<string, string> = {};

for (let i = 500; i < 984; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(["'])(.*)\2\s*,?\s*$/);
  if (match) {
    enKeys.push(match[1]);
    enMap[match[1]] = match[3];
  } else {
    const simpleMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
    if (simpleMatch) {
      enKeys.push(simpleMatch[1]);
      // Extract string value inside quotes
      const quoteMatch = line.match(/(["'])(.*?)\1/);
      enMap[simpleMatch[1]] = quoteMatch ? quoteMatch[2] : '';
    }
  }
}

// 2. Gather existing vietnamese translations (lines 2437 to 2682, which is 0-based lines 2436 to 2681)
const existingViMap: Record<string, string> = {};
for (let i = 2436; i < 2681; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(["'])(.*)\2\s*,?\s*$/);
  if (match) {
    existingViMap[match[1]] = match[3];
  } else {
    const simpleMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
    if (simpleMatch) {
      const quoteMatch = line.match(/(["'])(.*?)\1/);
      existingViMap[simpleMatch[1]] = quoteMatch ? quoteMatch[2] : '';
    }
  }
}

// 3. Complete dict with the rest of translated keys
const viDictionary: Record<string, string> = {
  verifyCheckDetails: "Vui lòng đối chiếu sao kê và kiểm tra chi tiết thanh toán bên dưới:",
  checkoutStep1: "1. Đơn hàng của bạn đang được kết nối trực tiếp đến <b>Hệ thống Kho hàng Sỉ Độc quyền</b> để tối ưu hóa chi phí đại lý siêu tốt xuất xưởng.",
  checkoutStep2: "2. Tổng tiền thanh toán: <b class=\"text-orange-606 font-semibold\">¥{price}</b> (Đã bao gồm tỷ lệ chia hoa hồng đại lý trực tiếp {pct}% cộng dồn vào số dư của {name}).",
  checkoutStep3: "3. Đơn hàng sẽ bắt đầu phân tích định tuyến và đóng gói ngay lập tức. Đại lý sẽ phê duyệt và hiển thị thông tin log theo dõi sau 2-5 phút.",
  backToBrowse: "Quay lại danh mục sản phẩm",
  paymentGuideTitle: "Hướng dẫn Thanh toán:",
  paymentGuideDesc: "Chúng tôi áp dụng hình thức chuyển khoản vận hành trực tiếp, hoàn toàn miễn phí giao dịch và hoa hồng sàn trung gian. Hãy đối chiếu chính xác địa chỉ nhận hàng và họ tên để phục vụ giao nhận tốt nhất!",
  receiverName: "Họ tên người nhận",
  placeholderReceiverName: "Vui lòng nhập tên người nhận chính xác",
  receiverPhone: "Số điện thoại liên lạc",
  placeholderReceiverPhone: "Vui lòng điền số điện thoại",
  receiverAddress: "Địa chỉ chi tiết nhận hàng",
  placeholderReceiverAddress: "Ví dụ: Số 230 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội",
  totalCheckoutAmount: "Tổng số tiền thanh toán thực tế:",
  confirmSubmitOffline: "Tôi xác nhận đã thanh toán xong",
  alertFieldsEmpty: "Để xử lý giao nhận thành công, vui lòng điền đầy đủ tên, số điện thoại và địa chỉ cụ thể.",
  guaranteeAuthentic: "Bảo đảm chính hãng 100%",
  guaranteeSandbox: "Hệ thống Môi trường Thử nghiệm An toàn",
  guaranteeDelivery: "Vận chuyển nhanh bảo bảo hiểm quốc tế",
  guideReadyTitle: "Sẵn sàng hoạt động sau 1 phút",
  guideTitle: "Hướng dẫn mở shop đại lý và thu lợi nhuận thụ động sau 1 phút",
  guideStep1Title: "Đăng ký tài khoản",
  guideStep1Desc: ": Bấm đăng ký, đổi tên Shop thương hiệu của riêng bạn trong mục Cá Nhân.",
  guideStep2Title: "Đồng bộ hóa 1-Click",
  guideStep2Desc: ": Duyệt xem thông tin giá sỉ xuất xưởng và lợi nhuận ròng, bấm đồng bộ sản phẩm muốn bán lên kệ hàng.",
  guideStep3Title: "Chia hoa hồng tự động",
  guideStep3Desc: ": Quảng bá đường dẫn shop của bạn. Khi khách đặt mua, hệ thống kho sỉ tự vận hành, tiền lời ngay lập tức cộng thẳng vào ví số dư.",
  clearanceTitle: "Xả Kho Giữa Đêm • Siêu Trợ Giá Kịch Sàn",
  clearanceSub: "Cơ hội săn sỉ hàng hiệu giá tận gốc / Thời gian xả kho giới hạn",
  clearanceLimit: "⚡ Hạn mức trợ giá kịch sàn đặc biệt",
  clearanceStock: "Số lượng còn lại: {pct}%",
  clearanceSold: "Đã tranh mua: {pct}%",
  clearanceSpecialPrice: "Giá dọn kho sỉ",
  clearanceSaving: "Trợ giá cực tốt giúp bạn tiết kiệm đến ¥{saving}!",
  buyNow: "Mua Ngay",
  addToCart: "Thêm Vào Giỏ",
  rankingMainTitle: "AliExpress • Chỉ Số Hàng Bán Chạy Nhất Tuần Toàn Cầu Table",
  rankingRatio: "Chỉ số hoàn thành đồng bộ toàn cầu 99.{num}%",
  checkoutSuccessDialogTitle: "Hợp Nhất Đơn Hàng Thành Công!",
  checkoutSuccessCheckDetails: "Vui lòng đối chiếu chi tiết thanh toán lô hợp nhất bên dưới:",
  checkoutSuccessStep1: "1. Đơn hàng của bạn sẽ đi trực tiếp từ kho trung tâm sỉ quốc tế để bảo đảm mức giá thấp nhất xuất xưởng.",
  checkoutSuccessStep2: "2. Tổng tiền thanh toán: <b class=\"text-orange-605 font-semibold\">¥{price}</b> (Tự động tính {pct}% biên lợi nhuận cộng dồn cho đại lý {name}).",
  checkoutSuccessStep3: "3. Phát hàng ngay sau khi thanh toán được hệ thống kho tiếp nhận trực tuyến. Chủ cửa hàng sẽ duyệt mã vận chuyển trong 2-5 phút.",
  continueSourcing: "Tiếp tục nhập hàng sỉ",
  viewOrdersInProfile: "Xem đơn hàng trong Trung tâm Cá nhân",
  cartTitleText: "Giỏ hàng tự phục vụ đại lý",
  cartSubtitleMerchant: "Trang Quản lý Vận hành & Cấu hình Đại lý Shop",
  cartSubtitleCustomer: "Giao Hàng Siêu Tốc Thuần Khấu Trừ • Bảo Đảm Chính Hãng 100%",
  cartTotalItemsCount: "Đã chọn {count} món đồ thời thượng {bonus_text}",
  clearCartBtn: "Xóa toàn bộ giỏ",
  checkoutInstructionTitle: "Quy chuẩn Thanh toán hợp nhất đại lý:",
  checkoutInstructionDesc: "Boutique này trực thuộc chuỗi cung ứng trực tiếp AliExpress. Hoàn toàn không cắt phế chiết khấu của đại lý, tất cả gửi trực tiếp từ nhà máy xuất xưởng tốt nhất.",
  enterReceiverInfoTitle: "Nhập thông tin người nhận (Bắt buộc)",
  receiverInfoNameLabel: "Họ và tên người nhận",
  receiverInfoNamePlaceholder: "Nhập tên người nhận",
  receiverInfoPhoneLabel: "Số điện thoại di động",
  receiverInfoPhonePlaceholder: "Vui lòng nhập số điện thoại",
  receiverInfoAddressLabel: "Địa chỉ giao hàng",
  receiverInfoAddressPlaceholder: "Địa chỉ nhận kiện hàng cụ thể chính xác",
  coinDeductionTitle: "Áp dụng xu vàng vàng tích lũy giảm giá",
  coinDeductionActive: "Đã kết nối xu vàng giảm giá hoạt động",
  coinDeductionInactive: "Không chọn khấu trừ bằng xu",
  coinDeductionStatusText: "Đang sở hữu {coins} Xu, khấu trừ hóa đơn tối đa ¥{amount}",
  merchantCostLabel: "Giá sỉ nhà máy xuất xưởng",
  merchantProfitLabel: "Lợi nhuận đại lý riêng của bạn",
  checkoutTotalPayableLabel: "Tổng tiền cần chi trả",
  checkoutCoinsUsedText: "Đã chi dùng {coins} xu vàng (Tiết kiệm thêm ¥{discount})",
  confirmPaidSubmitBtn: "Tôi xác nhận đã hoàn tất giao dịch sỉ",
  rechargeSuccess: "Cộng tiền số dư thành công!",
  shopBalanceRecharge: "Nạp tiền vào tài khoản Shop (Mô phỏng)",
  enterRechargeAmount: "Nhập hạn mức số tiền muốn nạp",
  rechargePlaceholder: "Vui lòng nhập số tiền muốn nạp sỉ đề xuất (RMB)",
  quickPresetTitle: "Chọn nhanh mốc sỉ số dư",
  confirmRechargeBtn: "Xác nhận nạp số dư sỉ",
  rechargeActionTitle: "Quản trị nạp ví sỉ shop",
  withdrawHistoryBtn: "Tra cứu lịch sử rút quỹ",
  backToWithdrawBtn: "Quay lại rút tiền quỹ",
  allWithdrawHistoryTitle: "Lịch sử yêu cầu rút tiền thụ động đại lý",
  noWithdrawHistory: "Chưa ghi nhận giao dịch rút tiền nào trong lịch sử.",
  backToNewWithdrawBtn: "Tạo yêu cầu rút mới",
  withdrawSubmittedTitle: "Gửi yêu cầu rút quỹ cá nhân thành công!",
  withdrawSubmittedDesc: "Yêu cầu rút tiền thụ động của bạn đang được duyệt tự động. Quỹ sẽ chuyển khoản sau 3-5 phút.",
  inputWithdrawAmountLabel: "Nhập số tiền cần rút sỉ lẻ (NDT)",
  quickPresetWithdrawTitle: "Hạn mức rút tiền gợi ý nhanh",
  allWithdrawBtn: "Rút toàn bộ số dư khả dụng",
  confirmWithdrawBtn: "Đồng ý rút tiền mặt",
  rechargeSuccessDesc: "Yêu nạp tiền hoàn tất! {amount} 元 đã được ghi nhận trực tuyến vào ví đại lý của bạn.",
  maxWithdrawableLabelText: "Tổng số dư tối đa có thể rút về ví",
  bankAccountInfoTitle: "Thiết lập thẻ ngân hàng nhận tiền tích lũy đại lý",
  bankNameLabel: "Tên ngân hàng tiếp nhận",
  bankNamePlaceholder: "Nhập tên ngân hàng (Ví dụ: Vietcombank, Techcombank)",
  branchNameLabel: "Chi nhánh thành phố mở tài khoản",
  branchNamePlaceholder: "Nhập chi nhánh mở tài khoản nhận",
  branchNoLabel: "Mã chuyển khoản nhanh liên ngân hàng / Routing No",
  branchNoPlaceholder: "Vui lòng điền mã số chi nhánh ngân hàng",
  holderNameLabel: "Họ tên người đại diện thẻ (Trùng khớp)",
  holderNamePlaceholder: "Họ và tên viết hoa không dấu",
  bankCardLabel: "Số tài khoản nhận tiền / Số thẻ",
  bankCardPlaceholder: "Nhập số tài khoản ngân hàng chính xác để chuyển nhận tiền",
  withdrawAccountNameLabel: "Họ tên người nhận thẻ",
  withdrawAccountCardNoLabel: "Số thẻ ngân hàng tiếp nhận",
  withdrawAccountBankLabel: "Ngân hàng thụ hưởng",
  withdrawAccountBranchLabel: "Tên chi nhánh ngân hàng",
  withdrawAccountBranchNoLabel: "Mã Swift Code / Routing Code",
  withdrawTabTitle: "Rút tiền hoa hồng tích lũy",
  withdrawSubmitBtn: "Bắt đầu yêu cầu thanh toán rút tiền",
  enterWithdrawAmountTip: "Vui lòng nhập hạn mức rút tiền hợp lệ",
  enterBankCardNameTip: "Tên đại diện thẻ ngân hàng nhận không được để trống",
  enterBankCardNoTip: "Số tài khoản thẻ ngân hàng nhận phải hợp lệ",
  enterBankNameTip: "Tên ngân hàng thụ hưởng bắt buộc",
  enterBankBranchTip: "Tên chi nhánh ngân hàng thụ hưởng là bắt buộc",
  enterBankBranchNoTip: "Mã số định danh routing chi nhánh không được để trống",
  withdrawSuccessMsg: "Yêu cầu rút tiền của bạn đã gửi thành công!",
  alertRechargeSuccess: "🎉 Đã nạp thành công {amount} 元 vào tài khoản khả dụng của bạn!",
  alertWithdrawSuccess: "🎉 Yêu cầu rút quỹ hoàn thành! {amount} NDT đang được ủy quyền và sẽ chuyển về thẻ của bạn sớm!",
  alertWithdrawFailBalance: "Số dư ví hiện tại không đủ để đáp ứng hạn mức mong muốn rút",
  alertWithdrawFailInfo: "Vui lòng cập nhật đầy đủ và liên kết thẻ ngân hàng trước khi gửi rút tiền",
  rechargeLogDesc: "Nạp ví số dư trực tuyến bảo chứng",
  withdrawActionTitle: "Sao kê chi tiết yêu cầu rút tiền",
  withdrawLogDesc: "Gửi lệnh rút quỹ thụ động về: {bank} ({branch}, số tài khoản thẻ ending: {card}), Chủ thể thụ nhận: {name}",
  alertBulkExportCopied: "📋 Trích xuất và xuất tệp báo cáo đơn hàng đại lý thành công vào clipboard!",
  alertManualCopyHelp: "Vui lòng sao chép nhật trình thủ công:\\n\\n{text}",
  alertAdminReferralCopied: "Link giới thiệu admin đại lý đã được sao chép vào khay nhớ tạm thời!",
  alertAdminReferralLinkIs: "Đường dẫn giới thiệu của bạn: {link}",
  alertPromoReferralCopied: "Đường dẫn giới thiệu đại lý trung gian thành viên đã được sao chép!",
  alertPromoReferralLinkIs: "Đường dẫn giới thiệu là: {link}",
  alertSupplierShipped: "🚀 [Nhà Cung Cấp Đã Gửi Kiện Hàng]\\nHệ thống tổng kho sỉ đã hoàn thành phân loại sản phẩm và gửi đơn vận chuyển nhanh!",
  alertStoreItemSigned: "✔ Khách hàng đã nhận và ký bàn giao thành công vật phẩm thời thượng [{name}]!",
  alertRegisterReferralCopied: "Liên kết tuyển dụng đại lý mở rộng đã được sao chép thành công!",
  alertRegisterReferralLinkIs: "Đường dẫn lời mời đặc quyền: {link}",
  coinHubTitle: "Trung tâm Săn xu Tích Lũy • Coin Hub",
  coinHubMyCoins: "Số dư xu ưu đãi tích lũy của Shop",
  coinHubRedeemable: "Giá trị tiền sỉ quy đổi tương đương",
  coinHubDescription: "Mỗi xu tích lũy khấu trừ ¥1 trực tiếp, hỗ trợ giảm giá tối đa lên đến 20% tổng giá sỉ hóa đơn!",
  coinHubTappingGame: "👇🏻 Chạm nhanh vào đồng xu vàng thần tài đang xoay phía dưới • Mỗi cú chạm rơi tiền mặt!",
  coinHubAlreadyClaimed: "⚠️ Bạn đã chạm tối đa hạn mức ngày hôm nay. Hãy tiếp tục quay lại vào ngày mai nhé!",
  coinHubEarnedTip: "🎉 Chạm thần tài thành công nhận ngay +50 Xu vàng! Số dư ví đã tích hợp",
  coinHubTappingLocked: "🔒 Đã nhận đủ phần thưởng may mắn của ngày hôm nay (Vui lòng quay lại vào ngày mai)",
  coinHubStreakVal: "(Kỷ lục điểm danh: {day} ngày liên tục / Cộng thêm nhân đôi phần thưởng sỉ)",
  coinHubTaskTitle: "🚀 Nhiệm vụ nhanh nhận xu sỉ • Coins Quest Group",
  coinHubTaskDiscoverTitle: "🔍 Khám phá nguồn sỉ thời thượng",
  coinHubTaskDiscoverDesc: "Duyệt tìm kiếm hoặc tìm danh mục hấp dẫn thời thượng sỉ (Nhận ngay +300 Xu)",
  coinHubTaskDiscoverBtn: "Bắt đầu khám phá",
  coinHubTaskDiscoverSuccess: "🎉 Chuyển hướng thành công sang sỉ chuyên biệt! Thưởng ngay ưu đãi +300 xu vàng!",
  coinHubTaskShareTitle: "🤝 Chia sẻ liên kết shop sành điệu",
  coinHubTaskShareDesc: "Giới thiệu shop sành điệu đến các mạng lưới liên kết khách nâng cao & nhận +500 xu",
  coinHubTaskShareSuccess: "🎉 Kiểm định chia sẻ hợp lệ! Đã cộng +500 xu vàng tích hợp sỉ.",
  coinHubTaskShareProgress: "Đã nhận",
  coinHubTaskShareBtn: "Chia sẻ ngay",
  coinHubBackToStore: "Trở lại giỏ đồ sành điệu",
  coinHubCheckinTitle: "📅 Thử thách kiểm chứng chuỗi ngày hoạt động • Thưởng chuyên cần sỉ",
  coinHubMonday: "T2",
  coinHubTuesday: "T3",
  coinHubWednesday: "T4",
  coinHubThursday: "T5",
  coinHubFriday: "T6",
  coinHubSaturday: "T7",
  coinHubChest: "Rương",
  coinHubCheckinSuccess: "🏆 Điểm danh vàng hoàn thành! Đã cộng tích hợp sỉ +{reward} xu vàng vào rương báu!",
  superDiscountTitle: "Khu vực Triển lãm Xả Kho Giá Cực Tốt • Super Discount",
  superDiscountSub: "Yên tâm chất lượng xuất xưởng sỉ • Cam kết sản phẩm thời thượng",
  superDiscountBannerTag: "Hạn ngạch thanh lý xả kho giới hạn",
  superDiscountBannerDesc: "Một loạt sản phẩm tinh mỹ dưới giá thị trường • Hỗ trợ cộng dồn mã sỉ khi thanh toán!",
  superDiscountProductBadge: "Deals Hủy Diệt",
  superDiscountDescriptionDefault: "Vận dụng chế tác tinh mỹ của các nhà tạo mốt, hoàn hảo vô song chất lượng.",
  superDiscountAddCartBtn: "Thêm vào giỏ hàng",
  superDiscountDirectBuyBtn: "Mua ngay",
  superDiscountCartSuccess: "🎉 Đã thêm sản phẩm 【{name}】 thành công vào giỏ hàng với giá xả sỉ cực tốt!",
  superDiscountBackBtn: "Tiếp tục xem sỉ toàn cầu",
  luxuryBrandsTitle: "Bộ Sưu Tập Nhãn Hàng Độc Quyền • Luxury Brands Special Deals",
  luxuryBrandsSub: "Ưu đãi khách hội viên vàng • Trải nghiệm đẳng cấp cao nhất",
  luxuryBrandsCouponClaimed: "Đã nhận Phiếu chiết khấu hoàng gia",
  luxuryBrandsCouponAvailable: "Nhận Phiếu chiết khấu nhân đôi đặc quyền sỉ",
  luxuryBrandsCouponClaimedSub: "Phiếu chiết khấu được liên kết hoạt động tốt tại kho hãng",
  luxuryBrandsCouponAvailableSub: "Đặc quyền nhân hai chiết khấu sỉ 🎁 Thêm ngay 500 đồng xu vàng sỉ vào rương",
  luxuryBrandsProductTag: "Ưu Tú",
  luxuryBrandsDescriptionDefault: "Chế tác chuẩn xác cao cấp với các chi tiết cổ điển không thể sao chép.",
  luxuryBrandsAddCartBtn: "Thêm vào giỏ sành điệu",
  luxuryBrandsDirectBuyBtn: "Mua ngay",
  luxuryBrandsCartSuccess: "🎉 Thêm thành công sản phẩm đỉnh cao 【{name}】 vào giỏ sỉ sành điệu!",
  luxuryBrandsBackBtn: "Tiếp tục duyệt thương hiệu quý tộc",
  dailyGoldTitle: "Bảng xếp hạng xu hướng sỉ hot hàng ngày",
  dailyGoldSub: "Chỉ số nhiệt độ bán sỉ • Làm mới sau mỗi một tiếng",
  dailyGoldWatches: "⌚ Đồng hồ độc bản",
  dailyGoldJewelry: "💎 Trang sức vĩnh cửu",
  dailyGoldScents: "🏺 Nước hoa vương giả",
  dailyGoldPopularity: "Điểm Hot sỉ 🔥 {score}%",
  dailyGoldCartSuccess: "🎉 Sản phẩm xu hướng sỉ 【{name}】 đã thêm vào giỏ thành công!",
  dailyGoldBackBtn: "Về bảng xếp hạng chính",
  liveShotsTitle: "Gian hàng chụp góc siêu cận chân thực 1:1",
  liveShotsSub: "Hình ảnh chân thật 100% Macro chụp trực tiếp tại tổng kho sỉ",
  liveShotsProductWeight: "Trọng lượng kiểm nghiệm sỉ thật",
  liveShotsProductGrade: "Độ chính xác thông số bộ cơ / Calibre",
  liveShotsAppraisalTitle: "🔍 Chứng nhận thẩm định giám định mĩ nghệ chuyên gia",
  liveShotsInspectLabel: "Giá sỉ xuất xưởng bảo lưu sau kiểm tra",
  liveShotsAddCartBtn: "Thêm sỉ vào giỏ",
  liveShotsBuyBtn: "Đảm bảo mua bản chụp thật này",
  liveShotsCartSuccess: "🎉 Bản chụp kiểm chứng của 【{name}】 đã thêm vào giỏ sỉ!",
  liveShotsCloseBtn: "Đóng cửa sổ giám định sỉ",
  slide1Title: "Triển lãm Patek Philippe & Rolex danh tiếng",
  slide1Subtitle: "Tuyển chọn các kiệt tác mĩ nghệ vượt thời đại",
  slide1Accent: "Xứng tầm di sản định nghĩa đẳng cấp hoàng gia",
  slide1Tag: "CHRONO DANH TIẾNG",
  slide2Title: "Hương hoa Champs-Élysées ngào ngạt",
  slide2Subtitle: "Mùi hương độc nhất định hướng cá tính riêng biệt",
  slide2Accent: "Chiếc áo giáp tàng hình tuyệt hảo tăng độ quyến rũ tự nhiên",
  slide2Tag: "SCENT THỜI THƯỢNG",
  slide3Title: "BST Trang sức Cartier Lady cao cấp",
  slide3Subtitle: "Tập hợp các viên đá quý lộng lẫy xa hoa",
  slide3Accent: "Lấp lánh tinh anh thể hiện quyền lực quý phái truyền đời",
  slide3Tag: "JEWELRY QUÝ TỘC",
  shortcutCoins: "Săn xu tích lũy",
  shortcutCoinsSub: "Giảm sỉ 20%",
  shortcutDiscount: "Xả kho kịch sàn",
  shortcutDiscountSub: "Giá kịch sàn",
  shortcutBrands: "Sỉ thương hiệu",
  shortcutBrandsSub: "Chính hãng",
  shortcutCharts: "Trending Shop",
  shortcutChartsSub: "Hot nhất tuần",
  shortcutLive: "Ảnh thực tế sỉ",
  shortcutLiveSub: "Giám định 1:1",
  homeSearchPlaceholder: "Tìm mặt hàng cao cấp...",
  endsIn: "Kết thúc trong",
  twentyFourHourShipping: "Vận chuyển nhanh bảo dưỡng 24h",
  soldCount: "Số Đơn Mua: {count}",
  freeShippingLabel: "Miễn phí giao hàng quốc tế 🆓",
  deal_P1_name: "Đồng hồ Patek Philippe Nautilus Ref. 5711 Classic Metal Mặt Xanh Lam",
  deal_P1_badge: "Bán Chạy Nhất",
  deal_P2_name: "Lắc vàng Panthère de Cartier 18K Yellow Gold đính kim cương tự nhiên",
  deal_P2_badge: "Trang Sức Đỉnh Cao",
  deal_P3_name: "Túi Hermès Birkin Da Đà Điểu nguyên tấm khoen mạ vàng hoàng gia",
  deal_P3_badge: "Sưu Tầm Danh Giá",
  deal_P4_name: "Đồng hồ Rolex Daytona Ref.116508 18K Yellow Green Dial mặt xanh lá bảo hành",
  deal_P4_badge: "Gợi Ý Đặc Biệt",
  deal_P5_name: "Mặt dây chuyền cỏ bốn lá Van Cleef & Arpels Alhambra Vintage Carnelian đỏ",
  deal_P5_badge: "Săn Đón Nhiều Nhất",
  deal_P6_name: "Túi Chanel 19 Quilted Heavy Flap Shoulder Bag Lambskin đen bóng kinh điển",
  deal_P6_badge: "Biểu Tượng Mode",
  deal_P7_name: "Đồng hồ Audemars Piguet Royal Oak Octagonal Automatic lộ cơ tinh xảo",
  deal_P7_badge: "Tuyệt Tác Đồng Hồ",
  deal_P8_name: "Nước hoa cao cấp Byredo Mojave Ghost EDP phong cách salon Pháp 100ml",
  deal_P8_badge: "Hương Thơm Cá Tính",
  deal_P9_name: "Túi trống du lịch Louis Vuitton Keepall Bandouliere Noir Sport da bò dập vân nổi 50",
  deal_P9_badge: "Đồ Sành Hành Trình"
};

// 4. Build the final balanced 'vi' block keeping existing ones and using the matching English keys ONLY
const section1 = lines.slice(0, 2437).join('\n') + '\n';
let viBlockContent = '';
for (const key of enKeys) {
  let val = '';
  if (existingViMap[key] !== undefined) {
    val = existingViMap[key];
  } else if (viDictionary[key] !== undefined) {
    val = viDictionary[key];
  } else {
    // Graceful fallback to English value if no vietnamese translation exists
    val = enMap[key] || '';
  }
  viBlockContent += `    ${key}: ${JSON.stringify(val)},\n`;
}

// Strip final trailing comma inside block
viBlockContent = viBlockContent.trimEnd();
if (viBlockContent.endsWith(',')) {
  viBlockContent = viBlockContent.slice(0, -1);
}

const section2_vi = '  vi: {\n' + viBlockContent + '\n  }\n};\n';

// 5. Slice Section 4: everything starting from leafColorsMap
let leatherColorsMapStartIdx = -1;
for (let i = 2715; i < lines.length; i++) {
  if (lines[i].includes('const leatherColorsMap') && lines[i].trim().endsWith('{')) {
    leatherColorsMapStartIdx = i;
    break;
  }
}

if (leatherColorsMapStartIdx === -1) {
  for (let i = 3080; i < lines.length; i++) {
    if (lines[i].includes('const leatherColorsMap')) {
      leatherColorsMapStartIdx = i;
      break;
    }
  }
}

console.log("leatherColorsMapStartIdx located at index:", leatherColorsMapStartIdx + 1);
const section4 = lines.slice(leatherColorsMapStartIdx).join('\n');

// 6. Assemble everything
let repairedCode = section1 + section2_vi + '\n' + section4;

// Escaping fix for checkoutSuccessStep2 in all blocks
repairedCode = repairedCode.replace(
  `checkoutSuccessStep2: "2. 本次合计应付：<b class=\\\\",`,
  `checkoutSuccessStep2: "2. 本次合计应付：<b class=\\\"text-orange-600 font-semibold\\\">¥{price}</b> ({name})",`
);
repairedCode = repairedCode.replace(
  `checkoutSuccessStep2: "2. Total Payable: <b class=\\\\",`,
  `checkoutSuccessStep2: "2. Total Payable: <b class=\\\"text-zinc-800 font-semibold\\\">¥{price}</b>",`
);
repairedCode = repairedCode.replace(
  `checkoutSuccessStep2: "2. Total a pagar: <b class=\\\\",`,
  `checkoutSuccessStep2: "2. Total a pagar: <b class=\\\"text-zinc-800 font-semibold\\\">¥{price}</b>",`
);
repairedCode = repairedCode.replace(
  `checkoutSuccessStep2: "2. 今回の決済合計額：<b class=\\\\",`,
  `checkoutSuccessStep2: "2. 今回の決済合計額：<b class=\\\"text-zinc-800 font-semibold\\\">¥{price}</b>",`
);
repairedCode = repairedCode.replace(
  `checkoutSuccessStep2: "2. 금회 결제 총액: <b class=\\\\",`,
  `checkoutSuccessStep2: "2. 금회 결제 총액: <b class=\\\"text-zinc-800 font-semibold\\\">¥{price}</b>",`
);

// Save output
fs.writeFileSync(filePath, repairedCode, 'utf8');
console.log("Successfully rebuilt translations file with perfect key alignment and zero redundant keys!");
