import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { InventoryChangeType } from '../models/enums';

export class AdjustInventoryDto {
  @IsUUID()
  productId: string;

  @IsEnum(InventoryChangeType)
  type: InventoryChangeType;

  @IsInt()
  quantityChange: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
