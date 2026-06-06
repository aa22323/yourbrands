export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  profit: number;
  description: string;
  sku: string;
}

export interface Shop {
  id: string;
  name: string;
  avatar: string; // Avatar image URL
  qrCode: string;  // Merchant QR Code URL or Base64
  addedProductIds: string[]; // List of product IDs active in this shop
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  retailPrice: number;
  costPrice: number;
  image: string;
}

export interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  orderDate: string;
  items: OrderItem[];
  totalPrice: number;
  totalProfit: number;
  status: 'pending' | 'shipped' | 'completed';
  isSelfOrder?: boolean;
  shippedAt?: string;
}

export type ViewRole = 'merchant' | 'customer';
export type AppTab = 'home' | 'pick' | 'cart' | 'profile';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FinancialTransaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'promotion' | 'settlement';
  typeLabel: string;
  amount: number;
  status: '成功' | '已到账' | '已扣除' | '已提交' | '已拒绝';
  description: string;
  createdAt: string;
}

