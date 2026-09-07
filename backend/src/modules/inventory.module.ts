import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLog } from '../models/inventory-log.model';
import { Product } from '../models/product.model';
import { InventoryService } from '../services/inventory.service';
import { InventoryController } from '../controllers/inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryLog, Product])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
