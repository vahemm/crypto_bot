import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RestClientV5 } from 'bybit-api';
import { ATR } from 'technicalindicators';
import { ATRInput } from 'technicalindicators/declarations/directionalmovement/ATR';
import {
  FIND_EXTREMUM_ACTUAL_LEVELS,
  FIND_EXTREMUM_LEVELS_INTERVAL,
  FIND_EXTREMUM_LEVELS_LEVELS_COUNT,
  FIND_EXTREMUM_LEVELS_MID_START,
  FIND_EXTREMUM_LEVELS_PERIOD_BAR_COUNT,
} from './constant';

@Injectable()
export class ByBitService {
  constructor(
    @Inject('ByBitClient')
    private byBitClient: RestClientV5,
    private configService: ConfigService,
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

  async findExtremumLevels(symbol = 'BTCUSDT') {
    const periodBarCount = FIND_EXTREMUM_LEVELS_PERIOD_BAR_COUNT;

    const data = await this.byBitClient.getKline({
      category: 'linear',
      symbol: symbol,
      interval: FIND_EXTREMUM_LEVELS_INTERVAL,
      limit: periodBarCount + 20,
    });

    console.log({ data: data.result.list[0] });

    const currentPrice: number = +data.result.list[0][4];

    const Opens: number[] = [];
    const Highs: number[] = [];
    const Lows: number[] = [];
    const Closes: number[] = [];
    const midStart = FIND_EXTREMUM_LEVELS_MID_START;
    // const midStartBarCount = 2 * midStart + 1;

    for (let i = 0; i < data.result.list.length; i++) {
      Opens.push(+data.result.list[i][1]);
      Highs.push(+data.result.list[i][2]);
      Lows.push(+data.result.list[i][3]);
      Closes.push(+data.result.list[i][4]);
    }

    const arrayATR = ATR.calculate({
      low: Lows,
      high: Highs,
      close: Closes,
      period: 14,
    } as ATRInput);

    const currentATRValue = arrayATR[0];

    const extremumSupportLevels: number[] = [];
    const extremumResistanceLevels: number[] = [];
    let allExtremums: number[] = [];

    for (let i = midStart; i < periodBarCount; i++) {
      const minPrice = Math.min(...Lows.slice(i - midStart, i + midStart));
      const maxPrice = Math.max(...Highs.slice(i - midStart, i + midStart));
      allExtremums = [...extremumSupportLevels, ...extremumResistanceLevels];

      if (Lows[i] == minPrice) {
        const hasCloseMinExtremum = allExtremums.find((item) => {
          return item - 0.25 * currentATRValue < minPrice &&
            minPrice < item + 0.25 * currentATRValue
            ? true
            : false;
        });

        if (!hasCloseMinExtremum) {
          if (minPrice < currentPrice) {
            if (
              extremumSupportLevels.length < FIND_EXTREMUM_LEVELS_LEVELS_COUNT
            ) {
              extremumSupportLevels.push(minPrice);
            }
          } else {
            if (
              extremumResistanceLevels.length <
              FIND_EXTREMUM_LEVELS_LEVELS_COUNT
            ) {
              extremumResistanceLevels.push(minPrice);
            }
          }
        }
      }

      if (Highs[i] == maxPrice) {
        const hasCloseMaxExtremum = allExtremums.find((item) => {
          return item - 0.25 * currentATRValue < maxPrice &&
            maxPrice < item + 0.25 * currentATRValue
            ? true
            : false;
        });

        if (!hasCloseMaxExtremum) {
          if (maxPrice < currentPrice) {
            if (
              extremumSupportLevels.length < FIND_EXTREMUM_LEVELS_LEVELS_COUNT
            ) {
              extremumSupportLevels.push(maxPrice);
            }
          } else {
            if (
              extremumResistanceLevels.length <
              FIND_EXTREMUM_LEVELS_LEVELS_COUNT
            ) {
              extremumResistanceLevels.push(maxPrice);
            }
          }
        }
      }
    }

    return {
      extremumSupportLevels,
      extremumResistanceLevels,
      currentPrice,
      currentATRValue,
      symbol: data.result.symbol,
    };
  }

  async findExtremumActualLevels() {
    const { ATR_COEFFICIENT_ACTUAL_LEVEL } = FIND_EXTREMUM_ACTUAL_LEVELS;
    const startTime = Date.now();

    const usdtPerpetualAllCoins = await this.getUSDTPerpetualAllCoins();
    const testData = await this.findExtremumLevels(usdtPerpetualAllCoins[0]);
    console.log({ usdtPerpetualAllCoins });
    console.log({ testData });

    const allData: any[] = [];

    await Promise.all(
      usdtPerpetualAllCoins.map((coin) => this.findExtremumLevels(coin)),
    )
      .then((data) => {
        data.forEach((item) => {
          const currentPrice = item.currentPrice;
          const currentATRValue = item.currentATRValue;

          const itemAllLevels = [
            ...item.extremumSupportLevels,
            ...item.extremumResistanceLevels,
          ];

          const isLevelActual = itemAllLevels.find((level) => {
            return level - ATR_COEFFICIENT_ACTUAL_LEVEL * currentATRValue <
              currentPrice &&
              currentPrice <
                level + ATR_COEFFICIENT_ACTUAL_LEVEL * currentATRValue
              ? true
              : false;
          });

          if (isLevelActual) {
            allData.push(item);
          }
        });
      })
      .catch((err) => {
        console.log({ err });
      });

    const endTime = Date.now();

    console.log({ duration: endTime - startTime });

    return allData;
  }
}
