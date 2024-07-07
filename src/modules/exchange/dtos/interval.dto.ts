import { KlineIntervalV3 } from 'bybit-api';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

const KlineIntervalV3Arr: KlineIntervalV3[] = [
  '1',
  '3',
  '5',
  '15',
  '30',
  '60',
  '120',
  '240',
  '360',
  '720',
  'D',
  'W',
  'M',
];

export class IntervalDto {
  @IsOptional()
  @IsEnum(KlineIntervalV3Arr)
  public interval: KlineIntervalV3;
}
