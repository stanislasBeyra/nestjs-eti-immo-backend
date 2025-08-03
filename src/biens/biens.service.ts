import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateBiensDto } from './dto/create-biens.dto';
import { UpdateBiensDto } from './dto/update-biens.dto';
import { Bien } from './entities/bien.entity';
import { BiensImage } from './entities/biens-image.entity';

@Injectable()
export class BiensService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Bien)
    private biensRepository: Repository<Bien>,
    @InjectRepository(BiensImage)
    private biensImageRepository: Repository<BiensImage>,
  ) {
    // Détection automatique de l'URL de base
    this.baseUrl = this.getBaseUrl();
  }

  /**
   * Détecte automatiquement l'URL de base selon l'environnement
   */
  private getBaseUrl(): string {
    // Si une URL de base est explicitement définie, l'utiliser
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    }

    // En production (Vercel ou autre)
    if (process.env.VERCEL) {
      return `https://${process.env.VERCEL_URL || 'nestjseti-immo-backend.vercel.app'}`;
    }

    // En production avec une URL personnalisée
    if (process.env.NODE_ENV === 'production') {
      return process.env.PRODUCTION_URL || 'https://votre-domaine.com';
    }

    // En développement local
    return 'http://localhost:1206';
  }

  /**
   * Transforme les chemins d'images en URLs complètes
   */
  private transformImageUrls(bien: Bien): Bien {
    // Transformer l'image principale
    if (bien.main_image && !bien.main_image.startsWith('http')) {
      bien.main_image = `${this.baseUrl}${bien.main_image}`;
    }

    // Transformer les images de la galerie
    if (bien.images && bien.images.length > 0) {
      bien.images = bien.images.map(image => ({
        ...image,
        image_path: image.image_path.startsWith('http') 
          ? image.image_path 
          : `${this.baseUrl}${image.image_path}`
      }));
    }

    return bien;
  }

  async create(createBiensDto: CreateBiensDto & { agence_id?: number }): Promise<Bien> {
    console.log('🔧 Service create - DTO reçu:', createBiensDto);
    console.log('🔧 Service create - Images reçues:', createBiensDto.images);
    
    const { images, agence_id, ...bienData } = createBiensDto;
    const bien = this.biensRepository.create({ ...bienData, agence_id });
    const savedBien = await this.biensRepository.save(bien);
    
    console.log('✅ Bien sauvegardé avec ID:', savedBien.id);

    if (images && images.length > 0) {
      console.log('📸 Sauvegarde des images de galerie:', images.length, 'images');
      const imagesEntities = images.map((imgPath, idx) => {
        console.log(`📸 Image ${idx}:`, imgPath);
        return this.biensImageRepository.create({
          bien_id: savedBien.id,
          image_path: imgPath,
          is_main: false,
          display_order: idx + 1,
        });
      });
      const savedImages = await this.biensImageRepository.save(imagesEntities);
      console.log('✅ Images de galerie sauvegardées:', savedImages.length, 'images');
    } else {
      console.log('⚠️ Aucune image de galerie à sauvegarder');
    }

    // Récupérer le bien avec les relations et transformer les URLs
    const bienWithRelations = await this.findOne(savedBien.id);
    console.log('🔧 Service create - Bien final avec relations:', {
      id: bienWithRelations.id,
      main_image: bienWithRelations.main_image,
      images_count: bienWithRelations.images?.length || 0,
      images: bienWithRelations.images
    });
    
    return this.transformImageUrls(bienWithRelations);
  }

  async findAll(): Promise<Bien[]> {
    const biens = await this.biensRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['agence', 'locations', 'images'],
    });
    
    return biens.map(bien => this.transformImageUrls(bien));
  }

  async findOne(id: number): Promise<Bien> {
    const bien = await this.biensRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['agence', 'locations', 'images'],
    });

    if (!bien) {
      throw new NotFoundException(`Bien with ID ${id} not found`);
    }

    return this.transformImageUrls(bien);
  }
 
  async findOneIfOwnedByAgence(id: number, agence_id: number): Promise<Bien> {
    const bien = await this.biensRepository.findOne({
      where: { id, agence_id, deleted_at: IsNull() },
      relations: ['agence', 'locations', 'images'],
    });
    if (!bien) throw new NotFoundException('Bien non trouvé ou non autorisé');
    return this.transformImageUrls(bien);
  }

  async update(id: number, updateBiensDto: UpdateBiensDto): Promise<Bien> {
    const bien = await this.findOne(id);
    Object.assign(bien, updateBiensDto);
    const updatedBien = await this.biensRepository.save(bien);
    return this.transformImageUrls(updatedBien);
  }

  async updateIfOwnedByAgence(id: number, updateBiensDto: UpdateBiensDto, agence_id: number): Promise<Bien> {
    const bien = await this.findOneIfOwnedByAgence(id, agence_id);
    Object.assign(bien, updateBiensDto);
    const updatedBien = await this.biensRepository.save(bien);
    return this.transformImageUrls(updatedBien);
  }

  async remove(id: number): Promise<void> {
    const bien = await this.findOne(id);
    await this.biensRepository.softDelete(id);
  }

  async removeIfOwnedByAgence(id: number, agence_id: number): Promise<void> {
    const bien = await this.findOneIfOwnedByAgence(id, agence_id);
    await this.biensRepository.softDelete(bien.id);
  }

  async findAllByAgence(agence_id: number): Promise<Bien[]> {
    const biens = await this.biensRepository.find({
      where: { agence_id, deleted_at: IsNull() },
      relations: ['agence', 'locations', 'images'],
    });
    
    return biens.map(bien => this.transformImageUrls(bien));
  }

  async getallbienforlocataire() {
    try {
      const biens = await this.biensRepository.find({
        where: { deleted_at: IsNull() },
        relations: ['agence', 'locations', 'images'],
      });
      return biens.map(bien => this.transformImageUrls(bien));
    } catch (error) {
      throw error;
    }
  }
}
