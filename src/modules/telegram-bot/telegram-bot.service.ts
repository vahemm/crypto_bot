import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import TelegramBot from 'node-telegram-bot-api';
import { ExchangeService } from 'src/modules/exchange/exchange.service';

@Injectable()
export class TelegramBotService {
  constructor(
    @Inject('TelegramBot')
    private telegramBot: TelegramBot,
    private configService: ConfigService,
    @Inject(forwardRef(() => ExchangeService))
    private exchangeService: ExchangeService,
  ) {
    this.telegramBot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const messageText = msg.text;
      console.log({ chatId, messageText });
    });
  }

  async testTelegramService() {
    console.log('testTelegramService');
  }

  async sendFundingMessage(symbol, fundingRate, leftTimeByMinute, exchange) {
    const massage = `name - ${symbol} PERPETUAL
funding rate - ${fundingRate}%
time - ${leftTimeByMinute} minute
exchange - ${exchange}`;

    this.telegramBot.sendMessage(1778864251, massage);
    // this.telegramBot.sendMessage(1413551258, massage);
  }

  // @Cron('0 45 * * * *')
  async notifyingFundingHighRatesFromAllExchanges() {
    const fundingHighRatesCoins =
      await this.exchangeService.findFundingHighRatesFromAllExchanges();
    for (const {
      symbol,
      fundingRate,
      nextFundingTime,
      exchange,
    } of fundingHighRatesCoins) {
      await this.sendFundingMessage(
        symbol,
        fundingRate,
        nextFundingTime,
        exchange,
      );
    }
  }
}
