import { Controller, Get } from '@nestjs/common';
import { TestModuleService } from './test-module.service';

@Controller('test-module')
export class TestModuleController {
  constructor(private testModuleService: TestModuleService) {}
  @Get()
  testEndpoint() {
    return this.testModuleService.testMethod();
  }
}
