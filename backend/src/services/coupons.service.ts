import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../models/coupon.model';
import { CouponType } from '../models/enums';
import { CreateCouponDto, UpdateCouponDto } from '../dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private couponsRepository: Repository<Coupon>,
  ) {}

  findAll() {
    return this.couponsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.couponsRepository.findOne({ where: { code } });
    if (existing) throw new ConflictException('Coupon code already exists');

    if (dto.type === CouponType.PERCENTAGE && dto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100');
    }

    const coupon = this.couponsRepository.create({
      ...dto,
      code,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      usageLimit: dto.usageLimit ?? null,
    });
    return this.couponsRepository.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    await this.couponsRepository.update(id, {
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.couponsRepository.delete(id);
    return { deleted: true };
  }

  // Validates a coupon against an order subtotal and returns the discount
  // amount to apply. Throws if invalid - callers should catch and surface
  // the message to the customer.
  async validateAndCompute(code: string, subtotal: number) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.trim().toUpperCase() },
    });
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid coupon code');
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (Number(subtotal) < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `This coupon requires a minimum order of ${coupon.minOrderAmount}`,
      );
    }

    const discount =
      coupon.type === CouponType.PERCENTAGE
        ? (Number(subtotal) * Number(coupon.value)) / 100
        : Number(coupon.value);

    return {
      coupon,
      discountAmount: Math.min(discount, Number(subtotal)),
    };
  }

  async incrementUsage(id: string) {
    await this.couponsRepository.increment({ id }, 'usedCount', 1);
  }
}
