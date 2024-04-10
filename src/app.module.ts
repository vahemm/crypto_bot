import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import AppConfig from './config/app.config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { validate } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { RestClientV5 } from 'bybit-api';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [AppConfig],
      validate,
    }),
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
  providers: [AppService, {
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
  exports: ['ByBitClient']
})
export class AppModule {}
