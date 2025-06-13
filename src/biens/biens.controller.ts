import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { BiensService } from './biens.service';
import { CreateBiensDto } from './dto/create-biens.dto';
import { UpdateBiensDto } from './dto/update-biens.dto';
import { Bien } from './entities/biens.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('biens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('biens')
export class BiensController {
  constructor(private readonly biensService: BiensService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau bien' })
  @ApiBody({ type: CreateBiensDto, description: 'Données du bien à créer' })
  @ApiResponse({ 
    status: 201, 
    description: 'Le bien a été créé avec succès',
    type: Bien 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createBiensDto: CreateBiensDto): Promise<Bien> {
    return this.biensService.create(createBiensDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les biens' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les biens',
    type: [Bien]
  })
  findAll(): Promise<Bien[]> {
    return this.biensService.findAll();
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
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Bien> {
    return this.biensService.findOne(id);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBiensDto: UpdateBiensDto,
  ): Promise<Bien> {
    return this.biensService.update(id, updateBiensDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un bien' })
  @ApiParam({ name: 'id', description: 'ID du bien à supprimer' })
  @ApiResponse({ status: 200, description: 'Le bien a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.biensService.remove(id);
  }
}
