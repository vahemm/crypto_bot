import { Controller, Get } from '@nestjs/common';
import { BybitService } from './bybit.service';

@Controller('bybit')
export class BybitController {
  constructor(private byBitService: BybitService) {}

  @Get('get_usdt_perpetual_all_coins')
  async getUSDTPerpetualAllCoinsBybit() {
    return await this.byBitService.getUSDTPerpetualAllCoinsBybit();
  }

  @Get('test')
  async tester() {
    return await this.byBitService.tradeFundingRateStrategy();
  }
}
