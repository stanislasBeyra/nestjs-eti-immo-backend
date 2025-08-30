import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, Between, In } from 'typeorm';
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';
import { Terrain, TerrainStatus, TerrainType } from './entities/terrain.entity';

@Injectable()
export class TerrainService {
  private readonly logger = new Logger(TerrainService.name);

  constructor(
    @InjectRepository(Terrain)
    private terrainRepository: Repository<Terrain>,
  ) {}

  async create(createTerrainDto: CreateTerrainDto, agenceId: number): Promise<Terrain> {
    try {
      this.logger.debug('Création d\'un nouveau terrain', { ...createTerrainDto, agenceId });

      // Calcul automatique du prix au m² si non fourni
      const prixM2 = createTerrainDto.prix_m2 || 
        Math.round(createTerrainDto.prix_vente / createTerrainDto.superficie);

      const terrain = this.terrainRepository.create({
        ...createTerrainDto,
        agence_id: agenceId,
        prix_m2: prixM2,
        date_mise_vente: createTerrainDto.date_mise_vente ? 
          new Date(createTerrainDto.date_mise_vente) : new Date(),
        status: createTerrainDto.status || TerrainStatus.DISPONIBLE,
        constructible: createTerrainDto.constructible ?? true,
        viabilise: createTerrainDto.viabilise ?? false,
        acces_route: createTerrainDto.acces_route ?? true,
        commission_negociable: createTerrainDto.commission_negociable ?? false,
      });

      const savedTerrain = await this.terrainRepository.save(terrain);
      this.logger.log(`Terrain créé avec succès - ID: ${savedTerrain.id}`);
      
      return savedTerrain;
    } catch (error) {
      this.logger.error('Erreur lors de la création du terrain', error);
      throw new BadRequestException('Erreur lors de la création du terrain: ' + error.message);
    }
  }

  async findAll(): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { deleted_at: IsNull() },
        relations: ['agence', 'proprietaire'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des terrains', error);
      throw new BadRequestException('Erreur lors de la récupération des terrains: ' + error.message);
    }
  }

  async findByAgence(agenceId: number): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { 
          agence_id: agenceId, 
          deleted_at: IsNull() 
        },
        relations: ['agence', 'proprietaire'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des terrains de l'agence ${agenceId}`, error);
      throw new BadRequestException('Erreur lors de la récupération des terrains: ' + error.message);
    }
  }

  async findByAgenceWithFilters(
    agenceId: number, 
    options?: {
      status?: TerrainStatus;
      type?: TerrainType;
      constructible?: boolean;
      searchTerm?: string;
      minPrice?: number;
      maxPrice?: number;
      minSuperficie?: number;
      maxSuperficie?: number;
    }
  ): Promise<Terrain[]> {
    try {
      // Construction des conditions WHERE
      const whereConditions: any = {
        agence_id: agenceId,
        deleted_at: IsNull()
      };

      // Filtres de base
      if (options?.status) {
        whereConditions.status = options.status;
      }

      if (options?.type) {
        whereConditions.type = options.type;
      }

      if (options?.constructible !== undefined) {
        whereConditions.constructible = options.constructible;
        if (options.constructible) {
          whereConditions.status = TerrainStatus.DISPONIBLE;
        }
      }

      // Filtres de prix
      if (options?.minPrice !== undefined && options?.maxPrice !== undefined) {
        whereConditions.prix_vente = Between(options.minPrice, options.maxPrice);
      } else if (options?.minPrice !== undefined) {
        whereConditions.prix_vente = Between(options.minPrice, 999999999);
      } else if (options?.maxPrice !== undefined) {
        whereConditions.prix_vente = Between(0, options.maxPrice);
      }

      // Filtres de superficie
      if (options?.minSuperficie !== undefined && options?.maxSuperficie !== undefined) {
        whereConditions.superficie = Between(options.minSuperficie, options.maxSuperficie);
      } else if (options?.minSuperficie !== undefined) {
        whereConditions.superficie = Between(options.minSuperficie, 999999);
      } else if (options?.maxSuperficie !== undefined) {
        whereConditions.superficie = Between(0, options.maxSuperficie);
      }

      // Conditions de recherche textuelle
      let whereOptions: any[] = [];
      
      if (options?.searchTerm) {
        const searchConditions = [
          { ...whereConditions, title: Like(`%${options.searchTerm}%`) },
          { ...whereConditions, localite: Like(`%${options.searchTerm}%`) },
          { ...whereConditions, address: Like(`%${options.searchTerm}%`) },
          { ...whereConditions, reference: Like(`%${options.searchTerm}%`) }
        ];
        whereOptions = searchConditions;
      } else {
        whereOptions = [whereConditions];
      }

      // Déterminer l'ordre de tri
      let orderBy: any = { created_at: 'DESC' };
      if (options?.constructible) {
        orderBy = { prix_m2: 'ASC' };
      } else if (options?.minPrice || options?.maxPrice) {
        orderBy = { prix_vente: 'ASC' };
      } else if (options?.minSuperficie || options?.maxSuperficie) {
        orderBy = { superficie: 'ASC' };
      }

      return await this.terrainRepository.find({
        where: whereOptions,
        relations: ['agence', 'proprietaire'],
        order: orderBy
      });

    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des terrains avec filtres pour l'agence ${agenceId}`, error);
      throw new BadRequestException('Erreur lors de la récupération des terrains: ' + error.message);
    }
  }

  async findByStatus(status: TerrainStatus): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { 
          status,
          deleted_at: IsNull() 
        },
        relations: ['agence', 'proprietaire'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des terrains par statut ${status}`, error);
      throw new BadRequestException('Erreur lors de la récupération des terrains: ' + error.message);
    }
  }

  async findByType(type: TerrainType): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { 
          type,
          deleted_at: IsNull() 
        },
        relations: ['agence', 'proprietaire'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des terrains par type ${type}`, error);
      throw new BadRequestException('Erreur lors de la récupération des terrains: ' + error.message);
    }
  }

  async findConstructibles(): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { 
          constructible: true,
          status: TerrainStatus.DISPONIBLE,
          deleted_at: IsNull() 
        },
        relations: ['agence', 'proprietaire'],
        order: { prix_m2: 'ASC' }
      });
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des terrains constructibles', error);
      throw new BadRequestException('Erreur lors de la récupération des terrains constructibles: ' + error.message);
    }
  }

  async searchTerrains(agenceId: number, searchTerm: string): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: [
          { agence_id: agenceId, title: Like(`%${searchTerm}%`), deleted_at: IsNull() },
          { agence_id: agenceId, localite: Like(`%${searchTerm}%`), deleted_at: IsNull() },
          { agence_id: agenceId, address: Like(`%${searchTerm}%`), deleted_at: IsNull() },
          { agence_id: agenceId, reference: Like(`%${searchTerm}%`), deleted_at: IsNull() },
        ],
        relations: ['agence', 'proprietaire'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de terrains pour l'agence ${agenceId}`, error);
      throw new BadRequestException('Erreur lors de la recherche: ' + error.message);
    }
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { 
          prix_vente: Between(minPrice, maxPrice),
          status: TerrainStatus.DISPONIBLE,
          deleted_at: IsNull() 
        },
        relations: ['agence', 'proprietaire'],
        order: { prix_vente: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche par prix ${minPrice}-${maxPrice}`, error);
      throw new BadRequestException('Erreur lors de la recherche par prix: ' + error.message);
    }
  }

  async findBySuperficieRange(minSuperficie: number, maxSuperficie: number): Promise<Terrain[]> {
    try {
      return await this.terrainRepository.find({
        where: { 
          superficie: Between(minSuperficie, maxSuperficie),
          status: TerrainStatus.DISPONIBLE,
          deleted_at: IsNull() 
        },
        relations: ['agence', 'proprietaire'],
        order: { superficie: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche par superficie ${minSuperficie}-${maxSuperficie}`, error);
      throw new BadRequestException('Erreur lors de la recherche par superficie: ' + error.message);
    }
  }

  async findOne(id: number): Promise<Terrain> {
    try {
      const terrain = await this.terrainRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: ['agence', 'proprietaire']
      });

      if (!terrain) {
        throw new NotFoundException(`Terrain avec l'ID ${id} non trouvé`);
      }

      return terrain;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération du terrain ${id}`, error);
      throw new BadRequestException('Erreur lors de la récupération du terrain: ' + error.message);
    }
  }

  async update(id: number, updateTerrainDto: UpdateTerrainDto): Promise<Terrain> {
    try {
      const terrain = await this.findOne(id);

      // Recalculer le prix au m² si prix ou superficie changent
      let prixM2 = updateTerrainDto.prix_m2;
      if (!prixM2 && (updateTerrainDto.prix_vente || updateTerrainDto.superficie)) {
        const nouveauPrix = updateTerrainDto.prix_vente || terrain.prix_vente;
        const nouvelleSuperficie = updateTerrainDto.superficie || terrain.superficie;
        prixM2 = Math.round(nouveauPrix / nouvelleSuperficie);
      }

      const updatedData = {
        ...updateTerrainDto,
        ...(prixM2 && { prix_m2: prixM2 }),
        ...(updateTerrainDto.date_mise_vente && { 
          date_mise_vente: new Date(updateTerrainDto.date_mise_vente) 
        })
      };

      await this.terrainRepository.update(id, updatedData);
      
      this.logger.log(`Terrain ${id} mis à jour avec succès`);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la mise à jour du terrain ${id}`, error);
      throw new BadRequestException('Erreur lors de la mise à jour du terrain: ' + error.message);
    }
  }

  async updateStatus(id: number, status: TerrainStatus): Promise<Terrain> {
    try {
      const terrain = await this.findOne(id);
      
      await this.terrainRepository.update(id, { status });
      
      this.logger.log(`Statut du terrain ${id} mis à jour: ${status}`);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la mise à jour du statut du terrain ${id}`, error);
      throw new BadRequestException('Erreur lors de la mise à jour du statut: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const terrain = await this.findOne(id);
      
      await this.terrainRepository.softDelete(id);
      
      this.logger.log(`Terrain ${id} supprimé avec succès (soft delete)`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la suppression du terrain ${id}`, error);
      throw new BadRequestException('Erreur lors de la suppression du terrain: ' + error.message);
    }
  }

  async getStatsByAgence(agenceId: number) {
    try {
      const [
        totalTerrains,
        terrainsDisponibles,
        terrainsVendus,
        terrainsReserves,
        valeurTotalStock
      ] = await Promise.all([
        this.terrainRepository.count({
          where: { agence_id: agenceId, deleted_at: IsNull() }
        }),
        this.terrainRepository.count({
          where: { 
            agence_id: agenceId, 
            status: TerrainStatus.DISPONIBLE,
            deleted_at: IsNull() 
          }
        }),
        this.terrainRepository.count({
          where: { 
            agence_id: agenceId, 
            status: TerrainStatus.VENDU,
            deleted_at: IsNull() 
          }
        }),
        this.terrainRepository.count({
          where: { 
            agence_id: agenceId, 
            status: TerrainStatus.RESERVE,
            deleted_at: IsNull() 
          }
        }),
        this.terrainRepository
          .createQueryBuilder('terrain')
          .select('SUM(terrain.prix_vente)', 'total')
          .where('terrain.agence_id = :agenceId', { agenceId })
          .andWhere('terrain.status = :status', { status: TerrainStatus.DISPONIBLE })
          .andWhere('terrain.deleted_at IS NULL')
          .getRawOne()
      ]);

      return {
        total_terrains: totalTerrains,
        terrains_disponibles: terrainsDisponibles,
        terrains_vendus: terrainsVendus,
        terrains_reserves: terrainsReserves,
        valeur_stock_disponible: parseFloat(valeurTotalStock?.total || '0'),
        taux_vente: totalTerrains > 0 ? Math.round((terrainsVendus / totalTerrains) * 100) : 0
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques pour l'agence ${agenceId}`, error);
      throw new BadRequestException('Erreur lors du calcul des statistiques: ' + error.message);
    }
  }
}