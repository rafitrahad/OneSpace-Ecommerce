import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../models/order.model';
import { SalesService } from '../services/sales.service';
import { SalesController } from '../controllers/sales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
