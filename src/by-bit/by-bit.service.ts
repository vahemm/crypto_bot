import { Inject, Injectable } from '@nestjs/common';
import { RestClientV5 } from 'bybit-api';

@Injectable()
export class ByBitService {
  constructor(
    @Inject('ByBitClient')
    private byBitClient: RestClientV5,
  ) {}

  async testByBitClient() {
    return await this.byBitClient.getOrderbook({
      category: 'linear',
      symbol: 'BTCUSD',
    });
  }
}
