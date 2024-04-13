import { Module } from '@nestjs/common';
import { TestModuleService } from './test-module.service';
import { TestModuleController } from './test-module.controller';
import { ByBitModule } from '../by-bit/by-bit.module';

@Module({
  imports: [ByBitModule],
  providers: [TestModuleService],
  controllers: [TestModuleController],
})
export class TestModuleModule {}
