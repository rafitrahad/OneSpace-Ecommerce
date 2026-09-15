import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../models/review.model';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/enums';
import { CreateReviewDto } from '../dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepository: Repository<Review>,
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
  ) {}

  findByProduct(productId: string) {
    return this.reviewsRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async summary(productId: string) {
    const reviews = await this.reviewsRepository.find({ where: { productId } });
    const count = reviews.length;
    const average = count
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;
    return { average: Math.round(average * 10) / 10, count };
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    // Only customers who have actually received an order containing this
    // product may review it - keeps reviews credible.
    const purchased = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .andWhere('item.productId = :productId', { productId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getCount();

    if (purchased === 0) {
      throw new BadRequestException(
        'You can only review products from a delivered order',
      );
    }

    const existing = await this.reviewsRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      userId,
      productId,
      rating: dto.rating,
      comment: dto.comment,
    });
    return this.reviewsRepository.save(review);
  }

  async remove(userId: string, role: string, id: string) {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && role !== 'admin') {
      throw new BadRequestException('You can only delete your own review');
    }
    await this.reviewsRepository.delete(id);
    return { deleted: true };
  }
}
