import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import AppConfig from './config/app.config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { validate } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { RestClientV5 } from 'bybit-api';
import { ByBitTestModule } from './by-bit-test/by-bit-test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [AppConfig],
      validate,
    }),
    ByBitTestModule,
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
