import { Product } from './types';
// @ts-ignore
import defaultAvatar from './assets/images/aliexpress_seller_logo_1780316211327.png';

// Core pre-defined luxury products
const CORE_PRODUCTS = [
  {
    id: 'LP-0001',
    name: 'Cartier Bordeaux Classic 卡地亚经典勃艮第红机械表',
    category: '臻选腕表',
    costPrice: 850000,
    retailPrice: 920000,
    profit: 70000,
    description: '承袭法式浪漫，酒红色深邃表盘搭配复古鳄鱼皮表带，瑞士自动上链机芯，彰显无上尊贵。',
    sku: 'WT-CART-8892',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0002',
    name: 'Gilded Amber Niche Perfume 鎏金琥珀沙龙高定香水',
    category: '奢享沙龙香',
    costPrice: 17805,
    retailPrice: 19800,
    profit: 1995,
    description: '前调乌木与大马士革玫瑰，后调鎏金琥珀与雪松，木质香调神秘而绵长，独居一格的高阶气场。',
    sku: 'PF-AMB-4029',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0003',
    name: 'Pure Gold Handcrafted Ring 18K香槟金手工掐丝戒',
    category: '高级珠宝',
    costPrice: 220000,
    retailPrice: 250000,
    profit: 30000,
    description: '18K香槟金精工打磨，手工大马士革掐丝纹路，内敛中闪烁着极致的匠人情怀与时光印记。',
    sku: 'JW-RING-9951',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0004',
    name: 'Vintage Master leather Tote 复古意式大容量马鞍皮托特包',
    category: '匠心皮具',
    costPrice: 320000,
    retailPrice: 360000,
    profit: 40000,
    description: '托斯卡纳顶级植鞣牛皮，全手工油边缝线，随岁月沉淀愈发温润剔透。奢华大容量设计。',
    sku: 'BG-TOTE-1102',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0005',
    name: 'Obsidian Noir Acetate Sunglasses 黑曜石复古醋酸纤维墨镜',
    category: '大师器物',
    costPrice: 48000,
    retailPrice: 54000,
    profit: 6000,
    description: '采用日本高密度醋酸纤维，黑曜石纯粹质感，全遮光防紫外线，兼顾问鼎美感与先锋设计。',
    sku: 'EY-OBS-5531',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0006',
    name: 'Celadon Glazed Ceramic Vase 秘境青瓷大师手作艺术插花瓶',
    category: '大师器物',
    costPrice: 68000,
    retailPrice: 76000,
    profit: 8000,
    description: '非遗传承大师亲制，高温窑变秘色青釉，造型敦厚典雅，光影之下温润如碧玉。',
    sku: 'VA-CEL-9022',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0007',
    name: 'Imperial Jadeite Diamond Pendant 极光帝王绿翡翠18K金豪镶吊坠',
    category: '高级珠宝',
    costPrice: 2850000,
    retailPrice: 3180000,
    profit: 330000,
    description: '臻选老坑冰种帝王绿翡翠，水头极足，满绿莹润。18K白金搭配重磅南非足反钻石群镶执手，极具典藏价值。',
    sku: 'JW-JAD-0283',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0008',
    name: 'Imperial Sandalwood Soy Candle 帝王之木黑檀大豆香薰蜡烛',
    category: '奢享沙龙香',
    costPrice: 6100,
    retailPrice: 6800,
    profit: 700,
    description: '手工灌装纯天然大豆蜡，奢华黑檀木与烟草皮革香，于暗夜中燃起微弱光芒，静宜而辽远。',
    sku: 'AC-CAN-3382',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0009',
    name: 'Chanel No.5 Paris Vintage 香奈儿五号经典高定香水',
    category: '香水',
    costPrice: 23200,
    retailPrice: 26000,
    profit: 2800,
    description: '永恒经典的女性芬芳，高端醛香与花香的完美邂逅，彰显独立、优雅与摩登。',
    sku: 'PF-CHN-5501',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'LP-0010',
    name: 'Dyson Supersonic Ionic 戴森智能复古红控温吹风机',
    category: '家用电器',
    costPrice: 43800,
    retailPrice: 48800,
    profit: 5000,
    description: '智能控温技术，高倍气流倍增，复古绯红限定配色，护发气流与沙龙造型的完美平衡。',
    sku: 'AP-DYS-8012',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?w=600&auto=format&fit=crop&q=80',
  }
];

const CATEGORIES = ['臻选腕表', '奢享沙龙香', '高级珠宝', '匠心皮具', '大师器物', '香水', '家用电器', '情趣用品'];

const LUXURY_PHOTO_POOLS: Record<string, string[]> = {
  '臻选腕表': [
    '1547996160-81dfa63595aa', // Bordeaux red mechanical watch
    '1523275335684-37898b6baf30', // White minimalist watch
    '1524592094714-0f0654e20314', // Classic golden woman's watch
    '1542496658-e33a6d0d50f6', // Premium brown leather strap watch
    '1612817288484-6f916006741a', // Fine luxury gold watch close up
    '1619134778706-7015533a6150', // Steel-strap mechanical elegance
    '1509048191080-d2984bad6ae5', // Premium dial details luxury watch
    '1639006570490-79c0c53f1080', // High-end design watch black bezel
    '1517462964-21fdcec3f25b', // Watchmaker craftsmanship workbench
    '1608231387042-66d1773070a5', // Sporty luxury automatic watch
    '1522312346375-d1a52e2b99b3'  // Classic metal link bracelet watch
  ],
  '奢享沙龙香': [
    '1541643600914-78b084683601', // Pure perfume on marble
    '1594035910387-fea47794261f', // Golden luxury perfume flacon
    '1592945403244-b3fbafd7f539', // Designer round bottle
    '1617897903246-719242758050', // Fine glass spray with wooden block
    '1595425970377-c9703cf48b6d', // French vintage apothecary scent
    '1602810318383-e386cc2a3ccf', // Modernist luxury display perfume
    '1526170375885-4d8ecf77b99f', // Vintage amber glass oil bottle
    '1596462502278-27bfdc403348', // Pink boutique perfume bottle
    '1515688594390-b649af70d282'  // Gilded premium spray flacon
  ],
  '高级珠宝': [
    '1605100804763-247f67b3557e', // Pure gold 18k handcrafted ring
    '1599643478518-a784e5dc4c8f', // Diamond & emerald pendant close up
    '1601121141461-9d6647bca1ed', // Pearl drop earrings on pedestal
    '1515562141207-7a88fb7ce338', // Sparking diamond necklace
    '1599643477877-530eb83abc8e', // Raw natural gems and diamond rings
    '1635767798638-3e25273a8236', // Modern luxury gemstone bracelet
    '1611591437281-460bfbe1220a'  // Aesthetic gold necklaces stack
  ],
  '匠心皮具': [
    '1584917865442-de89df76afd3', // Soft bordeaux calfskin handbag
    '1581605405669-fcdf81165afa', // Minimalist premium leather tote bag
    '1547949003-9792a18a2601', // Luxury design textured tote
    '1517336714731-489689fd1ca8', // Full collection designer handbags
    '1591561954557-26941169b49e', // Vibrant designer bag/shoes
    '1614162692292-7ac56d7f7f1e', // Sleek designer style handbag
    '1508746829417-e6f548d8d6ed'  // Luxury leather bags collection
  ],
  '大师器物': [
    '1612196808214-b8e1d6145a8c', // Wabi-sabi heavy clay tea bowl set
    '1505740420928-5e560c06d30e', // Artisan hand-carved coffee stoneware cup
    '1610701596007-11502861dcfa', // Kyoto glazed ceramic studio vase
    '1514432324607-a09d9b4aefdd', // Traditional glazed studio pottery cups
    '1511499767150-a48a237f0083', // Avant-garde tortoiseshell sunglasses
    '1509695507497-903c140c43b0', // High-end designer optical spectacles
    '1618005182384-a83a8bd57fbe', // Fine aesthetic design objects stack
    '1603006905003-be475563bc59', // Luxury scented candle jar
    '1513519245088-0e12902e5a38'  // Aesthetic designer space book
  ],
  '香水': [
    '1541643600914-78b084683601', // Pure perfume on marble
    '1594035910387-fea47794261f', // Golden luxury perfume flacon
    '1592945403244-b3fbafd7f539', // Designer round bottle
    '1617897903246-719242758050', // Fine glass spray with wooden block
    '1595425970377-c9703cf48b6d', // French vintage apothecary scent
    '1602810318383-e386cc2a3ccf', // Modernist luxury display perfume
    '1526170375885-4d8ecf77b99f', // Vintage amber glass oil bottle
    '1596462502278-27bfdc403348', // Pink boutique perfume bottle
    '1515688594390-b649af70d282'  // Gilded premium spray flacon
  ],
  '家用电器': [
    '1522337360788', // Luxury beauty hair styling vanity set
    '1501339847302', // Espresso machine luxury
    '1608043152269', // Marshall retro speaker audio
    '1588854337236', // Retro Smeg style mint toaster
    '1616486338812', // Built-in integrated modern oven kitchen design
    '1544725176', // Premium cooking range and stove top burners
    '1584622781564', // Pristine laundry clothes steam ironing
    '1495474472287', // Drip pour-over coffee morning light
    '1576092768241', // Glass teapot pouring hot organic tea
    '1513519245088', // Designer minimalist warm desk workspace lamp light
    '1527866990051', // Modern circular metal luxury art speaker
    '1545454675', // Sophisticated spherical black desktop studio monitor speaker
    '1585751353481', // Minimalist clean facial skin device and hand styling tool
    '1511379938547', // Elegant home audio system amplifier piano keys
    '1581091226825', // High grade smart cleaning robot device details
    '1486406146926', // Premium multi unit digital studio acoustic speakers
    '1618220179428', // Minimalist white air humidifier mister machine
    '1616486038855', // High end kitchen counter space with built-in dishwasher
    '1580582932707', // Sleek double chamber toaster chrome finish
    '1520340356555', // Ultimate matte black luxury coffee maker brewer
    '1600585154340'  // Bespoke ultra-luxury customized kitchen layout matching unit
  ],
  '情趣用品': [
    '1505691938895-1758d7f4f10d', // Silk sheets bedding cozy luxury
    '1522335789203-aabd1fc54bc9', // Elegant cosmetics and roses on white bed
    '1540555700478-4be289fbecef', // Warm romantic floral bath petals
    '1584043764456-ad21a106e300', // Luxury pure silk robe detail
    '1542332213-9e5a5a3fab35', // Crimson red rose petals on premium silk
    '1567401893-92f7b1259685', // Luxury dark satin fabric drapery
    '1528698886441-df096230ba97', // Cozy classy bathrobes lifestyle
    '1572490122747-3968b75cc699', // Elegant sensual glass bottle & flowers
    '1618336753974-aae8e04506aa', // Romantic luxury candles and essential massage oils
    '1506159904226-d220854375b4', // Cozy legs with knit stay-up long socks on bed
    '1590523277543-a94d2e4eb00b', // Classy pink silk slip nightgown detail
    '1515886657613-9f3515b0c78f', // Elegant female fashion silk dress close-up
    '1511556532299-8f662fc26c06', // Beautiful bedroom morning warm light layout
    '1504198453319-5ce911baf5dc', // Delicate lace curtain light close-up
    '1598958342403-eff969f654b7', // Red roses luxury preset
    '1516975080-ca6ef211a12d', // Scented bedroom spray luxury lifestyle
    '1559599101-f09b5894b962', // Beautiful silk scarf textures romantic
    '1531746020798-e6953c6e8e04'  // High fashion details model silhouette
  ]
};

const NOUNS = [
  '黑耀石', '鎏金', '琥珀', '爱尔兰软呢', '翡翠', '勃艮第', '祖母绿', '香槟金', '白金', '暗红缎面',
  '磨砂玫瑰', '火山灰陶瓷', '雪松', '羊脂白玉', '大马士革', '钛合金', '黑檀木', '复古马鞍', '皇家孔雀'
];

const STYLES = [
  '奢享限定款', '私享大容量', '极简先锋款', '大师联名系列', '掐丝手作款', '限量高级定制', '经典复刻版',
  '秘境沙龙系列', '冷淡风微光款', '臻选重磅版', '18K纯金镶嵌款', '传世手工款', '天然大都会系列'
];

const ADJECTIVES = [
  '极致典雅的', '富有层次感的', '沉稳隽永的', '内敛低调的', '富有艺术气息的', '散发神秘光芒的', '由匠师打磨的',
  '精选奢华皮料的', '充满寂静美感的', '契合先锋审美的'
];

/**
 * Generates a completely unique, highly styled, non-repeated Unsplash URL 
 * based on the product category, unique ID, and its localized color nouns.
 */
function getUniqueImageForProduct(category: string, id: number, name: string): string {
  const pool = LUXURY_PHOTO_POOLS[category] || LUXURY_PHOTO_POOLS['臻选腕表'];
  
  // Try semantic match first to ensure image and naming match up perfectly!
  let photoId = '';
  
  if (category === '臻选腕表') {
    if (name.includes('勃艮第') || name.includes('红') || name.includes('暗红')) {
      photoId = '1547996160-81dfa63595aa'; // Bordeaux red mechanical watch
    } else if (name.includes('白金') || name.includes('白玉') || name.includes('极简')) {
      photoId = '1523275335684-37898b6baf30'; // White minimalist watch
    } else if (name.includes('金') || name.includes('香槟') || name.includes('pure') || name.includes('纯金')) {
      photoId = '1524592094714-0f0654e20314'; // Classic golden woman's watch
    } else if (name.includes('马鞍') || name.includes('软呢') || name.includes('复古')) {
      photoId = '1542496658-e33a6d0d50f6'; // Premium brown leather strap watch
    } else if (name.includes('钛合金')) {
      photoId = '1619134778706-7015533a6150'; // Steel-strap mechanical elegance
    } else if (name.includes('黑耀石') || name.includes('黑檀')) {
      photoId = '1639006570490-79c0c53f1080'; // High-end design watch black bezel
    } else if (name.includes('手作') || name.includes('手工')) {
      photoId = '1517462964-21fdcec3f25b'; // Watchmaker craftsmanship workbench
    }
  } else if (category === '奢享沙龙香' || category === '香水') {
    if (name.includes('白金') || name.includes('白玉') || name.includes('极简')) {
      photoId = '1541643600914-78b084683601'; // Pure perfume on marble
    } else if (name.includes('金') || name.includes('香槟') || name.includes('纯金') || name.includes('琥珀')) {
      photoId = '1594035910387-fea47794261f'; // Golden luxury perfume flacon
    } else if (name.includes('黑耀石') || name.includes('黑檀') || name.includes('暗红')) {
      photoId = '1526170375885-4d8ecf77b99f'; // Vintage dark glass oil bottle
    } else if (name.includes('玫瑰') || name.includes('缎面') || name.includes('丽花')) {
      photoId = '1596462502278-27bfdc403348'; // Pink boutique perfume bottle
    } else if (name.includes('雪松') || name.includes('木')) {
      photoId = '1617897903246-719242758050'; // Fine glass spray with wooden block
    } else if (name.includes('复古') || name.includes('荒野')) {
      photoId = '1595425970377-c9703cf48b6d'; // French vintage apothecary scent
    } else {
      photoId = '1592945403244-b3fbafd7f539'; // Designer round bottle
    }
  } else if (category === '高级珠宝') {
    if (name.includes('金') || name.includes('纯金') || name.includes('香槟') || name.includes('18K')) {
      photoId = '1605100804763-247f67b3557e'; // Pure gold 18k handcrafted ring
    } else if (name.includes('翡翠') || name.includes('祖母绿')) {
      photoId = '1599643478518-a784e5dc4c8f'; // Diamond & emerald pendant close up
    } else if (name.includes('白金') || name.includes('白玉')) {
      photoId = '1601121141461-9d6647bca1ed'; // Pearl drop earrings on pedestal
    } else if (name.includes('极光') || name.includes('重磅')) {
      photoId = '1515562141207-7a88fb7ce338'; // Sparking diamond necklace
    } else if (name.includes('手作') || name.includes('手工')) {
      photoId = '1611591437281-460bfbe1220a'; // Aesthetic gold necklaces stack
    } else if (name.includes('琥珀')) {
      photoId = '1599643477877-530eb83abc8e'; // Raw natural gems and diamond rings
    } else if (name.includes('红') || name.includes('玫瑰') || name.includes('勃艮第')) {
      photoId = '1599643477877-530eb83abc8e'; // Raw natural stones
    } else if (name.includes('孔雀')) {
      photoId = '1635767798638-3e25273a8236'; // Modern luxury gemstone bracelet
    }
  } else if (category === '匠心皮具') {
    if (name.includes('勃艮第') || name.includes('红') || name.includes('暗红')) {
      photoId = '1584917865442-de89df76afd3'; // Soft bordeaux calfskin handbag
    } else if (name.includes('马鞍') || name.includes('复古')) {
      photoId = '1581605405669-fcdf81165afa'; // Premium leather tote bag
    } else if (name.includes('极简') || name.includes('黑耀石')) {
      photoId = '1581605405669-fcdf81165afa'; // Minimalist premium leather tote bag
    } else if (name.includes('黑檀') || name.includes('暗黑')) {
      photoId = '1508746829417-e6f548d8d6ed'; // Luxury leather collection
    } else if (name.includes('软呢')) {
      photoId = '1547949003-9792a18a2601'; // Luxury design textured tote
    } else if (name.includes('琥珀') || name.includes('香槟')) {
      photoId = '1614162692292-7ac56d7f7f1e'; // Sleek designer handbag
    } else if (name.includes('手作') || name.includes('手工')) {
      photoId = '1581605405669-fcdf81165afa'; // Premium leather
    } else if (name.includes('金') || name.includes('纯金')) {
      photoId = '1547949003-9792a18a2601'; // Luxury design textured tote
    }
  } else if (category === '大师器物') {
    if (name.includes('重磅') || name.includes('火山灰')) {
      photoId = '1612196808214-b8e1d6145a8c'; // Wabi-sabi heavy clay tea bowl set
    } else if (name.includes('手工') || name.includes('手作')) {
      photoId = '1505740420928-5e560c06d30e'; // Artisan hand-carved coffee stoneware cup
    } else if (name.includes('青瓷') || name.includes('白玉') || name.includes('碧玉')) {
      photoId = '1610701596007-11502861dcfa'; // Kyoto glazed ceramic studio vase
    } else if (name.includes('琥珀') || name.includes('镜') || name.includes('眼镜')) {
      photoId = '1511499767150-a48a237f0083'; // Avant-garde tortoiseshell sunglasses
    } else if (name.includes('大豆') || name.includes('蜡烛') || name.includes('香薰') || name.includes('烛') || name.includes('薰')) {
      photoId = '1603006905003-be475563bc59'; // Luxury scented candle jar
    } else if (name.includes('钛') || name.includes('极简')) {
      photoId = '1509695507497-903c140c43b0'; // Spectacles
    } else if (name.includes('先锋') || name.includes('黑耀石')) {
      photoId = '1511499767150-a48a237f0083'; // Sunglasses
    } else if (name.includes('沙龙') || name.includes('微光')) {
      photoId = '1513519245088-0e12902e5a38'; // Aesthetic books
    } else if (name.includes('黑') || name.includes('暗')) {
      photoId = '1505740420928-5e560c06d30e'; // Artisan cup
    } else if (name.includes('茶')) {
      photoId = '1514432324607-a09d9b4aefdd'; // Studio pottery cups
    } else if (name.includes('金') || name.includes('鎏金')) {
      photoId = '1610701596007-11502861dcfa'; // Kyoto glazed ceramic studio vase
    } else if (name.includes('大师')) {
      photoId = '1612196808214-b8e1d6145a8c'; // Studio wabi-sabi pottery
    }
  } else if (category === '家用电器') {
    if (name.includes('吹风机') || name.includes('吹风')) {
      photoId = '1621619856624-99600123ede4'; // Ionic hair dryer
    } else if (name.includes('咖啡') || name.includes('磨豆') || name.includes('Coffee') || name.includes('咖啡机')) {
      photoId = '1501339847302-ac426a4a7cbb'; // Premium espresso maker on marble counter
    } else if (name.includes('音响') || name.includes('音箱') || name.includes('蓝牙音') || name.includes('Speaker')) {
      if (name.includes('帝瓦雷') || name.includes('Phantom')) {
        photoId = '1545454675-3531b543be5d'; // Minimalist premium dark orb speaker
      } else if (name.includes('马歇尔') || name.includes('Marshall') || name.includes('唱片')) {
        photoId = '1608043152269-423dbba4e7e1'; // Vintage speaker
      } else if (name.includes('铂傲') || name.includes('B&O') || name.includes('Beoplay')) {
        photoId = '1527866990051-80479743340c'; // Circular luxury art speaker stand
      } else if (name.includes('Google') || name.includes('Nest') || name.includes('智能音')) {
        photoId = '1595781518738-7fd6cbf2608c'; // Google nest mini clean aesthetic
      } else {
        photoId = '1546435770-e3743c4f263e'; // Minimalist design speaker
      }
    } else if (name.includes('多士炉') || name.includes('多士') || name.includes('面包')) {
      if (name.includes('马卡龙') || name.includes('SMEG') || name.includes('复古')) {
        photoId = '1588854337236-6889d631faa8'; // Smeg retro mint green toaster
      } else {
        photoId = '1524282741744-19c836640539'; // Matte black luxury sleek toaster
      }
    } else if (name.includes('烤箱') || name.includes('微波') || name.includes('蒸烤') || name.includes('烘箱')) {
      if (name.includes('嵌入式')) {
        photoId = '1607604276583-eef5d076aa5f'; // Modern high-end integrated microwave oven
      } else {
        photoId = '1616486338812-36a72145d212'; // Sleek dark stainless kitchen oven unit
      }
    } else if (name.includes('无叶') || name.includes('风扇') || name.includes('凉衣') || name.includes('Cool') || name.includes('GreenFan')) {
      photoId = '1618944847848-96a5de04cc0f'; // Minimalist floor tower cooling fan
    } else if (name.includes('净化器') || name.includes('除醛') || name.includes('检测仪') || name.includes('Blueair')) {
      if (name.includes('布鲁雅尔')) {
        photoId = '1513519245088-0e12902e5a38'; // Scandinavian design space air purifier look
      } else {
        photoId = '1513519245088-0e12902e5a38'; // Premium air purifier
      }
    } else if (name.includes('扫拖') || name.includes('扫地') || name.includes('Roomba') || name.includes('机器人')) {
      photoId = '1614064641938-3bbee52942c7'; // Robotic smart vacuum cleaner moving on floor
    } else if (name.includes('热水壶') || name.includes('电水壶') || name.includes('温控壶') || name.includes('Kettle') || name.includes('热水瓶') || name.includes('真空电')) {
      if (name.includes('Drip') || name.includes('滴滤') || name.includes('手冲') || name.includes('Black')) {
        photoId = '1565156224-ca9117fb7227'; // Black pour-over copper scale kettle
      } else {
        photoId = '1565156224-ca9117fb7227'; // Beautiful electric kitchen kettle
      }
    } else if (name.includes('吸尘器') || name.includes('Detect') || name.includes('v15')) {
      photoId = '1614064641938-3bbee52942c7'; // Cordless smart robotic/stick cleaning machine placeholder
    } else if (name.includes('牙刷') || name.includes('Sonicare')) {
      photoId = '1607613009820-a29f7bb81a04'; // Sleek electronic toothbrush set
    } else if (name.includes('冲牙器') || name.includes('极净')) {
      photoId = '1595034608307-a690226359be'; // High end individual dental washer device
    } else if (name.includes('熨烫') || name.includes('挂烫') || name.includes('熨平')) {
      photoId = '1584622781564-1d987f7333c1'; // Luxurious steam ironing setup
    } else if (name.includes('破壁') || name.includes('料理锅') || name.includes('料理机') || name.includes('大容量') || name.includes('混合')) {
      if (name.includes('揉面') || name.includes('厨师机') || name.includes('Artisan')) {
        photoId = '1563861826131-df1e3098523c'; // KitchenAid heavy stand mixer
      } else {
        photoId = '1579783900885-19a531f81d11'; // Vitamix blender jar
      }
    } else if (name.includes('榨汁') || name.includes('juicer') || name.includes('慢汁')) {
      photoId = '1578319929554-1594835848bb'; // Smeg pastel retro juicer machine
    } else if (name.includes('落日灯') || name.includes('台灯') || name.includes('烛') || name.includes('柔光') || name.includes('照明') || name.includes('床头灯') || name.includes('灯')) {
      if (name.includes('几何') || name.includes('金')) {
        photoId = '1583394838336-15e189288597'; // Floating warm golden glow circle light
      } else {
        photoId = '1544716278-ca5e3f4abd8c'; // Sleek wooden floor lamp / table warm light
      }
    } else if (name.includes('冰箱') || name.includes('Red') || name.includes('利勃') || name.includes('冷箱') || name.includes('冰柜') || name.includes('fridge')) {
      photoId = '1583847268964-b28dc8f51f92'; // Smeg style retro custom red designer fridge single door
    } else if (name.includes('红酒柜') || name.includes('酒窖') || name.includes('酒柜') || name.includes('Cellar')) {
      photoId = '1615615228022-de9d09a8acc0'; // High precision digital temp single column wine fridge
    } else if (name.includes('电饭煲') || name.includes('饭煲') || name.includes('IH') || name.includes('不粘锅') || name.includes('烤盘') || name.includes('多功能锅')) {
      photoId = '1591150930370-4a193c7ebd86'; // Copper induction cooker setup with heavy clay pot
    } else if (name.includes('集成灶') || name.includes('电磁') || name.includes('Stove') || name.includes('灶')) {
      photoId = '1556911220-e15b29be8c8f'; // Elite heavy professional custom kitchen range burners
    } else if (name.includes('洗碗机') || name.includes('护理柜') || name.includes('Styler') || name.includes('衣物')) {
      photoId = '1607604276583-eef5d076aa5f'; // Luxury kitchen dishwasher compartment built in
    } else if (name.includes('洗烘') || name.includes('洗衣机') || name.includes('滚筒')) {
      photoId = '1626806787461-102c1bfaadc1'; // LG / Panasonic premium washer-dryer front load stack
    } else {
      photoId = '1513519245088-0e12902e5a38'; // Scandinavian design space air purifier look
    }
  }

  // Fallback to high-quality categorical cyclic selection
  if (!photoId) {
    const baseIndex = id % pool.length;
    photoId = pool[baseIndex];
  }

  // Inject beautiful, stable crop-zoom parameters to differentiate multiple goods using the same base photo
  let params = '';
  const zoomIndex = id % 4;
  if (zoomIndex === 1) {
    params += '&crop=focalpoint&fp-z=1.12&fp-x=0.5&fp-y=0.5';
  } else if (zoomIndex === 2) {
    params += '&crop=focalpoint&fp-z=1.18&fp-x=0.48&fp-y=0.52';
  } else if (zoomIndex === 3) {
    params += '&crop=focalpoint&fp-z=1.06';
  }

  // Stable cache signature to ensure high performance loading
  params += `&p_id=luxury-product-${category.charCodeAt(0) % 100}-${id}`;

  return `https://images.unsplash.com/photo-${photoId}?w=600&auto=format&fit=crop&q=80${params}`;
}

function generate1000Products(): Product[] {
  const result: Product[] = [...CORE_PRODUCTS];
  
  const dynamicCategories = ['臻选腕表', '奢享沙龙香', '高级珠宝', '匠心皮具', '大师器物', '香水', '家用电器'];
  
  let idCounter = 11;
  let categorySelector = 0;

  // Fully populating up to 1500 high-luxury products, guaranteeing individual classic images
  while (idCounter <= 1500) {
    const category = dynamicCategories[categorySelector % dynamicCategories.length];
    const noun = NOUNS[idCounter % NOUNS.length];
    const style = STYLES[(idCounter + 2) % STYLES.length];
    const adj = ADJECTIVES[(idCounter + 4) % ADJECTIVES.length];
    
    // Determine plausible price ranges based on luxury categories in Japanese Yen (JPY)
    let costPrice = 20000;
    let markup = 1.12;
    
    if (category === '臻选腕表') {
      costPrice = 850000 + (idCounter * 12500) % 9500000; // Realistic range: 850,000 to 10,350,000 JPY
      markup = 1.08 + ((idCounter % 5) * 0.01); // 8% to 12% commission
    } else if (category === '高级珠宝') {
      costPrice = 180000 + (idCounter * 7500) % 3500000; // Realistic range: 180,000 to 3,680,000 JPY
      markup = 1.10 + ((idCounter % 3) * 0.015); // 10% to 14.5% commission
    } else if (category === '匠心皮具') {
      costPrice = 220000 + (idCounter * 5000) % 2500000; // Realistic range: 220,000 to 2,720,000 JPY
      markup = 1.09 + ((idCounter % 4) * 0.01); // 9% to 12% commission
    } else if (category === '奢享沙龙香' || category === '香水') {
      costPrice = 16000 + (idCounter * 120) % 45000; // Realistic range: 16,000 to 61,000 JPY
      markup = 1.11; // 11% flat
    } else if (category === '家用电器') {
      costPrice = 38000 + (idCounter * 1500) % 450000; // Realistic range: 38,000 to 488,000 JPY
      markup = 1.10 + ((idCounter % 4) * 0.01); // 10% to 13% commission
    } else { // 大师器物
      costPrice = 18000 + (idCounter * 550) % 150000; // Realistic range: 18,000 to 168,000 JPY
      markup = 1.12; // 12% flat
    }

    const retailPrice = Math.max(costPrice + 100, Math.round(costPrice * markup / 100) * 100);
    const profit = retailPrice - costPrice;
    
    let itemName = `${noun}${style}`;
    let itemDescription = `此款${noun}${style}是${adj}匠心力作。甄选卓越材质，精细融合现代与经典，为高阶美学生活家量身定制。`;

    if (category === '香水') {
      const perfumeNames = [
        '荒野玫瑰沙龙高定香水', '蔚蓝深海极境男士古龙水', '无人区午后乌木沙龙香',
        '极光白麝香私享淡香氛', '薄荷森林清晨秘境冷香', '鎏金琥珀高阶无香精沙龙香',
        '尼罗河雨后风铃高阶古龙', '雪松之吻温暖木质中性香', '黑色大丽花冷冽禁忌感沙龙香'
      ];
      itemName = perfumeNames[idCounter % perfumeNames.length];
      itemDescription = `此款${itemName}由法国顶级沙龙调香大师潜心研调。融合天然植物精粹，前中后调层次错落分明，持久缱绻，散发专属的高阶气场。`;
    } else if (category === '家用电器') {
      const applianceNames = [
        'Dyson Supersonic Ionic 戴森智能复古红控温吹风机',
        'La Pavoni Gold Professional 皇家拉霸金意式咖啡机',
        'Devialet Phantom Reactor 帝瓦雷高保真奢享蓝牙音响',
        'SMEG Retro Matte Mint 斯麦格复古马卡龙复古多士炉',
        'Balmuda The Toaster 百慕达蒸汽微波环保烤箱',
        'Dyson Pure Cool Link 戴森空气净化冷暖无叶风扇',
        'B&O Beoplay A9 Golden 铂傲重磅奢华圆形艺术音响',
        'Keurig K-Elite Special 特纯不锈钢多胶囊臻选咖啡机',
        'iRobot Roomba Combo 艾罗伯特双效全能智能扫拖机器人',
        'Breville Barista Pro 铂富全能大师研磨半自动咖啡机',
        'SMEG Pastel Blue Kettle 斯麦格复古温柔蓝温控电热水壶',
        'Vitamix Professional 维他密斯大容量全营养破壁料理机',
        'Marshall Stanmore III 马歇尔复古摇滚金高保真蓝牙音箱',
        'Blueair HealthProtect 布鲁雅尔高阶智能消毒净化防护仪',
        'Thermomix TM6 Special 美善品重磅全能触控多功能料理机',
        'Miele Generation C5 米勒嵌入式全自动温感咖啡中心',
        'Dyson v15 Detect Slim 戴森智能激光探层无绳吸尘器',
        'Philips Sonicare Diamond 飞利浦钻石极光智能声波牙刷',
        'Panasonic Cuble Deluxe 松下奢享滚筒洗烘一体全能护理机',
        'Laurastar Lift Premium 萝拉之星高压智能免烫蒸汽熨烫机',
        'Balmuda The GreenFan 百慕达自然风智能高效静音风扇',
        'Waterpik Aqua Deluxe 洁碧高奢脉冲温水极净高阶冲牙器',
        'Nespresso Lattissima 奈斯派索一键花式轻奢胶囊咖啡机',
        'Krups Silent Grind 克鲁伯无噪音精细研磨智能咖啡豆机',
        'Tiger Double-Heated 虎牌双重压差微电脑顶级IH电饭煲',
        'Zojirushi Supreme 象牌奢享高端微电脑恒温真空电热水瓶',
        'Delonghi Dedica Style 德龙经典轻奢复古泵压式咖啡机',
        'De’Longhi Icona Vintage 德龙复古橄榄绿不锈钢多士炉',
        'Morphy Richards Retro 摩飞复古英伦黑晶多功能料理锅',
        'Cuisinart Core Precision 美膳雅极真不锈钢双槽多士炉',
        'Bruno Retro Pastel Mint 布鲁诺复古轻排无烟不粘电烤盘',
        'Zojirushi Micom Special 象牌至尊微电脑温控IH电压力煲',
        'KitchenAid Artisan 凯膳怡经典复古厨师揉面机',
        'SMEG Citrus Juicer 斯麦格复古摩登风高膳食纤维榨汁机',
        'Hamilton Beach Elite 汉美驰至臻高真空电热养生蒸煮锅',
        'Panasonic Premium Flat 松下奢享变频镜面触控防辐射微波炉',
        'Kenwood Chef Titanium 凯伍德钛金台式多功能专业厨师机',
        'Miele Compact Airpur 米勒至真无菌级智能除醛负离子净化器',
        'Breville Smart Oven 铂富智幕控温多焦专业级空气炸箱',
        'Laurastar Smart U 萝拉之星至尊系统高定挂烫熨平一体机',
        'Barisieur Tea Coffee Alarm 创艺清晨咖啡冲泡自动闹钟茶机',
        'Geneva Touring Luxury 杰涅瓦便携奢华小牛皮复古全频音箱',
        'Anova Precision Pro 阿诺瓦高精密真空低温慢煮恒温机',
        'Liebherr Vintage Red 利勃海尔奢光单门复古尊享小冰箱',
        'Jura E8 Platinum 优瑞全自动铂金智能大尺寸触控咖啡机',
        'Elica NikolaTesla 艾利卡顶级吸油烟电磁双能集成灶',
        'SMEG Drip Filter 斯麦格复古奶白色美式滴滤式咖啡机',
        'Sub-Zero Classic Cellar 萨博顶级精控恒温恒湿避震红酒柜',
        'Vintec Single Zone 温特克奢享单温区精锐高静音壁饰酒吧柜',
        'LG Styler Mirror 乐金镜面奢享蒸汽喷雾衣物塑形蒸汽护理柜'
      ];
      itemName = applianceNames[idCounter % applianceNames.length];
      itemDescription = `此款${itemName}是智能科技与现代奢华生活美学深度融合之作。配置先进的芯片调控与精研工艺材质，在日常的每一次起居交互中提供极致无瑕的生活享受。`;
    }

    // Get guaranteed unique, beautifully matching color/zoom classic product photo
    const image = getUniqueImageForProduct(category, idCounter, itemName);

    const item: Product = {
      id: `LP-${String(idCounter).padStart(4, '0')}`,
      name: itemName,
      category,
      costPrice,
      retailPrice,
      profit,
      description: itemDescription,
      sku: `${category.substring(0, 2).toUpperCase()}-${noun.substring(0, 2).toUpperCase()}-${String(1000 + idCounter).substring(1)}`,
      image
    };

    result.push(item);
    idCounter++;
    categorySelector++;
  }

  // Generate 200 high-end adult wellness, lingerie, and silk stocking luxury items from LP-1501 to LP-1700
  const adultToys = [
    'Pulse Wave Pro 智能声波吸吮按摩器', 'Silk Touch II 奢华变频恒温震动棒', 
    'Aero Air-Pulse 拟真智能声波气流按摩仪', 'Pleasure Ring Pro 钛金温控变频智能环',
    'Velvet Sensation 极软硅胶无线遥控跳蛋', 'Luminous Aura 智能声控恒温御手跳蛋',
    'Whisper Silk 智能超静音硅胶脉冲棒', 'Aria Sensual Touch 极奢声波吸吮理疗仪',
    'Saffron Glow 舒缓按摩温热香薰精油', 'Elysian Wave 奢享双向脉冲无线振动仪'
  ];
  const adultToysDesc = [
    '采用医疗级抗菌硅胶与高频共振电机，独有声波吸吮科技迅速唤醒多重感官，带来无可比拟的奢华私密愉悦。',
    '极静低噪变频微震设计，配备智能精准恒温加热系统，温润触感如影随行，细滑如丝般温柔呵护。',
    '创新脉冲气流科技配合智能感应芯片，温柔包裹并产生有节奏的多频微压按摩，为高端生活家定制私密欢愉。',
    '精湛合金钢一体铸造，搭载双核智能自适应压力变频，有效优化血液流动与持久体验，高奢尊贵。'
  ];

  const lingerieBrands = ['La Perla', 'Agent Provocateur', 'Aubade', 'Bordelle', 'Fleur du Mal', 'Coco de Mer', 'Carine Gilson', 'I.D. Sarrieri'];
  const lingerieStyles = [
    '高定法式印饰水溶蕾丝透视胸衣', '真丝缎面深V刺绣奢华温柔吊带裙', 
    '极夜禁忌金属搭扣绑带连体胸衣', '宫廷复古奢华半杯提拢内衣套组',
    '无痕轻薄流沙蚕丝优雅束身衣', '法国奢华纯手工蕾丝私享睡袍',
    '暮光之城极奢镂空刺绣透视内衣', '魅影极奢天鹅绒绑带性感内衣'
  ];
  const lingerieDesc = [
    '选用最珍稀的法式里昂手工蕾丝与19姆米重磅天然蚕丝，由高定礼服工坊专属匠师纯手工缝制，贴合身形，绽放性感魅力。',
    '精美立体的重工刺绣图案镶嵌在极细透视薄纱之上，极致奢华深V剪裁，散发极致魅惑与不可方物的尊贵感。',
    '前卫而极其奢华的交叉绑带设计，巧妙搭配镀金金属配件，挺拔身形的同时，极致衬托神秘禁忌的高阶质感。',
    '古典宫廷风与现代审美的神级融合，杯面铺满细密水溶蕾丝，具有完美的托高与线条雕琢效果，令人沉醉。'
  ];

  const stockingsBrands = ['Wolford', 'Falke', 'Gerbe', 'Fogal', 'Cervin', 'Pierre Mantoux', 'Trasparenze'];
  const stockingsStyles = [
    'Satin Touch 哑光莹润极薄连裤丝袜', 'Classic Lace Top 硅胶防滑蕾丝大腿袜', 
    'Ultra-Sheer 10D 晨曦微光极薄裤袜', 'Vintage Back-Seam 复古针织后缝线丝袜',
    'Silk-Blend Extreme 极其细软高比例真丝混纺袜', 'Premium Honeycomb 细密微光镂空网袜',
    'Shiny Glossy 尊享艳丽高光泽连裤袜', 'Classy Suspension 极简蕾丝无痕裤袜'
  ];
  const stockingsDesc = [
    '奥地利顶奢面料织造工艺，带来第二层肌肤般的丝滑顺服。极清透10D厚度散发着朦胧微光，修饰双腿完美轮廓。',
    '采用医用级防滑硅胶条双层加固，结合古典而绝美的水溶蕾丝阔边，精弹耐磨，极致演绎经典法式浪漫。',
    '融合天然昂贵真丝纤维与高弹氨纶，呈现独一无二的高级亚光色泽与顺滑质感，轻盈透气抗勾丝。',
    '传承半个世纪的经典工艺，采用后置手工缝合线设计，视觉上无限延伸双腿线条，彰显低调复古的神秘奢华。'
  ];

  for (let id = 1501; id <= 1700; id++) {
    let itemName = '';
    let itemDescription = '';
    let costPrice = 8000;
    
    if (id % 3 === 0) {
      const toyName = adultToys[id % adultToys.length];
      const desc = adultToysDesc[id % adultToysDesc.length];
      const prefix = ['LELO', 'SVAKOM', 'Satisfyer', 'We-Vibe', 'Womanizer'][(id + 1) % 5];
      itemName = `${prefix} ${toyName}`;
      itemDescription = `此款 ${itemName} ${desc}`;
      costPrice = 8500 + (id * 150) % 18000;
    } else if (id % 3 === 1) {
      const brand = lingerieBrands[id % lingerieBrands.length];
      const style = lingerieStyles[(id + 2) % lingerieStyles.length];
      const desc = lingerieDesc[id % lingerieDesc.length];
      itemName = `${brand} ${style}`;
      itemDescription = `此款 ${itemName} ${desc}`;
      costPrice = 12000 + (id * 230) % 36000;
    } else {
      const brand = stockingsBrands[id % stockingsBrands.length];
      const style = stockingsStyles[(id + 1) % stockingsStyles.length];
      const desc = stockingsDesc[id % stockingsDesc.length];
      itemName = `${brand} ${style}`;
      itemDescription = `此款 ${itemName} ${desc}`;
      costPrice = 1800 + (id * 40) % 5500;
    }

    const materials = ['限量版', '尊享款', '极奢系列', '幻影黑', '玫瑰金', '波尔多红', '蕾丝白', '深夜蓝'];
    const material = materials[id % materials.length];
    itemName = `${itemName} (${material})`;
    
    const markup = 1.10 + ((id % 4) * 0.015);
    const retailPrice = Math.max(costPrice + 100, Math.round(costPrice * markup / 100) * 100);
    const profit = retailPrice - costPrice;

    const image = getUniqueImageForProduct('情趣用品', id, itemName);

    const item: Product = {
      id: `LP-${String(id).padStart(4, '0')}`,
      name: itemName,
      category: '情趣用品',
      costPrice,
      retailPrice,
      profit,
      description: itemDescription,
      sku: `AD-SW-${String(1000 + id).substring(1)}`,
      image
    };

    result.push(item);
  }

  return result;
}

export const ALL_PRODUCTS = generate1000Products();

export const SHOP_DATA_KEY = 'h5_luxury_shop_details_stored';
export const ORDERS_DATA_KEY = 'h5_luxury_orders_stored';

// Default initial config
export const DEFAULT_SHOP = {
  id: 'master-shop-888',
  name: 'AliExpress Seller Store',
  avatar: defaultAvatar, // Registered AliExpress Seller App Logo
  qrCode: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&auto=format&fit=crop&q=80', // Generic visual placeholder representing wechat card, or text-based design
  addedProductIds: ['LP-0001', 'LP-0002', 'LP-0003', 'LP-0004', 'LP-0005', 'LP-0006', 'LP-0007', 'LP-0009', 'LP-0010'], // Initial pre-selected products
};

export const DEFAULT_ORDERS = [
  {
    id: 'ORD-20260528-001',
    shopId: 'master-shop-888',
    customerName: '宋晓阳',
    customerPhone: '13812345678',
    shippingAddress: '上海市徐汇区龙腾大道 2555号 滨江艺术大厦 A座 22楼',
    orderDate: '2026-05-28 08:30',
    items: [
      {
        productId: 'LP-0001',
        productName: 'Cartier Bordeaux Classic 卡地亚经典勃艮第红机械表',
        quantity: 1,
        retailPrice: 920000,
        costPrice: 850000,
        image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80'
      }
    ],
    totalPrice: 920000,
    totalProfit: 70000,
    status: 'pending' as const
  },
  {
    id: 'ORD-20260528-002',
    shopId: 'master-shop-888',
    customerName: '季雨桐',
    customerPhone: '15988889911',
    shippingAddress: '北京市朝阳区三里屯路 19号院 三里屯太古里北区 N4-30号',
    orderDate: '2026-05-28 07:15',
    items: [
      {
        productId: 'LP-0002',
        productName: 'Gilded Amber Niche Perfume 鎏金琥珀沙龙高定香水',
        quantity: 2,
        retailPrice: 19800,
        costPrice: 17805,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80'
      }
    ],
    totalPrice: 39600,
    totalProfit: 3990,
    status: 'shipped' as const
  }
];
