export type Role = 'admin' | 'manager' | 'customer';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type InventoryChangeType = 'restock' | 'sale' | 'adjustment' | 'return';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  imageUrl?: string;
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
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number | string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  status: OrderStatus;
  total: number | string;
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
