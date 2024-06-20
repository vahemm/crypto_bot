import { Controller, Get, Query } from '@nestjs/common';
import { ByBitService } from './by-bit.service';
import { IntervalDto } from './dtos/interval.dto';

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

  @Get('find_extremum_actual_levels_for_breakout')
  async findExtremumActualLevelsForBreakout(@Query() query: IntervalDto) {
    return await this.byBitService.findExtremumActualLevelsForBreakout(query);
  }

  @Get('find_trending_coins')
  async findTrendingCoins() {
    return await this.byBitService.findTrendingCoins();
  }

  @Get('test')
  async test() {
    return await this.byBitService.findExtremumLevelsForBreakout();
  }
}
