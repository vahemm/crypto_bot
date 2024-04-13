import { Module } from '@nestjs/common';
import { ByBitService } from './by-bit.service';
import { ByBitController } from './by-bit.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RestClientV5 } from 'bybit-api';

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
  ],
  controllers: [ByBitController],
  exports: ['ByBitClient'],
})
export class ByBitModule {}
