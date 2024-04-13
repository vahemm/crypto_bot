import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import AppConfig from './config/app.config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { validate } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { RestClientV5 } from 'bybit-api';
import { ByBitModule } from './by-bit/by-bit.module';
import { TestModuleModule } from './test-module/test-module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [AppConfig],
      validate,
    }),
    ByBitModule,
    TestModuleModule,
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
  providers: [AppService, ],
  exports: []
})
export class AppModule {}
