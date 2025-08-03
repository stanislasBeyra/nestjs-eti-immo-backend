import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationStatut } from './entities/location.entity';
import { Agence } from '../agence/entities/agence.entity';
import { Bien } from '../biens/entities/bien.entity';
import { Locataire } from '../locataire/entities/locataire.entity';
import { User } from '../users/entities/user.entity';
import { AgenceService } from '../agence/agence.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Agence)
    private readonly agenceRepository: Repository<Agence>,
    @InjectRepository(Bien)
    private readonly bienRepository: Repository<Bien>,
    @InjectRepository(Locataire)
    private readonly locataireRepository: Repository<Locataire>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly agenceService: AgenceService,
    private readonly usersService: UsersService,
  ) {}

  async create(createLocationDto: CreateLocationDto, userId?: number): Promise<Location> {
    // Récupérer l'utilisateur connecté pour avoir son email
    if (!userId) {
      throw new BadRequestException('ID utilisateur requis');
    }
    
    const currentUser = await this.usersService.findOne(userId);
    
    // Chercher l'agence par l'email de l'utilisateur
    const userAgency = await this.agenceService.findByEmail(currentUser.email);
    if (!userAgency) {
      throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
    }

    // Vérifier que le bien existe
    const bien = await this.bienRepository.findOne({ 
      where: { id: createLocationDto.bien_id } 
    });
    if (!bien) {
      throw new NotFoundException(`Bien avec l'ID ${createLocationDto.bien_id} non trouvé`);
    }

    // Vérifier que le locataire existe
    const locataire = await this.locataireRepository.findOne({ 
      where: { id: createLocationDto.locataire_id } 
    });
    if (!locataire) {
      throw new NotFoundException(`Locataire avec l'ID ${createLocationDto.locataire_id} non trouvé`);
    }

    // Vérifier que le bien n'est pas déjà loué
    const existingLocation = await this.locationRepository.findOne({
      where: {
        bien_id: createLocationDto.bien_id,
        statut: LocationStatut.ACTIF
      }
    });
    if (existingLocation) {
      throw new ConflictException('Ce bien est déjà loué');
    }

    // Vérifier que les dates sont cohérentes
    if (createLocationDto.date_fin && new Date(createLocationDto.date_debut) >= new Date(createLocationDto.date_fin)) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    // Convertir les chaînes en nombres pour les montants
    const locationData = {
      ...createLocationDto,
      loyer: parseFloat(createLocationDto.loyer),
      caution: createLocationDto.caution ? parseFloat(createLocationDto.caution) : undefined,
      charges: createLocationDto.charges ? parseFloat(createLocationDto.charges) : undefined,
    };

    // Créer la location avec l'agence_id automatiquement défini
    const location = this.locationRepository.create({
      ...locationData,
      agence_id: userAgency.id, // Utiliser l'ID de l'agence de l'utilisateur connecté
      created_by: userId,
      statut: createLocationDto.statut || LocationStatut.ACTIF,
      jour_paiement: createLocationDto.jour_paiement || 5,
      duree: createLocationDto.duree || 12,
      frequence_paiement: createLocationDto.frequence_paiement || 'mensuel',
      charges: locationData.charges || 0
    });

    return await this.locationRepository.save(location);
  }

  async findAll(options?: {
    agence_id?: number;
    bien_id?: number;
    locataire_id?: number;
    statut?: LocationStatut;
    page?: number;
    limit?: number;
  }, userId?: number): Promise<{ locations: Location[]; total: number }> {
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.agence', 'agence')
      .leftJoinAndSelect('location.bien', 'bien')
      .leftJoinAndSelect('location.locataire', 'locataire')
      .leftJoinAndSelect('location.created_by_user', 'created_by_user')
      .orderBy('location.created_at', 'DESC');

    // Si un userId est fourni, filtrer par l'agence de l'utilisateur connecté
    if (userId) {
      const currentUser = await this.usersService.findOne(userId);
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }
      queryBuilder.andWhere('location.agence_id = :agence_id', { agence_id: userAgency.id });
    } else {
      // Appliquer les filtres fournis
      if (options?.agence_id) {
        queryBuilder.andWhere('location.agence_id = :agence_id', { agence_id: options.agence_id });
      }
    }

    if (options?.bien_id) {
      queryBuilder.andWhere('location.bien_id = :bien_id', { bien_id: options.bien_id });
    }

    if (options?.locataire_id) {
      queryBuilder.andWhere('location.locataire_id = :locataire_id', { locataire_id: options.locataire_id });
    }

    if (options?.statut) {
      queryBuilder.andWhere('location.statut = :statut', { statut: options.statut });
    }

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    const [locations, total] = await queryBuilder.getManyAndCount();

    return { locations, total };
  }

  async findOne(id: number, userId?: number): Promise<Location> {
    let whereCondition: any = { id };

    // Si un userId est fourni, vérifier que la location appartient à l'agence de l'utilisateur
    if (userId) {
      const currentUser = await this.usersService.findOne(userId);
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }
      whereCondition.agence_id = userAgency.id;
    }

    const location = await this.locationRepository.findOne({
      where: whereCondition,
      relations: [
        'agence',
        'bien',
        'locataire',
        'created_by_user',
        'paiements'
      ]
    });

    if (!location) {
      throw new NotFoundException(`Location avec l'ID ${id} non trouvée`);
    }

    return location;
  }

  async update(id: number, updateLocationDto: UpdateLocationDto, userId?: number): Promise<Location> {
    const location = await this.findOne(id, userId);

    // Vérifier que le bien existe si il est mis à jour
    if (updateLocationDto.bien_id) {
      const bien = await this.bienRepository.findOne({ 
        where: { id: updateLocationDto.bien_id } 
      });
      if (!bien) {
        throw new NotFoundException(`Bien avec l'ID ${updateLocationDto.bien_id} non trouvé`);
      }

      // Vérifier que le bien n'est pas déjà loué par une autre location
      const existingLocation = await this.locationRepository.findOne({
        where: {
          bien_id: updateLocationDto.bien_id,
          statut: LocationStatut.ACTIF,
          id: { $ne: id } as any
        }
      });
      if (existingLocation) {
        throw new ConflictException('Ce bien est déjà loué par une autre location');
      }
    }

    // Vérifier que le locataire existe si il est mis à jour
    if (updateLocationDto.locataire_id) {
      const locataire = await this.locataireRepository.findOne({ 
        where: { id: updateLocationDto.locataire_id } 
      });
      if (!locataire) {
        throw new NotFoundException(`Locataire avec l'ID ${updateLocationDto.locataire_id} non trouvé`);
      }
    }

    // Vérifier que les dates sont cohérentes
    if (updateLocationDto.date_fin && updateLocationDto.date_debut) {
      if (new Date(updateLocationDto.date_debut) >= new Date(updateLocationDto.date_fin)) {
        throw new BadRequestException('La date de fin doit être postérieure à la date de début');
      }
    }

    // Convertir les chaînes en nombres pour les montants
    const updateData = {
      ...updateLocationDto,
      loyer: updateLocationDto.loyer ? parseFloat(updateLocationDto.loyer) : undefined,
      caution: updateLocationDto.caution ? parseFloat(updateLocationDto.caution) : undefined,
      charges: updateLocationDto.charges ? parseFloat(updateLocationDto.charges) : undefined,
    };

    // Mettre à jour la location
    Object.assign(location, updateData);
    return await this.locationRepository.save(location);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const location = await this.findOne(id, userId);

    // Vérifier s'il y a des paiements associés
    const paiementsCount = await this.locationRepository
      .createQueryBuilder('location')
      .leftJoin('location.paiements', 'paiements')
      .where('location.id = :id', { id })
      .getCount();

    if (paiementsCount > 0) {
      throw new BadRequestException('Impossible de supprimer cette location car elle a des paiements associés');
    }

    await this.locationRepository.softDelete(id);
  }

  async findByAgence(agenceId: number, options?: {
    statut?: LocationStatut;
    page?: number;
    limit?: number;
  }): Promise<{ locations: Location[]; total: number }> {
    return this.findAll({
      agence_id: agenceId,
      statut: options?.statut,
      page: options?.page,
      limit: options?.limit
    });
  }

  async findByLocataire(locataireId: number, options?: {
    statut?: LocationStatut;
    page?: number;
    limit?: number;
  }): Promise<{ locations: Location[]; total: number }> {
    return this.findAll({
      locataire_id: locataireId,
      statut: options?.statut,
      page: options?.page,
      limit: options?.limit
    });
  }

  async findByBien(bienId: number): Promise<Location[]> {
    return await this.locationRepository.find({
      where: { bien_id: bienId },
      relations: ['agence', 'locataire', 'paiements'],
      order: { created_at: 'DESC' }
    });
  }

  async getActiveLocations(userId?: number): Promise<Location[]> {
    const { locations } = await this.findAll({ statut: LocationStatut.ACTIF }, userId);
    return locations;
  }

  async getExpiringLocations(days: number = 30, userId?: number): Promise<Location[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);

    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.agence', 'agence')
      .leftJoinAndSelect('location.bien', 'bien')
      .leftJoinAndSelect('location.locataire', 'locataire')
      .where('location.statut = :statut', { statut: LocationStatut.ACTIF })
      .andWhere('location.date_fin <= :dateLimit', { dateLimit })
      .andWhere('location.date_fin IS NOT NULL')
      .orderBy('location.date_fin', 'ASC');

    // Si un userId est fourni, filtrer par l'agence de l'utilisateur connecté
    if (userId) {
      const currentUser = await this.usersService.findOne(userId);
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }
      queryBuilder.andWhere('location.agence_id = :agence_id', { agence_id: userAgency.id });
    }

    return await queryBuilder.getMany();
  }

  async updateStatus(id: number, statut: LocationStatut, userId?: number): Promise<Location> {
    const location = await this.findOne(id, userId);
    location.statut = statut;
    return await this.locationRepository.save(location);
  }

  async getLocationStats(userId?: number): Promise<{
    total: number;
    actives: number;
    terminees: number;
    resiliees: number;
    enAttente: number;
  }> {
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .select('location.statut', 'statut')
      .addSelect('COUNT(*)', 'count')
      .groupBy('location.statut');

    // Si un userId est fourni, filtrer par l'agence de l'utilisateur connecté
    if (userId) {
      const currentUser = await this.usersService.findOne(userId);
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }
      queryBuilder.andWhere('location.agence_id = :agence_id', { agence_id: userAgency.id });
    }

    const stats = await queryBuilder.getRawMany();

    const result = {
      total: 0,
      actives: 0,
      terminees: 0,
      resiliees: 0,
      enAttente: 0
    };

    stats.forEach(stat => {
      result.total += parseInt(stat.count);
      switch (stat.statut) {
        case LocationStatut.ACTIF:
          result.actives = parseInt(stat.count);
          break;
        case LocationStatut.TERMINE:
          result.terminees = parseInt(stat.count);
          break;
        case LocationStatut.RESILIE:
          result.resiliees = parseInt(stat.count);
          break;
        case LocationStatut.EN_ATTENTE:
          result.enAttente = parseInt(stat.count);
          break;
      }
    });

    return result;
  }
}
