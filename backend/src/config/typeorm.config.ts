import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { CartItem } from '../models/cart-item.model';
import { InventoryLog } from '../models/inventory-log.model';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'shopmvc',
    entities: [User, Category, Product, Order, OrderItem, CartItem, InventoryLog],
    synchronize: true, // dev only - use migrations in production
    logging: false,
  }),
);
