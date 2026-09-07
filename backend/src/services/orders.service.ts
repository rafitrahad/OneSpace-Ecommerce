import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { OrderStatus, Role } from '../models/enums';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';
import { MailerService } from './mailer.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(CartItem) private cartRepository: Repository<CartItem>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    private dataSource: DataSource,
    private mailerService: MailerService,
  ) {}

  // Customer: checkout - turns current cart into an order
  async checkout(userId: string, userEmail: string, dto: CreateOrderDto) {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    if (cartItems.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cartItems) {
        const product = await manager.findOne(Product, {
          where: { id: cartItem.productId },
        });
        if (!product) throw new NotFoundException('Product no longer exists');
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${product.name}`,
          );
        }

        product.stock -= cartItem.quantity;
        await manager.save(product);

        const item = manager.create(OrderItem, {
          productId: product.id,
          quantity: cartItem.quantity,
          price: product.price,
        });
        orderItems.push(item);
        total += Number(product.price) * cartItem.quantity;
      }

      const order = manager.create(Order, {
        userId,
        items: orderItems,
        total,
        status: OrderStatus.PENDING,
        shippingAddress: dto.shippingAddress,
        note: dto.note,
      });
      const saved = await manager.save(order);

      await manager.delete(CartItem, { userId });

      this.mailerService
        .sendOrderConfirmation(userEmail, saved.id, total)
        .catch(() => undefined);

      return saved;
    });
  }

  findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin/Manager: view all orders
  findAll() {
    return this.ordersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    order.status = dto.status;
    const saved = await this.ordersRepository.save(order);
    this.mailerService
      .sendOrderStatusUpdate(order.user.email, order.id, dto.status)
      .catch(() => undefined);
    return saved;
  }

  // Customer: cancel own order (only while pending/processing)
  async cancel(userId: string, role: Role, id: string) {
    const order = await this.findOne(id);
    if (role === Role.CUSTOMER && order.userId !== userId) {
      throw new ForbiddenException('This is not your order');
    }
    if (![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(order.status)) {
      throw new BadRequestException(
        'Order can no longer be cancelled at this stage',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      for (const item of order.items) {
        await manager.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
      }
      order.status = OrderStatus.CANCELLED;
      return manager.save(order);
    });
  }
}
