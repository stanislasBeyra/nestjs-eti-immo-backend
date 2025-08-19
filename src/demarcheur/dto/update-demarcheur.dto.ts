import { PartialType } from '@nestjs/mapped-types';
import { CreateDemarcheurDto } from './create-demarcheur.dto';

export class UpdateDemarcheurDto extends PartialType(CreateDemarcheurDto) {}
