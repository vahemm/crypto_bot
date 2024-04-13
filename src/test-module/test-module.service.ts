import { Inject, Injectable } from '@nestjs/common';
import { RestClientV5 } from 'bybit-api';

@Injectable()
export class TestModuleService {
  constructor(
    @Inject('ByBitClient')
    private byBitClient: RestClientV5,
  ) {}

  async testMethod() {
    return await this.byBitClient.getOrderbook({
      category: 'linear',
      symbol: 'BTCUSD',
    });
  }
}
