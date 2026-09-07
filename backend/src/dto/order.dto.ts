import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../models/enums';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
