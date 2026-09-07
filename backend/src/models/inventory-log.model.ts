import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.model';
import { InventoryChangeType } from './enums';

@Entity('inventory_logs')
export class InventoryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.inventoryLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'enum', enum: InventoryChangeType })
  type: InventoryChangeType;

  @Column()
  quantityChange: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
