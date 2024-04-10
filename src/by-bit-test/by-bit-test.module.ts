import { Module } from '@nestjs/common';
import { ByBitTestService } from './by-bit-test.service';
import { ByBitTestController } from './by-bit-test.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RestClientV5 } from 'bybit-api';

@Module({
  imports: [ConfigModule],
  providers: [ByBitTestService,
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
    }],
  controllers: [ByBitTestController],
  exports:['ByBitClient']
})
export class ByBitTestModule {}
