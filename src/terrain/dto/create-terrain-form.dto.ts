import { ApiProperty } from '@nestjs/swagger';
import { TerrainType, ZoneType, TerrainStatus } from '../entities/terrain.entity';

export class CreateTerrainFormDto {
  // Champs obligatoires
  @ApiProperty({ 
    description: 'Titre du terrain', 
    example: 'Terrain constructible 500m² - Cocody Riviera',
    type: 'string'
  })
  title: string;

  @ApiProperty({ 
    description: 'Adresse complète du terrain', 
    example: 'Rue des Palmiers, Riviera Golf',
    type: 'string'
  })
  address: string;

  @ApiProperty({ 
    description: 'Localité/Quartier', 
    example: 'Cocody',
    type: 'string'
  })
  localite: string;

  @ApiProperty({ 
    description: 'Prix de vente en FCFA', 
    example: '50000000',
    type: 'string'
  })
  prix_vente: string;

  @ApiProperty({ 
    description: 'Superficie totale en m²', 
    example: '500',
    type: 'string'
  })
  superficie: string;

  @ApiProperty({ 
    description: 'Type de terrain', 
    enum: TerrainType,
    example: 'Constructible'
  })
  type: TerrainType;

  // Champs optionnels - Informations générales
  @ApiProperty({ 
    description: 'Description détaillée du terrain', 
    example: 'Magnifique terrain constructible bien situé',
    required: false,
    type: 'string'
  })
  description?: string;

  @ApiProperty({ 
    description: 'Commune', 
    example: 'Cocody',
    required: false,
    type: 'string'
  })
  commune?: string;

  @ApiProperty({ 
    description: 'Prix au mètre carré en FCFA (calculé auto si absent)', 
    example: '100000',
    required: false,
    type: 'string'
  })
  prix_m2?: string;

  @ApiProperty({ 
    description: 'Superficie constructible en m²', 
    example: '400',
    required: false,
    type: 'string'
  })
  superficie_constructible?: string;

  @ApiProperty({ 
    description: 'Zone d\'occupation', 
    enum: ZoneType,
    example: 'Résidentielle',
    required: false
  })
  zone?: ZoneType;

  @ApiProperty({ 
    description: 'Statut du terrain (défaut: Disponible)', 
    enum: TerrainStatus,
    example: 'Disponible',
    required: false
  })
  status?: TerrainStatus;

  // Champs optionnels - Caractéristiques (booleans en string)
  @ApiProperty({ 
    description: 'Le terrain est-il constructible (défaut: true)', 
    example: 'true',
    enum: ['true', 'false'],
    required: false
  })
  constructible?: string;

  @ApiProperty({ 
    description: 'Le terrain est-il viabilisé - eau, électricité (défaut: false)', 
    example: 'true',
    enum: ['true', 'false'],
    required: false
  })
  viabilise?: string;

  @ApiProperty({ 
    description: 'Accès routier disponible (défaut: true)', 
    example: 'true',
    enum: ['true', 'false'],
    required: false
  })
  acces_route?: string;

  @ApiProperty({ 
    description: 'Commission négociable (défaut: false)', 
    example: 'true',
    enum: ['true', 'false'],
    required: false
  })
  commission_negociable?: string;

  // Champs optionnels - Documents et références
  @ApiProperty({ 
    description: 'Numéro du titre foncier', 
    example: 'TF-COCODY-2024-001234',
    required: false,
    type: 'string'
  })
  titre_foncier?: string;

  @ApiProperty({ 
    description: 'Référence cadastrale', 
    example: 'CAD-COCODY-2024-567',
    required: false,
    type: 'string'
  })
  reference_cadastrale?: string;

  @ApiProperty({ 
    description: 'Référence interne', 
    example: 'TER-COC-001-2024',
    required: false,
    type: 'string'
  })
  reference?: string;

  @ApiProperty({ 
    description: 'Servitudes ou restrictions', 
    example: 'Aucune servitude particulière',
    required: false,
    type: 'string'
  })
  servitudes?: string;

  // Champs optionnels - Localisation
  @ApiProperty({ 
    description: 'Coordonnée GPS - Latitude', 
    example: '5.3599517',
    required: false,
    type: 'string'
  })
  latitude?: string;

  @ApiProperty({ 
    description: 'Coordonnée GPS - Longitude', 
    example: '-3.9734515',
    required: false,
    type: 'string'
  })
  longitude?: string;

  @ApiProperty({ 
    description: 'Lien Google Maps complet', 
    example: 'https://maps.google.com/maps?q=5.3599517,-3.9734515',
    required: false,
    type: 'string'
  })
  coordonnees_gps?: string;

  // Champs optionnels - Commercial
  @ApiProperty({ 
    description: 'Frais d\'agence en FCFA', 
    example: '2500000',
    required: false,
    type: 'string'
  })
  frais_agence?: string;

  @ApiProperty({ 
    description: 'ID du propriétaire', 
    example: '1',
    required: false,
    type: 'string'
  })
  proprietaire_id?: string;

  @ApiProperty({ 
    description: 'Date de mise en vente (ISO string)', 
    example: '2024-08-30T10:00:00Z',
    required: false,
    type: 'string'
  })
  date_mise_vente?: string;

  // Champs optionnels - Tableaux (multiple values avec même nom)
  @ApiProperty({ 
    description: 'Équipements disponibles (multiple)', 
    example: ['Électricité', 'Eau courante', 'Route bitumée'],
    required: false,
    type: 'array',
    items: { type: 'string' }
  })
  equipements?: string[];

  @ApiProperty({ 
    description: 'Documents associés - chemins vers PDFs (multiple)', 
    example: ['/uploads/documents/titre_foncier.pdf', '/uploads/documents/plan_cadastral.pdf'],
    required: false,
    type: 'array',
    items: { type: 'string' }
  })
  documents?: string[];

  // Champs optionnels - Notes
  @ApiProperty({ 
    description: 'Notes internes de l\'agence', 
    example: 'Terrain très demandé dans la zone',
    required: false,
    type: 'string'
  })
  notes_internes?: string;

  // Images
  @ApiProperty({
    description: 'Images du terrain (max 10) - La première devient l\'image principale',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    },
    required: false
  })
  images?: Express.Multer.File[];
}