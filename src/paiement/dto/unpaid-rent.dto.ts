import { ApiProperty } from '@nestjs/swagger';

export class UnpaidRentDto {
  @ApiProperty({ description: 'ID du locataire' })
  locataire_id: number;

  @ApiProperty({ description: 'Prénom du locataire' })
  locataire_firstname: string;

  @ApiProperty({ description: 'Nom du locataire' })
  locataire_lastname: string;

  @ApiProperty({ description: 'Email du locataire' })
  locataire_email: string;

  @ApiProperty({ description: 'Téléphone du locataire' })
  locataire_mobile: string;

  @ApiProperty({ description: 'ID du bien' })
  bien_id: number;

  @ApiProperty({ description: 'Titre du bien' })
  bien_title: string;

  @ApiProperty({ description: 'Localité du bien' })
  localite: string;

  @ApiProperty({ description: 'Type de maison' })
  type_maison: string;

  @ApiProperty({ description: 'Catégorie du bien' })
  categorie: string;

  @ApiProperty({ description: 'Date d\'entrée du locataire' })
  date_entree: Date;

  @ApiProperty({ description: 'Montant du loyer mensuel' })
  loyer_mensuel: number;

  @ApiProperty({ description: 'Nombre de mois impayés' })
  mois_impayes: number;

  @ApiProperty({ description: 'Montant total impayé' })
  montant_total_impaye: number;

  @ApiProperty({ description: 'Dernière date de paiement' })
  derniere_date_paiement: Date;

  @ApiProperty({ description: 'Mois et années impayés', type: [String] })
  periodes_impayees: string[];
}