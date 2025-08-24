import { ApiProperty } from '@nestjs/swagger';

export class PaidRentHistoryDto {
  @ApiProperty({ description: 'ID du paiement' })
  paiement_id: number;

  @ApiProperty({ description: 'Mois de référence' })
  mois: number;

  @ApiProperty({ description: 'Année de référence' })
  annee: number;

  @ApiProperty({ description: 'Période (ex: Janvier 2024)' })
  periode: string;

  @ApiProperty({ description: 'Montant payé' })
  montant_paye: number;

  @ApiProperty({ description: 'Date de paiement' })
  date_paiement: Date;

  @ApiProperty({ description: 'Référence de transaction' })
  reference_paiement: string;

  @ApiProperty({ description: 'Commentaires' })
  description: string | null;
}

export class PaidRentDto {
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

  @ApiProperty({ description: 'Image principale du bien' })
  image: string;

  @ApiProperty({ description: 'Date d\'entrée du locataire' })
  date_entree: Date;

  @ApiProperty({ description: 'Montant du loyer mensuel' })
  loyer_mensuel: number;

  @ApiProperty({ description: 'Nombre de mois payés' })
  mois_payes: number;

  @ApiProperty({ description: 'Montant total payé' })
  montant_total_paye: number;

  @ApiProperty({ description: 'Dernière date de paiement' })
  derniere_date_paiement: Date;

  @ApiProperty({ description: 'Historique des loyers payés', type: [PaidRentHistoryDto] })
  historique_loyers_payes: PaidRentHistoryDto[];

  @ApiProperty({ description: 'Images du bien', type: [String] })
  bien_images: string[];
}