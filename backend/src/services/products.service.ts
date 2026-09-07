import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.model';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
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

  // Admin/Manager: see all products including inactive
  findAllForStaff() {
    return this.productsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(dto: CreateProductDto) {
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    await this.productsRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.productsRepository.delete(id);
    return { deleted: true };
  }

  async adjustStock(id: string, delta: number) {
    const product = await this.findOne(id);
    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    await this.productsRepository.update(id, { stock: newStock });
    return this.findOne(id);
  }
}
