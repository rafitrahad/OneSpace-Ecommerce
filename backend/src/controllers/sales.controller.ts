import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SalesService } from '../services/sales.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../models/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get('summary')
  summary() {
    return this.salesService.summary();
  }

  @Get('top-products')
  topProducts(@Query('limit') limit?: string) {
    return this.salesService.topProducts(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('revenue-by-day')
  revenueByDay(@Query('days') days?: string) {
    return this.salesService.revenueByDay(days ? parseInt(days, 10) : undefined);
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.salesService.exportCsv();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="sales-report.csv"');
    res.send(csv);
  }
}
