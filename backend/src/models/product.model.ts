import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.model';
import { OrderItem } from './order-item.model';
import { InventoryLog } from './inventory-log.model';
import { Review } from './review.model';

// A simple variant group, e.g. { name: 'Size', options: ['S', 'M', 'L'] }.
// Kept intentionally simple: stock is tracked at the product level, not
// per-variant-combination, to keep checkout/inventory logic manageable.
export interface VariantGroup {
  name: string;
  options: string[];
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  // Cover image (kept for backward compatibility with existing rows / forms
  // that only set a single image).
  @Column({ nullable: true })
  imageUrl: string;

  // Full gallery. Stored as JSON array of URLs; imageUrl (if set) is treated
  // as the first/cover image by the frontend.
  @Column({ type: 'json', nullable: true })
  images: string[] | null;

  // Optional variant groups, e.g. [{ name: 'Size', options: ['S','M','L'] }]
  @Column({ type: 'json', nullable: true })
  variants: VariantGroup[] | null;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => InventoryLog, (log) => log.product)
  inventoryLogs: InventoryLog[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
