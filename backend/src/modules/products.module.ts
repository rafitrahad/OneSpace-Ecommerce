import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';
import { ProductsController } from '../controllers/products.controller';
import { ActivityLogModule } from './activity-log.module';
import { UsersModule } from './users.module';
import { MailerService } from '../services/mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ActivityLogModule, UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService, MailerService],
  exports: [ProductsService],
})
export class ProductsModule {}
