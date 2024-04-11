import { Inject, Injectable } from '@nestjs/common';
import { RestClientV5 } from 'bybit-api';

@Injectable()
export class ByBitTestService {
  constructor(
    @Inject('ByBitClient')
    private byBitClient: RestClientV5,
  ) {}

  async testByBitClient() {
    console.log({ loger: this.byBitClient });
    const result = await this.byBitClient.getOrderbook({ category: 'linear', symbol: 'BTCUSD' })
    console.log({result});
    

    return this.byBitClient;
  }
}
