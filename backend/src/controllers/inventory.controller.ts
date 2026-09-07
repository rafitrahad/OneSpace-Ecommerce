import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Role } from '../models/enums';
import { AdjustInventoryDto } from '../dto/inventory.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('adjust')
  adjust(@Body() dto: AdjustInventoryDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.adjust(dto, userId);
  }

  @Get('logs')
  logs(@Query('productId') productId?: string) {
    return this.inventoryService.findLogs(productId);
  }

  @Get('low-stock')
  lowStock(@Query('threshold') threshold?: string) {
    return this.inventoryService.lowStock(
      threshold ? parseInt(threshold, 10) : undefined,
    );
  }
}
