import { Controller, Get } from '@nestjs/common';
import { ByBitService } from './by-bit.service';

@Controller('by-bit')
export class ByBitController {
  constructor(private ByBitService: ByBitService) {}

  @Get()
  async getAllUsers() {
    return await this.ByBitService.findTimelyLevels();
  }
}
