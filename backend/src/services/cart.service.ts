import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { AddCartItemDto, UpdateCartItemDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private cartRepository: Repository<CartItem>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  findMyCart(userId: string) {
    return this.cartRepository.find({ where: { userId } });
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    let item = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (item) {
      item.quantity += dto.quantity;
    } else {
      item = this.cartRepository.create({
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });
    }
    return this.cartRepository.save(item);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    return this.cartRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepository.delete(itemId);
    return { deleted: true };
  }

  async clear(userId: string) {
    await this.cartRepository.delete({ userId });
    return { cleared: true };
  }
}
