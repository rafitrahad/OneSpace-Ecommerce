import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { CartController } from '../controllers/cart.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Product])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
