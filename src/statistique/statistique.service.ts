import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien, PropertyStatus } from '../biens/entities/bien.entity';
import { Location, LocationStatut } from '../location/entities/location.entity';
import { Locataire } from '../locataire/entities/locataire.entity';
import { Agence, AgenceStatus } from '../agence/entities/agence.entity';

export interface DashboardStats {
  totalBiens: {
    count: number;
    somme: number;
  };
  biensEnLocation: {
    count: number;
    somme: number;
  };
  totalLocataires: number;
  totalAgences: number;
}

@Injectable()
export class StatistiqueService {
  constructor(
    @InjectRepository(Bien)
    private readonly bienRepository: Repository<Bien>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Locataire)
    private readonly locataireRepository: Repository<Locataire>,

    @InjectRepository(Agence)
    private readonly agenceRepository: Repository<Agence>,
  ) {}

  async statsDashboard(): Promise<DashboardStats> {
    // Statistiques des biens totaux
    const totalBiensResult = await this.bienRepository
      .createQueryBuilder('bien')
      .select('COUNT(bien.id)', 'count')
      .addSelect('SUM(bien.loyer)', 'somme')
      .where('bien.deleted_at IS NULL')
      .getRawOne();

    // Statistiques des biens en location (statut OCCUPE)
    const biensEnLocationResult = await this.bienRepository
      .createQueryBuilder('bien')
      .select('COUNT(bien.id)', 'count')
      .addSelect('SUM(bien.loyer)', 'somme')
      .where('bien.status = :status', { status: PropertyStatus.OCCUPE })
      .andWhere('bien.deleted_at IS NULL')
      .getRawOne();

    // Alternative: Compter les biens avec des locations actives
    const biensAvecLocationActiveResult = await this.bienRepository
      .createQueryBuilder('bien')
      .innerJoin('bien.locations', 'location')
      .select('COUNT(DISTINCT bien.id)', 'count')
      .addSelect('SUM(DISTINCT bien.loyer)', 'somme')
      .where('location.statut = :statut', { statut: LocationStatut.ACTIF })
      .andWhere('bien.deleted_at IS NULL')
      .andWhere('location.deleted_at IS NULL')
      .getRawOne();

    // Nombre total de locataires actifs
    const totalLocataires = await this.locataireRepository
      .createQueryBuilder('locataire')
      .where('locataire.statut = :statut', { statut: 1 }) // 1 = actif
      .andWhere('locataire.deleted_at IS NULL')
      .getCount();
    const totalAgences = await this.agenceRepository
      .createQueryBuilder('agence')
      .where('agence.status = :status', { status: AgenceStatus.APPROVED })
      .andWhere('agence.deleted_at IS NULL')
      .getCount();
    return {
      totalBiens: {
        count: parseInt(totalBiensResult?.count || '0'),
        somme: parseFloat(totalBiensResult?.somme || '0')
      },
      biensEnLocation: {
        count: parseInt(biensAvecLocationActiveResult?.count || '0'),
        somme: parseFloat(biensAvecLocationActiveResult?.somme || '0')
      },
      totalLocataires,
      totalAgences
    };
  }

}
