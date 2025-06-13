import { PartialType } from '@nestjs/mapped-types';
import { CreateBiensDto } from './create-biens.dto';

export class UpdateBiensDto extends PartialType(CreateBiensDto) {} 