import { PartialType } from '@nestjs/mapped-types';
import { CreateLocataireDto } from './create-locataire.dto';

export class UpdateLocataireDto extends PartialType(CreateLocataireDto) {}
