import { TerrainType, ZoneType, TerrainStatus } from '../entities/terrain.entity';

// Interface représentant les données de terrain après nettoyage par l'intercepteur
export interface CleanedTerrainFormData {
  // Champs obligatoires
  title: string;
  address: string;
  localite: string;
  prix_vente: number;
  superficie: number;
  type: TerrainType;

  // Champs optionnels - strings
  description?: string;
  commune?: string;
  titre_foncier?: string;
  reference_cadastrale?: string;
  reference?: string;
  servitudes?: string;
  coordonnees_gps?: string;
  notes_internes?: string;
  date_mise_vente?: string;

  // Champs optionnels - enums
  zone?: ZoneType;
  status?: TerrainStatus;

  // Champs optionnels - numbers
  prix_m2?: number;
  superficie_constructible?: number;
  frais_agence?: number;
  proprietaire_id?: number;
  latitude?: number;
  longitude?: number;

  // Champs optionnels - booleans
  constructible?: boolean;
  viabilise?: boolean;
  acces_route?: boolean;
  commission_negociable?: boolean;

  // Champs optionnels - arrays
  equipements?: string[];
  documents?: string[];
}