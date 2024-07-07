import { Injectable } from '@nestjs/common';
import { CreateMexcDto } from './dto/create-mexc.dto';
import { UpdateMexcDto } from './dto/update-mexc.dto';

@Injectable()
export class MexcService {
  create(createMexcDto: CreateMexcDto) {
    return 'This action adds a new mexc';
  }

  findAll() {
    return `This action returns all mexc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mexc`;
  }

  update(id: number, updateMexcDto: UpdateMexcDto) {
    return `This action updates a #${id} mexc`;
  }

  remove(id: number) {
    return `This action removes a #${id} mexc`;
  }
}
