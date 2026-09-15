import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.model';
import { ActivityAction } from '../models/enums';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from '../dto/product.dto';
import { ActivityLogService } from './activity-log.service';
import { MailerService } from './mailer.service';
import { UsersService } from './users.service';

const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    private activityLogService: ActivityLogService,
    private mailerService: MailerService,
    private usersService: UsersService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = true');

    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pageCount: Math.ceil(total / limit) };
  }

  findAllForStaff() {
    return this.productsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Simple "you may also like": same category, excluding this product.
  async related(id: string, limit = 4) {
    const product = await this.findOne(id);
    if (!product.categoryId) return [];
    return this.productsRepository.find({
      where: { categoryId: product.categoryId, isActive: true },
      take: limit + 1,
      order: { createdAt: 'DESC' },
    }).then((items) => items.filter((p) => p.id !== id).slice(0, limit));
  }

  async create(dto: CreateProductDto, actor: { id: string; name: string }) {
    const product = this.productsRepository.create(dto as Partial<Product>);
    const saved = await this.productsRepository.save(product);
    this.activityLogService.record({
      userId: actor.id,
      userName: actor.name,
      action: ActivityAction.CREATE,
      entityType: 'product',
      entityId: saved.id,
      description: `Created product "${saved.name}"`,
    });
    return saved;
  }

  async update(id: string, dto: UpdateProductDto, actor: { id: string; name: string }) {
    const before = await this.findOne(id);
    await this.productsRepository.update(id, dto as Partial<Product>);
    const updated = await this.findOne(id);

    this.activityLogService.record({
      userId: actor.id,
      userName: actor.name,
      action: ActivityAction.UPDATE,
      entityType: 'product',
      entityId: id,
      description: `Updated product "${updated.name}"`,
    });

    if (before.stock > LOW_STOCK_THRESHOLD && updated.stock <= LOW_STOCK_THRESHOLD) {
      this.sendLowStockAlert(updated);
    }
    return updated;
  }

  async remove(id: string, actor: { id: string; name: string }) {
    const product = await this.findOne(id);
    await this.productsRepository.delete(id);
    this.activityLogService.record({
      userId: actor.id,
      userName: actor.name,
      action: ActivityAction.DELETE,
      entityType: 'product',
      entityId: id,
      description: `Deleted product "${product.name}"`,
    });
    return { deleted: true };
  }

  async adjustStock(id: string, delta: number) {
    const product = await this.findOne(id);
    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    await this.productsRepository.update(id, { stock: newStock });
    const updated = await this.findOne(id);

    if (product.stock > LOW_STOCK_THRESHOLD && newStock <= LOW_STOCK_THRESHOLD) {
      this.sendLowStockAlert(updated);
    }
    return updated;
  }

  private async sendLowStockAlert(product: Product) {
    try {
      const staff = await this.usersService.findStaffEmails();
      for (const email of staff) {
        await this.mailerService.send(
          email,
          `Low stock alert: ${product.name}`,
          `${product.name} is down to ${product.stock} units (threshold: ${LOW_STOCK_THRESHOLD}). Consider restocking soon.`,
        );
      }
    } catch {
      // never let alerting break the main operation
    }
  }
}
