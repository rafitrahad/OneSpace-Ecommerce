import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { OrdersService } from '../services/orders.service';
import { OrdersController } from '../controllers/orders.controller';
import { MailerService } from '../services/mailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, Product]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, MailerService],
})
export class OrdersModule {}
