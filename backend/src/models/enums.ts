export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum InventoryChangeType {
  RESTOCK = 'restock',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}
