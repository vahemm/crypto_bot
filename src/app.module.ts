import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import AppConfig from './config/app.config';
import { validate } from './config/env.validation';

import { ExchangeModule } from './modules/exchange/exchange.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { BybitModule } from './modules/bybit/bybit.module';
import { MexcModule } from './modules/mexc/mexc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [AppConfig],
      validate,
    }),
    ExchangeModule,
    ScheduleModule.forRoot(),
    TelegramBotModule,
    BybitModule,
    MexcModule,
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     return configService.get<TypeOrmModuleAsyncOptions>('database');
    //   },
    //   inject: [ConfigService],
    // }),
    // UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
