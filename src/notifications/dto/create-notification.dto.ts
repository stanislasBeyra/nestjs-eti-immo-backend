import { IsString, IsNumber, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Type de notification', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Titre de la notification' })
  @IsString()
  titre: string;

  @ApiProperty({ description: 'Contenu de la notification' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'ID du locataire destinataire', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  locataire_id?: number;

  @ApiProperty({ description: 'ID de l\'agence émettrice', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  agence_id?: number;

  @ApiProperty({ description: 'ID de l\'administrateur émetteur', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  admin_id?: number;

  @ApiProperty({ description: 'ID du paiement associé', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  paiement_id?: number;

  @ApiProperty({ description: 'ID du bien immobilier concerné', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  property_id?: number;

  @ApiProperty({ description: 'ID de l\'utilisateur qui crée la notification', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  created_by_user_id?: number;
}
