import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Role } from '../models/enums';
import { AddCartItemDto, UpdateCartItemDto } from '../dto/cart.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  myCart(@CurrentUser('id') userId: string) {
    return this.cartService.findMyCart(userId);
  }

  @Post()
  addItem(@CurrentUser('id') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch(':id')
  updateItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, id, dto);
  }

  @Delete(':id')
  removeItem(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  clear(@CurrentUser('id') userId: string) {
    return this.cartService.clear(userId);
  }
}
