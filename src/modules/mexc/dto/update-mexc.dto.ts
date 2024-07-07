import { PartialType } from '@nestjs/mapped-types';
import { CreateMexcDto } from './create-mexc.dto';

export class UpdateMexcDto extends PartialType(CreateMexcDto) {}
