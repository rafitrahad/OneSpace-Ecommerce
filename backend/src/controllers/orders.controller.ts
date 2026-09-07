import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Role } from '../models/enums';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Customer: checkout from cart
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('checkout')
  checkout(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.checkout(userId, email, dto);
  }

  // Customer: view own order history
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('mine')
  myOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.findMyOrders(userId);
  }

  // Admin/Manager: view all orders
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // Admin/Manager: update order status (process order)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  // Customer cancels their own order; Admin/Manager can also cancel
  @Patch(':id/cancel')
  cancel(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancel(userId, role, id);
  }
}
