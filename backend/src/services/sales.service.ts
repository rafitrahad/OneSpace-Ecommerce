import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/enums';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
  ) {}

  async summary() {
    const validStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const orders = await this.ordersRepository.find({
      where: validStatuses.map((status) => ({ status })),
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;

    const byStatus = Object.values(OrderStatus).map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      byStatus,
    };
  }

  async topProducts(limit = 5) {
    const raw = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.quantity * item.price)', 'revenue')
      .where('order.status != :cancelled', {
        cancelled: OrderStatus.CANCELLED,
      })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('"unitsSold"', 'DESC')
      .limit(limit)
      .getRawMany();

    return raw.map((r) => ({
      productId: r.productId,
      name: r.name,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
    }));
  }

  async revenueByDay(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const raw = await this.ordersRepository
      .createQueryBuilder('order')
      .select("DATE(order.createdAt)", 'date')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.createdAt >= :since', { since })
      .andWhere('order.status != :cancelled', {
        cancelled: OrderStatus.CANCELLED,
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return raw.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  }
}
