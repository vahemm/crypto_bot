import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RestClientV5, WebsocketClient } from 'bybit-api';
import { BybitService } from './bybit.service';
import { BybitController } from './bybit.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'ByBitClientApi',
      useFactory: (configService: ConfigService) => {
        return new RestClientV5({
          key: configService.get('bybit_api_key'),
          secret: configService.get('bybit_api_secret'),
          testnet: false,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'ByBitClientWs',
      useFactory: (configService: ConfigService) => {
        return new WebsocketClient({
          key: configService.get('bybit_api_key'),
          secret: configService.get('bybit_api_secret'),
          market: 'v5',
        });
      },
      inject: [ConfigService],
    },
    BybitService,
  ],
  exports: ['ByBitClientApi', 'ByBitClientWs', BybitService],
  controllers: [BybitController],
})
export class BybitModule {}
