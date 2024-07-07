import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KlineIntervalV3, RestClientV5 } from 'bybit-api';
import { ATR } from 'technicalindicators';
import { ATRInput } from 'technicalindicators/declarations/directionalmovement/ATR';
import {
  FIND_EXTREMUM_ACTUAL_LEVELS,
  FIND_EXTREMUM_ACTUAL_LEVELS_FOR_BREAKOUT,
  FIND_EXTREMUM_LEVELS,
  FIND_EXTREMUM_LEVELS_FOR_BREAKOUT,
} from './constants';
import { IntervalDto } from './dtos/interval.dto';
import TelegramBot from 'node-telegram-bot-api';

import { GateApiTypes } from './types/gateApiTypes';
import { BybitService } from 'src/modules/bybit/bybit.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { TCoinsWithHighFundingRate } from 'src/shared/types/coinsWithHighFundingRateBybit.type';

@Injectable()
export class ExchangeService {
  constructor(
    @Inject('ByBitClientApi')
    private byBitClientApi: RestClientV5,
    @Inject('GateClient')
    private gateClient: GateApiTypes,
    @Inject('TelegramBot')
    private telegramBot: TelegramBot,
    @Inject(forwardRef(() => TelegramBotService))
    private telegramBotService: TelegramBotService,
    private configService: ConfigService,
    private bybitService: BybitService,
  ) {}

  async testByBitClient() {
    return await this.byBitClientApi.getOrderbook({
      category: 'linear',
      symbol: 'BTCUSD',
    });
  }

  async testGateClient(): Promise<any> {
    const startTime = Date.now();
    const leftTime = 860 * 60 * 1000;
    const coinsWithHighFundingRate: any[] = [];

    const gateData = (
      await this.gateClient.futuresApi.listFuturesContracts('usdt')
    ).body;
    for (const item of gateData) {
      if (
        Math.abs(+item.fundingRate) * 100 > 0.5 &&
        item.fundingNextApply - startTime < leftTime
      ) {
        this.telegramBotService.sendFundingMessage(
          item.name,
          (+item.fundingRate * 100).toFixed(2),
          ((item.fundingNextApply * 1000 - startTime) / 1000 / 60).toFixed(2),
          'Gate',
        );

        coinsWithHighFundingRate.push(item);
      }
    }
    return coinsWithHighFundingRate;
  }

  async findExtremumLevelsMiddleware(coin = 'BTCUSDT') {
    let transformedLevels: {
      LEVELS_INTERVAL: any;
      extremumResistanceLevels: number[];
      extremumSupportLevels: number[];
      currentPrice: number;
      currentATRValue: number;
      symbol: string;
      closestLevel: number;
      macroLevels: {
        LEVELS_INTERVAL: any;
        extremumResistanceLevels: number[];
        extremumSupportLevels: number[];
        currentPrice: number;
        currentATRValue: number;
        symbol: string;
        closestLevel: number;
      };
    };

    await Promise.all([
      this.findExtremumLevels(coin),
      this.findExtremumLevels(coin),
    ]).then((data) => {
      transformedLevels = { ...data[0], macroLevels: data[1] };
    });

    return transformedLevels;
  }

  async findExtremumLevelsForBreakout(symbol = 'BTCUSDT', query?: IntervalDto) {
    const { PERIOD_BAR_COUNT, LEVELS_COUNT, LEVELS_INTERVAL, MID_START } =
      FIND_EXTREMUM_LEVELS_FOR_BREAKOUT;

    const interval = query.interval
      ? query.interval
      : (LEVELS_INTERVAL as KlineIntervalV3);

    const data = await this.byBitClientApi.getKline({
      category: 'linear',
      symbol: symbol,
      interval,
      limit: PERIOD_BAR_COUNT + 20,
    });

    const currentPrice: number = +data.result.list[0][4];

    const Opens: number[] = [];
    const Highs: number[] = [];
    const Lows: number[] = [];
    const Closes: number[] = [];

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

    const extremumSupportMaxLevels: number[] = [];
    const extremumSupportMinLevels: number[] = [];
    const extremumResistanceMaxLevels: number[] = [];
    const extremumResistanceMinLevels: number[] = [];

    for (let i = MID_START; i < PERIOD_BAR_COUNT; i++) {
      const minPrice = Math.min(...Lows.slice(i - MID_START, i + MID_START));
      const maxPrice = Math.max(...Highs.slice(i - MID_START, i + MID_START));

      if (Lows[i] == minPrice) {
        if (minPrice < currentPrice) {
          if (
            extremumSupportMinLevels.length < LEVELS_COUNT &&
            !extremumSupportMinLevels.includes(minPrice)
          ) {
            extremumSupportMinLevels.push(minPrice);
          }
        } else {
          if (
            extremumResistanceMinLevels.length < LEVELS_COUNT &&
            !extremumResistanceMinLevels.includes(minPrice)
          ) {
            extremumResistanceMinLevels.push(minPrice);
          }
        }
      }

      if (Highs[i] == maxPrice) {
        if (maxPrice > currentPrice) {
          if (
            extremumResistanceMaxLevels.length < LEVELS_COUNT &&
            !extremumResistanceMaxLevels.includes(maxPrice)
          ) {
            extremumResistanceMaxLevels.push(maxPrice);
          }
        } else {
          if (
            extremumSupportMaxLevels.length < LEVELS_COUNT &&
            !extremumSupportMaxLevels.includes(maxPrice)
          ) {
            extremumSupportMaxLevels.push(maxPrice);
          }
        }
      }
    }

    return {
      interval,
      extremumResistanceMaxLevels,
      extremumResistanceMinLevels,
      extremumSupportMaxLevels,
      extremumSupportMinLevels,
      currentPrice,
      currentATRValue,
      symbol: data.result.symbol,
      closestLevel: 1000000,
    };
  }

  async findExtremumLevels(symbol = 'BTCUSDT') {
    const {
      PERIOD_BAR_COUNT,
      LEVELS_COUNT,
      ATR_COEFFICIENT_CLOSE_LEVEL,
      LEVELS_INTERVAL,
      MID_START,
    } = FIND_EXTREMUM_LEVELS;

    const data = await this.byBitClientApi.getKline({
      category: 'linear',
      symbol: symbol,
      interval: LEVELS_INTERVAL as KlineIntervalV3,
      limit: PERIOD_BAR_COUNT + 20,
    });

    const currentPrice: number = +data.result.list[0][4];

    const Opens: number[] = [];
    const Highs: number[] = [];
    const Lows: number[] = [];
    const Closes: number[] = [];

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

    for (let i = MID_START; i < PERIOD_BAR_COUNT; i++) {
      const minPrice = Math.min(...Lows.slice(i - MID_START, i + MID_START));
      const maxPrice = Math.max(...Highs.slice(i - MID_START, i + MID_START));
      allExtremums = [...extremumSupportLevels, ...extremumResistanceLevels];

      if (Lows[i] == minPrice) {
        const hasCloseMinExtremum = allExtremums.find((level) => {
          const difference = Math.abs(level - minPrice);

          return ATR_COEFFICIENT_CLOSE_LEVEL * currentATRValue > difference
            ? true
            : false;
        });

        if (!hasCloseMinExtremum) {
          if (minPrice < currentPrice) {
            if (extremumSupportLevels.length < LEVELS_COUNT) {
              const higherSuppoerLevels = extremumSupportLevels.filter(
                (level) => {
                  return minPrice > level;
                },
              );

              if (higherSuppoerLevels.length === 0) {
                extremumSupportLevels.push(minPrice);
              }
            }
          } else {
            if (extremumResistanceLevels.length < LEVELS_COUNT) {
              const lowerResistanceLevels = extremumResistanceLevels.filter(
                (level) => {
                  return minPrice < level;
                },
              );
              if (lowerResistanceLevels.length === 0) {
                extremumResistanceLevels.push(minPrice);
              }
            }
          }
        }
      }

      if (Highs[i] == maxPrice) {
        const hasCloseMaxExtremum = allExtremums.find((level) => {
          const difference = Math.abs(level - maxPrice);

          return ATR_COEFFICIENT_CLOSE_LEVEL * currentATRValue > difference
            ? true
            : false;
        });

        if (!hasCloseMaxExtremum) {
          if (maxPrice < currentPrice) {
            if (extremumSupportLevels.length < LEVELS_COUNT) {
              const higherSuppoerLevels = extremumSupportLevels.filter(
                (level) => {
                  return maxPrice > level;
                },
              );

              if (higherSuppoerLevels.length === 0) {
                extremumSupportLevels.push(maxPrice);
              }
            }
          } else {
            if (extremumResistanceLevels.length < LEVELS_COUNT) {
              const lowerResistanceLevels = extremumResistanceLevels.filter(
                (level) => {
                  return maxPrice < level;
                },
              );
              if (lowerResistanceLevels.length === 0) {
                extremumResistanceLevels.push(maxPrice);
              }
            }
          }
        }
      }
    }

    extremumResistanceLevels.reverse();

    return {
      LEVELS_INTERVAL,
      extremumResistanceLevels,
      extremumSupportLevels,
      currentPrice,
      currentATRValue,
      symbol: data.result.symbol,
      closestLevel: 1000000,
    };
  }

  async findExtremumActualLevels() {
    const { ATR_COEFFICIENT_ACTUAL_LEVEL, ATR_COEFFICIENT_ACTUAL_LEVEL_RANGE } =
      FIND_EXTREMUM_ACTUAL_LEVELS;

    const startTime = Date.now();

    const usdtPerpetualAllCoins =
      await this.bybitService.getUSDTPerpetualAllCoinsBybit();

    const allActualLevels: any[] = [];

    await Promise.all(
      usdtPerpetualAllCoins.map((coin) => this.findExtremumLevels(coin)),
    ).then((data) => {
      data.forEach((item) => {
        const currentPrice = item.currentPrice;
        const currentATRValue = item.currentATRValue;

        const itemAllLevels = [
          ...item.extremumSupportLevels,
          ...item.extremumResistanceLevels,
        ];

        let closestLevel = 1000000;
        let closestDifference = 1000000;

        itemAllLevels.forEach((level) => {
          const difference = Math.abs(level - currentPrice);

          if (closestDifference > difference) {
            closestDifference = difference;
            closestLevel = level;
          }
        });

        if (
          ATR_COEFFICIENT_ACTUAL_LEVEL_RANGE * currentATRValue >
            closestDifference &&
          ATR_COEFFICIENT_ACTUAL_LEVEL * currentATRValue < closestDifference
        ) {
          item.closestLevel = closestLevel;
          allActualLevels.push(item);
        }
      });
    });

    const endTime = Date.now();

    console.log({ duration: endTime - startTime });

    return allActualLevels;
  }

  async findExtremumActualLevelsForBreakout(query) {
    const {
      ATR_COEFFICIENT_ACTUAL_LEVEL_RANGE,
      ATR_COEFFICIENT_ACTUAL_LEVEL_DIFFERENCE,
    } = FIND_EXTREMUM_ACTUAL_LEVELS_FOR_BREAKOUT;
    // const { LEVELS_INTERVAL, MID_START } = FIND_EXTREMUM_LEVELS;

    const startTime = Date.now();

    const usdtPerpetualAllCoins =
      await this.bybitService.getUSDTPerpetualAllCoinsBybit();

    const allActualLevels: any[] = [];

    await Promise.all(
      usdtPerpetualAllCoins.map((coin) =>
        this.findExtremumLevelsForBreakout(coin, query),
      ),
    ).then((data) => {
      data.forEach((item) => {
        const currentPrice = item.currentPrice;
        const currentATRValue = item.currentATRValue;

        const extremumSupportMaxLevels = item.extremumSupportMaxLevels;
        const extremumSupportMinLevels = item.extremumSupportMinLevels;
        const extremumResistanceMaxLevels = item.extremumResistanceMaxLevels;
        const extremumResistanceMinLevels = item.extremumResistanceMinLevels;
        const levelsAvailableDifference =
          ATR_COEFFICIENT_ACTUAL_LEVEL_DIFFERENCE * currentATRValue;

        const currentPriceLevelRange =
          ATR_COEFFICIENT_ACTUAL_LEVEL_RANGE * currentATRValue;

        const supportMaxDifference = Math.abs(
          extremumSupportMaxLevels[0] - extremumSupportMaxLevels[1],
        );

        const supportMinDifference = Math.abs(
          extremumSupportMinLevels[0] - extremumSupportMinLevels[1],
        );

        const resistanceMaxDifference = Math.abs(
          extremumResistanceMaxLevels[0] - extremumResistanceMaxLevels[1],
        );

        const resistanceMinDifference = Math.abs(
          extremumResistanceMinLevels[0] - extremumResistanceMinLevels[1],
        );

        const resistanceMaxCurrentPriceRange = Math.abs(
          extremumResistanceMaxLevels[0] - currentPrice,
        );

        const resistanceMinCurrentPriceRange = Math.abs(
          extremumResistanceMinLevels[0] - currentPrice,
        );

        const supportMaxCurrentPriceRange = Math.abs(
          extremumSupportMaxLevels[0] - currentPrice,
        );

        const supportMinCurrentPriceRange = Math.abs(
          extremumSupportMinLevels[0] - currentPrice,
        );

        if (
          supportMaxDifference < levelsAvailableDifference &&
          supportMaxCurrentPriceRange < currentPriceLevelRange
        ) {
          allActualLevels.push(item);
        }

        if (
          supportMinDifference < levelsAvailableDifference &&
          supportMinCurrentPriceRange < currentPriceLevelRange
        ) {
          allActualLevels.push(item);
        }

        if (
          resistanceMaxDifference < levelsAvailableDifference &&
          resistanceMaxCurrentPriceRange < currentPriceLevelRange
        ) {
          allActualLevels.push(item);
        }

        if (
          resistanceMinDifference < levelsAvailableDifference &&
          resistanceMinCurrentPriceRange < currentPriceLevelRange
        ) {
          allActualLevels.push(item);
        }
      });
    });

    const endTime = Date.now();

    console.log({ duration: endTime - startTime });

    return allActualLevels;
  }

  async findFundingHighRatesFromAllExchanges() {
    const coinsWithHighFundingRateFromBybit =
      await this.bybitService.findFundingHighRatesFromBybit();
    const coinsWithHighFundingRateFromGate =
      await this.findFundingHighRatesFromGate();

    return [
      ...coinsWithHighFundingRateFromBybit,
      ...coinsWithHighFundingRateFromGate,
    ];
  }

  async findFundingHighRatesFromGate() {
    const startTime = Date.now();
    const leftTime = 16 * 60 * 1000;

    const coinsWithHighFundingRateGate: TCoinsWithHighFundingRate[] = [];

    const gateData = (
      await this.gateClient.futuresApi.listFuturesContracts('usdt')
    ).body;

    for (const item of gateData) {
      if (
        Math.abs(+item.fundingRate) * 100 > 1 &&
        item.fundingNextApply * 1000 - startTime < leftTime
      ) {
        coinsWithHighFundingRateGate.push({
          symbol: item.name,
          fundingRate: (+item.fundingRate * 100).toFixed(2),
          nextFundingTime: (
            (item.fundingNextApply * 1000 - startTime) /
            1000 /
            60
          ).toFixed(2),
          exchange: 'Gate',
          lastPrice: item.lastPrice,
        });
      }
    }

    const endTime = Date.now();

    console.log({ duration: endTime - startTime });

    return coinsWithHighFundingRateGate;
  }

  async findTrendingCoins() {
    return await this.bybitService.getUSDTPerpetualAllCoinsBybit();
  }
}
