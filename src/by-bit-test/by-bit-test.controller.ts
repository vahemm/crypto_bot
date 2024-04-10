import { Controller, Get, Provider } from '@nestjs/common';
import { ByBitTestService } from './by-bit-test.service';

@Controller('by-bit-test')
export class ByBitTestController {
    constructor(private byBitTestService: ByBitTestService) {}

    @Get()
    async getAllUsers() {
      return await this.byBitTestService.testByBitClient();
    }
}
