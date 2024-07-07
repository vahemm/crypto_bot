import { Inject, Injectable } from '@nestjs/common';
import { RestClientV5 } from 'bybit-api';

@Injectable()
export class TestModuleService {
  constructor(
    @Inject('ByBitClient')
    private byBitClientApi: RestClientV5,
  ) {}

  async testMethod() {
    return await this.byBitClientApi.getOrderbook({
      category: 'linear',
      symbol: 'BTCUSD',
    });
  }
}
