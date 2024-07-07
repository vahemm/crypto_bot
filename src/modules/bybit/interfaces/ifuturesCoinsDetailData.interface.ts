import { LinearInverseInstrumentInfoV5 } from 'bybit-api';

export interface IFuturesCoinsDetailData extends LinearInverseInstrumentInfoV5 {
  lastPrice: string;
  fundingRate: string;
}
