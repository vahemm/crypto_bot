import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import {
  APIResponseV3WithTime,
  InstrumentInfoResponseV5,
  RestClientV5,
  WebsocketClient,
} from 'bybit-api';
import { TCoinsWithHighFundingRate } from 'src/shared/types/coinsWithHighFundingRateBybit.type';
import { IFuturesCoinsDetailData } from './interfaces/ifuturesCoinsDetailData.interface';

@Injectable()
export class BybitService {
  constructor(
    @Inject('ByBitClientApi')
    private byBitClientApi: RestClientV5,
    @Inject('ByBitClientWs')
    private byBitClientWs: WebsocketClient,
    private configService: ConfigService,
  ) {
    this.byBitClientWs.on('open', ({ wsKey, event }) => {
      console.log('connection open for websocket with ID: ' + wsKey);
    });

    // this.byBitClientWs.subscribeV5(['kline.30.ETHUSDT'], 'linear');
    // this.byBitClientWs.on('response', (response) => {
    //   console.log('response', response);
    // });
    // this.byBitClientWs.on('update', (data) => {
    //   console.log('update', data);
    // });
  }

  async testBybit() {
    return console.log('testBybit');
  }

  async getUSDTPerpetualAllCoinsBybit() {
    const data = await this.byBitClientApi.getInstrumentsInfo({
      category: 'linear',
    });
    return data.result.list
      .map((item) => item.symbol)
      .filter((item) => item.includes('USDT'));
  }

  async fundingOneBybit(symbolValue = 'MTLUSDT') {
    const data = await this.byBitClientApi.getTickers({
      category: 'linear',
      symbol: symbolValue,
    });

    const { fundingRate, symbol, nextFundingTime, lastPrice } =
      data.result.list[0];

    return {
      fundingRate,
      symbol,
      nextFundingTimeUTC4: new Date(+nextFundingTime),
      nextFundingTime,
      lastPrice,
    };
  }

  async findFundingHighRatesFromBybit() {
    const startTime = Date.now();
    const leftTime = 16 * 60 * 1000;

    const usdtPerpetualAllCoinsBybit =
      await this.getUSDTPerpetualAllCoinsBybit();

    const coinsWithHighFundingRateBybit: TCoinsWithHighFundingRate[] = [];

    await Promise.all(
      usdtPerpetualAllCoinsBybit.map((coin) => this.fundingOneBybit(coin)),
    ).then((data) => {
      data.forEach((item) => {
        if (
          Math.abs(+item.fundingRate) * 100 > 1 &&
          +item.nextFundingTime - startTime < leftTime
        ) {
          coinsWithHighFundingRateBybit.push({
            symbol: item.symbol,
            fundingRate: (+item.fundingRate * 100).toFixed(2),
            nextFundingTime: (
              (+item.nextFundingTime - startTime) /
              1000 /
              60
            ).toFixed(2),
            exchange: 'ByBit',
            lastPrice: item.lastPrice,
          });
        }
      });
    });

    const endTime = Date.now();

    console.log({ duration: endTime - startTime });

    return coinsWithHighFundingRateBybit;
  }

  // async getInstrumentsInfo(coins: TCoinsWithHighFundingRate[]) {
  //   const futuresCoinsDetailData = [];

  // }

  // @Cron('0 32 * * * *')
  async tradeFundingRateStrategy() {
    const setTimeOutTimer = 10 * 1000;
    const jobStart = Date.now();

    console.log('tradeFundingRateStrategy');

    // const futuresCoins = await this.findFundingHighRatesFromBybit();

    const futuresCoins = [
      { symbol: '1000PEPEUSDT', lastPrice: 123, fundingRate: '-1.5' },
      // { symbol: '1000BONKUSDT', lastPrice: 123, fundingRate: '-1.5' },
    ];

    const futuresCoinsDetailData: IFuturesCoinsDetailData[] = [];
    await Promise.all(
      futuresCoins.map((coin) =>
        this.byBitClientApi.getInstrumentsInfo({
          category: 'linear',
          symbol: coin.symbol,
        }),
      ),
    ).then(
      (data: APIResponseV3WithTime<InstrumentInfoResponseV5<'linear'>>[]) => {
        data.forEach((item, index) => {
          futuresCoinsDetailData.push({
            ...item.result.list[0],
            lastPrice: futuresCoins[index].lastPrice,
            fundingRate: futuresCoins[index].fundingRate,
          } as unknown as IFuturesCoinsDetailData);
        });
      },
    );

    console.log(futuresCoinsDetailData);

    const timerAfterFindingCoins = Date.now();

    if (futuresCoinsDetailData.length) {
      for (const coin of futuresCoinsDetailData) {
        console.log({ coin });

        const topic = `tickers.${coin.symbol}`;
        let lastPriceBid = coin.lastPrice;
        const qty = `${
          Math.ceil(6 / +lastPriceBid / +coin.lotSizeFilter.minOrderQty) *
          +coin.lotSizeFilter.minOrderQty
        }`;

        this.byBitClientWs.subscribeV5([topic], 'linear');

        this.byBitClientWs.on('update', (tick) => {
          if (tick.topic === topic) {
            // console.log('update from trade job', tick);
            lastPriceBid = tick.data.bid1Price;
          }
        });

        this.byBitClientApi.setLeverage({
          category: 'linear',
          symbol: coin.symbol,
          buyLeverage: coin.leverageFilter.maxLeverage,
          sellLeverage: coin.leverageFilter.maxLeverage,
        });

        setTimeout(async () => {
          const coefficient = Math.abs(
            +coin.fundingRate + (+coin.fundingRate / 100) * 35,
          );

          const limitBuyPrice = `${
            +lastPriceBid - (+lastPriceBid / 100) * coefficient
          }`;

          console.log({ limitBuyPrice });

          const stopLossMarketSell = `${
            +lastPriceBid + (+lastPriceBid / 100) * 0.3
          }`;

          // console.log({ stopLossMarketSell });

          const stopLossLimitBuy = `${
            +limitBuyPrice - (+limitBuyPrice / 100) * 0.3
          }`;
          console.log({ stopLossLimitBuy });

          const marketOrde = await this.byBitClientApi.submitOrder({
            category: 'linear',
            symbol: coin.symbol,
            side: 'Sell',
            orderType: 'Market',
            qty,
            isLeverage: 0,
            stopLoss: stopLossMarketSell,
          });

          const limitOrder = await this.byBitClientApi.submitOrder({
            category: 'linear',
            symbol: coin.symbol,
            side: 'Buy',
            orderType: 'Limit',
            qty,
            isLeverage: 0,
            price: limitBuyPrice,
            stopLoss: stopLossLimitBuy,
          });

          console.log({ marketOrde, limitOrder });

          this.byBitClientWs.unsubscribeV5([topic], 'linear');
        }, setTimeOutTimer - (timerAfterFindingCoins - jobStart));
      }
    }
  }
}
