import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { BiensService } from './biens.service';
import { CreateBiensDto } from './dto/create-biens.dto';
import { UpdateBiensDto } from './dto/update-biens.dto';
import { Bien } from './entities/bien.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { AgenceService } from '../agence/agence.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserCategorie } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';

@ApiTags('biens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserCategorie.AGENT)
@Controller('biens')
export class BiensController {
  constructor(
    private readonly biensService: BiensService,
    private readonly agenceService: AgenceService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserCategorie.AGENT)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: process.env.NODE_ENV === 'production' 
        ? '/tmp/biens' 
        : join(process.cwd(), 'public', 'uploads', 'biens'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('Fichier reçu par Multer:', file.fieldname, file.originalname);
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          return cb(new Error('Seuls les fichiers image (jpg, jpeg, png, webp) sont autorisés!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 10 // Maximum 10 fichiers
      }
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un nouveau bien' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['proprietaire_id', 'title', 'categorie', 'type', 'address', 'localite', 'loyer'],
      properties: {
        // Champs obligatoires
        proprietaire_id: { type: 'integer', description: 'ID du propriétaire' },
        title: { type: 'string', description: 'Titre du bien' },
        categorie: { type: 'string', enum: ['APPARTEMENT', 'MAISON', 'TERRAIN', 'COMMERCE', 'BUREAU'] },
        type: { type: 'string', enum: ['LOCATION', 'VENTE'] },
        address: { type: 'string', description: 'Adresse du bien' },
        localite: { type: 'string', description: 'Localité' },
        loyer: { type: 'number', description: 'Montant du loyer/prix' },

        // Champs optionnels
        status: { type: 'string', enum: ['DISPONIBLE', 'LOUE', 'VENDU', 'MAINTENANCE'] },
        reference: { type: 'string', description: 'Référence du bien' },
        description: { type: 'string', description: 'Description du bien' },
        superficie: { type: 'number', description: 'Superficie en m²' },
        pieces: { type: 'integer', description: 'Nombre de pièces' },
        bedrooms: { type: 'integer', description: 'Nombre de chambres' },
        bathrooms: { type: 'integer', description: 'Nombre de salles de bain' },
        floor: { type: 'integer', description: 'Étage' },
        garages: { type: 'integer', description: 'Nombre de garages' },
        area: { type: 'string', description: 'Zone/quartier' },
        deposit: { type: 'number', description: 'Caution' },
        charges: { type: 'number', description: 'Charges' },
        agency_fees: { type: 'number', description: 'Frais d\'agence' },
        amenities: { type: 'array', items: { type: 'string' }, description: 'Équipements' },
        other_docs: { type: 'array', items: { type: 'string' }, description: 'Autres documents' },

        // Fichiers
        main_image: {
          type: 'string',
          format: 'binary',
          description: 'Image principale du bien'
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          description: 'Images supplémentaires du bien'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le bien a été créé avec succès',
    type: Bien
  })
  async create(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetCurrentUser() user: CurrentUser
  ): Promise<Bien> {
    try {
      console.log('\n=== DÉBUT CRÉATION BIEN ===');
      console.log('Body reçu:', JSON.stringify(body, null, 2));
      console.log('Fichiers reçus:', files ? files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        path: f.path,
        size: f.size
      })) : 'Aucun fichier');

      // Vérifier l'agence de l'utilisateur
      const agence = await this.agenceService.findByEmail(user.email);
      if (!agence) {
        throw new BadRequestException('Aucune agence trouvée pour cet utilisateur');
      }

      // Conversion et validation des champs numériques
      const converted = {
        ...body,
        proprietaire_id: body.proprietaire_id ? parseInt(body.proprietaire_id) : undefined,
        loyer: body.loyer ? parseFloat(body.loyer) : undefined,
        superficie: body.superficie ? parseFloat(body.superficie) : undefined,
        pieces: body.pieces ? parseInt(body.pieces) : undefined,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
        floor: body.floor ? parseInt(body.floor) : undefined,
        garages: body.garages ? parseInt(body.garages) : undefined,
        deposit: body.deposit ? parseFloat(body.deposit) : undefined,
        charges: body.charges ? parseFloat(body.charges) : undefined,
        agency_fees: body.agency_fees ? parseFloat(body.agency_fees) : undefined,
        amenities: typeof body.amenities === 'string'
          ? JSON.parse(body.amenities)
          : body.amenities,
        other_docs: typeof body.other_docs === 'string'
          ? JSON.parse(body.other_docs)
          : body.other_docs,
      };

      // Traitement des fichiers
      let main_image: string | undefined = undefined;
      let images: string[] = [];

      if (files && files.length > 0) {
        // Séparer les fichiers par type
        const mainImageFile = files.find(f => f.fieldname === 'main_image');
        const galleryFiles = files.filter(f => f.fieldname === 'images');

        // Traiter l'image principale
        if (mainImageFile) {
          console.log('Traitement du fichier principal...');
          const relativePath = mainImageFile.path.replace(process.cwd(), '').replace(/\\/g, '/').replace('/public', '');
          main_image = relativePath;
          console.log('✅ Fichier principal sauvegardé:', main_image);
        }

        // Traiter les images de la galerie
        if (galleryFiles.length > 0) {
          console.log('Traitement des images de la galerie...');
          for (const file of galleryFiles) {
            const relativePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/').replace('/public', '');
            images.push(relativePath);
          }
          console.log('✅ Images de galerie sauvegardées:', images);
        }
      }

      // Construction et validation du DTO
      const dtoData = {
        ...converted,
        main_image,
        images,
      };

      console.log('\n=== DONNÉES POUR LE DTO ===');
      console.log('main_image:', dtoData.main_image);
      console.log('images:', dtoData.images);
      console.log('agence_id:', agence.id);

      const dto = plainToInstance(CreateBiensDto, dtoData);

      const errors = await validate(dto);
      if (errors.length > 0) {
        console.log('Erreurs de validation:', errors);
        const errorMessages = errors.map(e =>
          Object.values(e.constraints || {}).join(', ')
        ).join('; ');

        throw new BadRequestException(`Erreur de validation: ${errorMessages}`);
      }

      // Créer le bien
      console.log('\n=== CRÉATION DU BIEN EN BASE ===');
      const result = await this.biensService.create({ ...dto, agence_id: agence.id });
      console.log('✅ BIEN CRÉÉ AVEC SUCCÈS');
      console.log('ID du bien:', result.id);
      console.log('main_image dans result:', result.main_image);

      return result;

    } catch (error) {
      console.error('\n=== ERREUR CRÉATION BIEN ===');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(`Erreur lors de la création du bien: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les biens' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les biens',
    type: [Bien]
  })
  @Roles(UserCategorie.AGENT)
  async findAll(@GetCurrentUser() user: CurrentUser): Promise<Bien[]> {
    const agence = await this.agenceService.findByEmail(user.email);
    if (!agence) {
      throw new Error('Aucune agence trouvée pour cet utilisateur');
    }
    return this.biensService.findAllByAgence(agence.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un bien par son ID' })
  @ApiParam({ name: 'id', description: 'ID du bien' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le bien a été trouvé',
    type: Bien 
  })
  @ApiResponse({ status: 404, description: 'Bien non trouvé' })
  @Roles(UserCategorie.AGENT)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: CurrentUser
  ): Promise<Bien> {
    const agence = await this.agenceService.findByEmail(user.email);
    if (!agence) {
      throw new Error('Aucune agence trouvée pour cet utilisateur');
    }
    return this.biensService.findOneIfOwnedByAgence(id, agence.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un bien' })
  @ApiParam({ name: 'id', description: 'ID du bien à mettre à jour' })
  @ApiBody({ type: UpdateBiensDto, description: 'Données à mettre à jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le bien a été mis à jour avec succès',
    type: Bien 
  })
  @ApiResponse({ status: 404, description: 'Bien non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @Roles(UserCategorie.AGENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBiensDto: UpdateBiensDto,
    @GetCurrentUser() user: CurrentUser
  ): Promise<Bien> {
    const agence = await this.agenceService.findByEmail(user.email);
    if (!agence) {
      throw new Error('Aucune agence trouvée pour cet utilisateur');
    }
    return this.biensService.updateIfOwnedByAgence(id, updateBiensDto, agence.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un bien' })
  @ApiParam({ name: 'id', description: 'ID du bien à supprimer' })
  @ApiResponse({ status: 200, description: 'Le bien a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé' })
  @Roles(UserCategorie.AGENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: CurrentUser
  ): Promise<void> {
    const agence = await this.agenceService.findByEmail(user.email);
    if (!agence) {
      throw new Error('Aucune agence trouvée pour cet utilisateur');
    }
    return this.biensService.removeIfOwnedByAgence(id, agence.id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.NODE_ENV === 'production' 
        ? '/tmp' 
        : join(process.cwd(), 'public', 'uploads', 'biens'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Uploader une image pour un bien' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image à uploader'
        }
      }
    }
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { filePath: `/uploads/biens/${file.filename}` };
  }
}
