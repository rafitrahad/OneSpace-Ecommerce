import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryLog } from '../models/inventory-log.model';
import { Product } from '../models/product.model';
import { AdjustInventoryDto } from '../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryLog)
    private logsRepository: Repository<InventoryLog>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async adjust(dto: AdjustInventoryDto, performedBy: string) {
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const newStock = product.stock + dto.quantityChange;
    if (newStock < 0) {
      throw new NotFoundException('Resulting stock cannot be negative');
    }

    await this.productsRepository.update(product.id, { stock: newStock });

    const log = this.logsRepository.create({
      productId: dto.productId,
      type: dto.type,
      quantityChange: dto.quantityChange,
      reason: dto.reason,
      performedBy,
    });
    return this.logsRepository.save(log);
  }

  findLogs(productId?: string) {
    return this.logsRepository.find({
      where: productId ? { productId } : {},
      relations: ['product'],
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async lowStock(threshold = 10) {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold })
      .orderBy('product.stock', 'ASC')
      .getMany();
  }
}
