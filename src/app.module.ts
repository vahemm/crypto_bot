import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import AppConfig from './config/app.config';
import { validate } from './config/env.validation';

import { ByBitModule } from './by-bit/by-bit.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [AppConfig],
      validate,
    }),
    ByBitModule,
    ScheduleModule.forRoot(),
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
