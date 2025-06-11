import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiConsumes, 
  ApiBody,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Uploader un nouveau document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier à uploader (image ou PDF)'
        },
        type: {
          type: 'number',
          enum: [0, 1, 2, 3, 4],
          description: 'Type de document (0=RCCM, 1=DFE, 2=CNi-verso, 3=CNI-recto, 4=OTHER)'
        },
        name: {
          type: 'string',
          description: 'Nom du document'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Document créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return cb(new Error('Only image and PDF files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create({
      ...createDocumentDto,
      file_path: file.path,
      agence_id: req.user.agence_id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les documents' })
  @ApiResponse({ status: 200, description: 'Liste des documents récupérée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un document par ID' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  @ApiResponse({ status: 200, description: 'Document récupéré' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un document' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document mis à jour' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  @ApiResponse({ status: 200, description: 'Document supprimé' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(+id);
  }
}
