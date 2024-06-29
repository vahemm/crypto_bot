import { Module } from '@nestjs/common';
import { ByBitService } from './by-bit.service';
import { ByBitController } from './by-bit.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RestClientV5 } from 'bybit-api';
import * as TelegramBot from 'node-telegram-bot-api';

@Module({
  imports: [ConfigModule],
  providers: [
    ByBitService,
    {
      provide: 'ByBitClient',
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
      provide: 'TelegramBot',
      useFactory: () => {
        return new TelegramBot(
          '7024226048:AAF_DCm8uM6wCvBECupj8kh152XdJ8FvX1A',
          { polling: true },
        );
      },
    },
  ],
  controllers: [ByBitController],
  exports: ['ByBitClient'],
})
export class ByBitModule {}
