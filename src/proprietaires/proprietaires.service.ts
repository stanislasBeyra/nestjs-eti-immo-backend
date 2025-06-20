import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { Proprietaire } from './entities/proprietaire.entity';
import { AgenceService } from '../agence/agence.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProprietairesService {
  private readonly logger = new Logger(ProprietairesService.name);

  constructor(
    @InjectRepository(Proprietaire)
    private proprietairesRepository: Repository<Proprietaire>,
    private agenceService: AgenceService,
    private usersService: UsersService,
  ) {}

  async create(createProprietaireDto: CreateProprietaireDto, userId: number): Promise<Proprietaire> {
    console.log('🚀 ID de l\'utilisateur connecté:', userId);
    this.logger.log(`Création d'un propriétaire par l'utilisateur ID: ${userId}`);
    
    // Récupérer l'utilisateur connecté pour avoir son email
    const currentUser = await this.usersService.findOne(userId);
    console.log('👤 Utilisateur connecté:', currentUser);
    
    // Chercher l'agence par l'email de l'utilisateur
    const userAgency = await this.agenceService.findByEmail(currentUser.email);
    console.log('🏢 Agence trouvée par email:', userAgency);
    
    if (!userAgency) {
      throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
    }

    console.log('🏢 ID de l\'agence de l\'utilisateur:', userAgency.id);
    this.logger.log(`Agence trouvée pour l'utilisateur ${userId}: ${userAgency.id}`);

    // Créer le propriétaire avec l'agences_id automatiquement défini
    const proprietaire = this.proprietairesRepository.create({
      ...createProprietaireDto,
      agences_id: userAgency.id,
    });

    const savedProprietaire = await this.proprietairesRepository.save(proprietaire);
    console.log('✅ Propriétaire créé avec succès, ID:', savedProprietaire.id);
    this.logger.log(`Propriétaire créé avec succès - ID: ${savedProprietaire.id}, Agence: ${userAgency.id}`);

    return savedProprietaire;
  }

  async findAll(userId?: number): Promise<Proprietaire[]> {
    if (userId) {
      console.log('🔍 Recherche des propriétaires pour l\'utilisateur ID:', userId);
      this.logger.log(`Recherche des propriétaires pour l'utilisateur: ${userId}`);
      
      // Récupérer l'utilisateur connecté pour avoir son email
      const currentUser = await this.usersService.findOne(userId);
      console.log('👤 Utilisateur connecté:', currentUser);
      
      // Chercher l'agence par l'email de l'utilisateur
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      console.log('🏢 Agence trouvée par email:', userAgency);
      
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }

      console.log('🏢 Filtrage par agence ID:', userAgency.id);

      // Récupérer les propriétaires de cette agence
      const proprietaires = await this.proprietairesRepository.find({
        where: { 
          agences_id: userAgency.id,
          deleted_at: IsNull() 
        },
        relations: ['agence', 'properties', 'paiements'],
      });

      console.log(`📋 ${proprietaires.length} propriétaires trouvés pour l'agence ${userAgency.id}`);
      return proprietaires;
    }

    // Si pas d'userId, retourner tous les propriétaires (pour les admins)
    console.log('👑 Récupération de tous les propriétaires (mode admin)');
    return await this.proprietairesRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['agence', 'properties', 'paiements'],
    });
  }

  async findOne(id: number, userId?: number): Promise<Proprietaire> {
    console.log('🔍 Recherche du propriétaire ID:', id, 'par l\'utilisateur ID:', userId);
    
    let whereCondition: any = { id, deleted_at: IsNull() };

    if (userId) {
      // Récupérer l'utilisateur connecté pour avoir son email
      const currentUser = await this.usersService.findOne(userId);
      console.log('👤 Utilisateur connecté:', currentUser);
      
      // Chercher l'agence par l'email de l'utilisateur
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      console.log('🏢 Agence trouvée par email:', userAgency);
      
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }

      // Ajouter la condition d'agence
      whereCondition.agences_id = userAgency.id;
      console.log('🏢 Filtrage par agence ID:', userAgency.id);
    }

    const proprietaire = await this.proprietairesRepository.findOne({
      where: whereCondition,
      relations: ['agence', 'properties', 'paiements'],
    });

    if (!proprietaire) {
      throw new NotFoundException(`Proprietaire with ID ${id} not found`);
    }

    console.log('✅ Propriétaire trouvé:', proprietaire.id);
    return proprietaire;
  }

  async update(id: number, updateProprietaireDto: UpdateProprietaireDto, userId?: number): Promise<Proprietaire> {
    console.log('✏️ Mise à jour du propriétaire ID:', id, 'par l\'utilisateur ID:', userId);
    const proprietaire = await this.findOne(id, userId);
    Object.assign(proprietaire, updateProprietaireDto);
    const updatedProprietaire = await this.proprietairesRepository.save(proprietaire);
    console.log('✅ Propriétaire mis à jour avec succès');
    return updatedProprietaire;
  }

  async remove(id: number, userId?: number): Promise<void> {
    console.log('🗑️ Suppression du propriétaire ID:', id, 'par l\'utilisateur ID:', userId);
    await this.findOne(id, userId);
    await this.proprietairesRepository.softDelete(id);
    console.log('✅ Propriétaire supprimé avec succès');
  }
}
