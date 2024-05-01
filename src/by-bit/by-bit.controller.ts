import { Controller, Get } from '@nestjs/common';
import { ByBitService } from './by-bit.service';

@Controller('by_bit')
export class ByBitController {
  constructor(private byBitService: ByBitService) {}

  @Get('find_extremum_levels')
  async findExtremumLevels() {
    return await this.byBitService.findExtremumLevelsMiddleware();
  }

  @Get('get_usdt_perpetual_all_coins')
  async getUSDTPerpetualAllCoins() {
    return await this.byBitService.getUSDTPerpetualAllCoins();
  }

  @Get('find_extremum_actual_levels')
  async findExtremumActualLevels() {
    return await this.byBitService.findExtremumActualLevels();
  }
}
