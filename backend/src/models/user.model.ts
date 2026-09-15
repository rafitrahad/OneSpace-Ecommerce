import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role, ThemePreference } from './enums';
import { Order } from './order.model';
import { CartItem } from './cart-item.model';
import { Review } from './review.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // Nullable because Google-authenticated accounts have no local password.
  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpiresAt: Date | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  // Incremented by "log out of all devices". JWTs carry the version they were
  // issued with; a mismatch means the token is stale and gets rejected.
  @Exclude()
  @Column({ default: 1 })
  tokenVersion: number;

  // 'system' (default) follows the visitor's device setting; 'light'/'dark'
  // is an explicit choice, saved so it follows the user to any device.
  @Column({ type: 'enum', enum: ThemePreference, default: ThemePreference.SYSTEM })
  themePreference: ThemePreference;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CartItem, (item) => item.user)
  cartItems: CartItem[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}