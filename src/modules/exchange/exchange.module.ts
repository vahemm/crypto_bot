import { Module, forwardRef } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as GateApi from 'gate-api';
import { GateApiTypes } from './types/gateApiTypes';
import { BybitModule } from 'src/modules/bybit/bybit.module';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [ConfigModule, BybitModule, forwardRef(() => TelegramBotModule)],
  providers: [
    ExchangeService,

    {
      provide: 'GateClient',
      useFactory: (configService: ConfigService): GateApiTypes => {
        const api_key = configService.get('gate_api_key');
        const api_secret = configService.get('gate_api_secret');
        const client = new GateApi.ApiClient();
        client.setApiKeySecret(api_key, api_secret);
        const accountApi = new GateApi.AccountApi(client);
        const futuresApi = new GateApi.FuturesApi(client);
        return { accountApi, futuresApi };
      },
      inject: [ConfigService],
    },
  ],
  controllers: [ExchangeController],
  exports: ['GateClient', ExchangeService],
})
export class ExchangeModule {}
