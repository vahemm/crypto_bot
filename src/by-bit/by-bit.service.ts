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

  async getUSDTPerpetualAllCoins() {
    const data = await this.byBitClient.getInstrumentsInfo({
      category: 'linear',
    });
    return data.result.list
      .map((item) => item.symbol)
      .filter((item) => item.includes('USDT'));
  }

  async findTimelyLevels() {
    const data = await this.byBitClient.getKline({
      category: 'linear',
      symbol: 'SHIB1000USDT',
      interval: '5',
      limit: 10,
    });
    console.log({ data: data.result.list });

    const Highs = [];
    const Lows = [];

    for (let i = 0; i < data.result.list.length; i++) {
      Highs.push(data.result.list[i][2]);
      Lows.push(data.result.list[i][3]);
    }

    console.log({ Highs });

  }
}
