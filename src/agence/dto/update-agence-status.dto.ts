import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgenceStatus } from '../entities/agence.entity';

export class UpdateAgenceStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de l\'agence',
    enum: AgenceStatus,
    example: AgenceStatus.APPROVED
  })
  @IsEnum(AgenceStatus, { message: 'Statut invalide' })
  status: AgenceStatus;
} 