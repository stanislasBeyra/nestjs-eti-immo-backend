import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProprietairesService } from './proprietaires.service';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { Proprietaire } from './entities/proprietaire.entity';

@ApiTags('proprietaires')
@Controller('proprietaires')
export class ProprietairesController {
  constructor(private readonly proprietairesService: ProprietairesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau propriétaire' })
  @ApiBody({ type: CreateProprietaireDto, description: 'Données du propriétaire à créer' })
  @ApiResponse({ 
    status: 201, 
    description: 'Le propriétaire a été créé avec succès',
    type: Proprietaire 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createProprietaireDto: CreateProprietaireDto): Promise<Proprietaire> {
    return this.proprietairesService.create(createProprietaireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les propriétaires' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les propriétaires',
    type: [Proprietaire]
  })
  findAll(): Promise<Proprietaire[]> {
    return this.proprietairesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un propriétaire par son ID' })
  @ApiParam({ name: 'id', description: 'ID du propriétaire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le propriétaire a été trouvé',
    type: Proprietaire 
  })
  @ApiResponse({ status: 404, description: 'Propriétaire non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Proprietaire> {
    return this.proprietairesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un propriétaire' })
  @ApiParam({ name: 'id', description: 'ID du propriétaire à mettre à jour' })
  @ApiBody({ type: UpdateProprietaireDto, description: 'Données à mettre à jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le propriétaire a été mis à jour avec succès',
    type: Proprietaire 
  })
  @ApiResponse({ status: 404, description: 'Propriétaire non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProprietaireDto: UpdateProprietaireDto,
  ): Promise<Proprietaire> {
    return this.proprietairesService.update(id, updateProprietaireDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un propriétaire' })
  @ApiParam({ name: 'id', description: 'ID du propriétaire à supprimer' })
  @ApiResponse({ status: 200, description: 'Le propriétaire a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Propriétaire non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.proprietairesService.remove(id);
  }
}
