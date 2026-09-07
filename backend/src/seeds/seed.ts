import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { CartItem } from '../models/cart-item.model';
import { InventoryLog } from '../models/inventory-log.model';
import { Role } from '../models/enums';

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'shopmvc',
    entities: [User, Category, Product, Order, OrderItem, CartItem, InventoryLog],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected. Seeding...');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await userRepo.save(
    userRepo.create({
      name: 'Admin User',
      email: 'admin@shopmvc.test',
      password: passwordHash,
      role: Role.ADMIN,
    }),
  );

  const manager = await userRepo.save(
    userRepo.create({
      name: 'Shop Manager',
      email: 'manager@shopmvc.test',
      password: passwordHash,
      role: Role.MANAGER,
    }),
  );

  const customer = await userRepo.save(
    userRepo.create({
      name: 'Jane Customer',
      email: 'customer@shopmvc.test',
      password: passwordHash,
      role: Role.CUSTOMER,
    }),
  );

  const categories = await categoryRepo.save([
    categoryRepo.create({ name: 'Electronics', description: 'Gadgets and devices' }),
    categoryRepo.create({ name: 'Home & Kitchen', description: 'Everyday essentials' }),
    categoryRepo.create({ name: 'Apparel', description: 'Clothing and accessories' }),
  ]);

  await productRepo.save([
    productRepo.create({
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones',
      price: 89.99,
      stock: 45,
      category: categories[0],
      imageUrl: '',
    }),
    productRepo.create({
      name: 'Smart Watch',
      description: 'Fitness tracking smart watch',
      price: 129.5,
      stock: 30,
      category: categories[0],
      imageUrl: '',
    }),
    productRepo.create({
      name: 'Ceramic Mug Set',
      description: 'Set of 4 ceramic mugs',
      price: 24.0,
      stock: 8,
      category: categories[1],
      imageUrl: '',
    }),
    productRepo.create({
      name: 'Cotton T-Shirt',
      description: 'Everyday soft cotton tee',
      price: 15.0,
      stock: 120,
      category: categories[2],
      imageUrl: '',
    }),
  ]);

  console.log('Seed complete.');
  console.log('Admin:    admin@shopmvc.test / Password123!');
  console.log('Manager:  manager@shopmvc.test / Password123!');
  console.log('Customer: customer@shopmvc.test / Password123!');

  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
