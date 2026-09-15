export type Role = 'admin' | 'manager' | 'customer';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type InventoryChangeType = 'restock' | 'sale' | 'adjustment' | 'return';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type CouponType = 'percentage' | 'fixed';
export type ActivityAction = 'create' | 'update' | 'delete' | 'status_change';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  themePreference?: ThemePreference;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface VariantGroup {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  imageUrl?: string;
  images?: string[] | null;
  variants?: VariantGroup[] | null;
  isActive: boolean;
  category?: Category;
  categoryId?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variant?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number | string;
  variant?: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number | string;
  discountAmount: number | string;
  total: number | string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  shippingAddress?: string;
  note?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  product?: Product;
  type: InventoryChangeType;
  quantityChange: number;
  reason?: string;
  createdAt: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  byStatus: { status: OrderStatus; count: number }[];
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number | string;
  minOrderAmount: number | string;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  description?: string;
  createdAt: string;
}
