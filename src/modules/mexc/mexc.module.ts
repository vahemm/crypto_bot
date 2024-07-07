import { Module } from '@nestjs/common';
import { MexcService } from './mexc.service';
import { MexcController } from './mexc.controller';

@Module({
  controllers: [MexcController],
  providers: [MexcService],
})
export class MexcModule {}
