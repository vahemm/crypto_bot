import { Inject, Injectable, Provider } from '@nestjs/common';

@Injectable()
export class ByBitTestService {
  constructor(
    @Inject('ByBitClient')
    private byBitClient: Provider,
  ) {}

  async testByBitClient() {
    console.log({ loger: this.byBitClient });

    return this.byBitClient;
  }
}
