import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import typeormConfig from './config/typeorm.config';

import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { CategoriesModule } from './modules/categories.module';
import { ProductsModule } from './modules/products.module';
import { InventoryModule } from './modules/inventory.module';
import { CartModule } from './modules/cart.module';
import { OrdersModule } from './modules/orders.module';
import { SalesModule } from './modules/sales.module';
import { ReviewsModule } from './modules/reviews.module';
import { CouponsModule } from './modules/coupons.module';
import { ActivityLogModule } from './modules/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeormConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get('database') as import('@nestjs/typeorm').TypeOrmModuleOptions,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    SalesModule,
    ReviewsModule,
    CouponsModule,
    ActivityLogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
