import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotService } from './telegram-bot.service';
import * as TelegramBot from 'node-telegram-bot-api';
import { ExchangeModule } from 'src/modules/exchange/exchange.module';

@Module({
  imports: [ConfigModule, forwardRef(() => ExchangeModule)],
  providers: [
    {
      provide: 'TelegramBot',
      useFactory: (configService: ConfigService) => {
        return new TelegramBot(configService.get('crypto_trading_tester_bot'), {
          polling: true,
        });
      },
      inject: [ConfigService],
    },
    TelegramBotService,
  ],
  exports: ['TelegramBot', TelegramBotService],
})
export class TelegramBotModule {}
