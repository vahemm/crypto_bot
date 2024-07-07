import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MexcService } from './mexc.service';
import { CreateMexcDto } from './dto/create-mexc.dto';
import { UpdateMexcDto } from './dto/update-mexc.dto';

@Controller('mexc')
export class MexcController {
  constructor(private readonly mexcService: MexcService) {}

  @Post()
  create(@Body() createMexcDto: CreateMexcDto) {
    return this.mexcService.create(createMexcDto);
  }

  @Get()
  findAll() {
    return this.mexcService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mexcService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMexcDto: UpdateMexcDto) {
    return this.mexcService.update(+id, updateMexcDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mexcService.remove(+id);
  }
}
