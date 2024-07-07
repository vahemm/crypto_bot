import { Module } from '@nestjs/common';
import { TestModuleService } from './test-module.service';
import { TestModuleController } from './test-module.controller';
import { ExchangeModule } from '../exchange/exchange.module';

@Module({
  imports: [ExchangeModule],
  providers: [TestModuleService],
  controllers: [TestModuleController],
})
export class TestModuleModule {}
