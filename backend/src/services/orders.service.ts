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
import { OrderStatus, PaymentMethod, PaymentStatus, Role, ActivityAction } from '../models/enums';
import { CreateOrderDto, UpdateOrderStatusDto, UpdatePaymentStatusDto } from '../dto/order.dto';
import { MailerService } from './mailer.service';
import { CouponsService } from './coupons.service';
import { ActivityLogService } from './activity-log.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(CartItem) private cartRepository: Repository<CartItem>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    private dataSource: DataSource,
    private mailerService: MailerService,
    private couponsService: CouponsService,
    private activityLogService: ActivityLogService,
  ) {}

  // Customer: checkout - turns current cart into an order
  async checkout(userId: string, userEmail: string, dto: CreateOrderDto) {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    if (cartItems.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }
    if (dto.paymentMethod !== PaymentMethod.COD && !dto.paymentTransactionId) {
      throw new BadRequestException(
        'Please enter the transaction ID from your mobile banking payment',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
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
          variant: cartItem.variant,
        });
        orderItems.push(item);
        subtotal += Number(product.price) * cartItem.quantity;
      }

      let discountAmount = 0;
      let couponCode: string | undefined;
      if (dto.couponCode) {
        const result = await this.couponsService.validateAndCompute(
          dto.couponCode,
          subtotal,
        );
        discountAmount = result.discountAmount;
        couponCode = result.coupon.code;
        await this.couponsService.incrementUsage(result.coupon.id);
      }

      const total = subtotal - discountAmount;

      // COD is "pay on delivery" so nothing to verify yet. Mobile banking
      // payments start as pending until staff manually confirm the
      // transaction ID against their bKash/Nagad merchant account.
      const paymentStatus =
        dto.paymentMethod === PaymentMethod.COD
          ? PaymentStatus.PENDING
          : PaymentStatus.PENDING;

      const order = manager.create(Order, {
        userId,
        items: orderItems,
        subtotal,
        discountAmount,
        total,
        couponCode,
        status: OrderStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        paymentStatus,
        paymentTransactionId: dto.paymentTransactionId,
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

  findAll() {
    return this.ordersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, actor: { id: string; name: string }) {
    const order = await this.findOne(id);
    order.status = dto.status;
    const saved = await this.ordersRepository.save(order);
    this.mailerService
      .sendOrderStatusUpdate(order.user.email, order.id, dto.status)
      .catch(() => undefined);
    this.activityLogService.record({
      userId: actor.id,
      userName: actor.name,
      action: ActivityAction.STATUS_CHANGE,
      entityType: 'order',
      entityId: id,
      description: `Set order #${id.slice(0, 8)} status to ${dto.status}`,
    });
    return saved;
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto, actor: { id: string; name: string }) {
    const order = await this.findOne(id);
    order.paymentStatus = dto.paymentStatus;
    const saved = await this.ordersRepository.save(order);
    this.activityLogService.record({
      userId: actor.id,
      userName: actor.name,
      action: ActivityAction.STATUS_CHANGE,
      entityType: 'order-payment',
      entityId: id,
      description: `Set order #${id.slice(0, 8)} payment status to ${dto.paymentStatus}`,
    });
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

  // CSV export for accounting - admin/manager only.
  async exportCsv(): Promise<string> {
    const orders = await this.findAll();
    const header = [
      'Order ID',
      'Customer',
      'Email',
      'Date',
      'Status',
      'Payment Method',
      'Payment Status',
      'Subtotal',
      'Discount',
      'Total',
      'Coupon',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.user?.name ?? '',
      o.user?.email ?? '',
      o.createdAt.toISOString(),
      o.status,
      o.paymentMethod,
      o.paymentStatus,
      o.subtotal,
      o.discountAmount,
      o.total,
      o.couponCode ?? '',
    ]);

    const escape = (value: unknown) => {
      const str = String(value ?? '');
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  }
}
