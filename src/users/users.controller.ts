import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata, BadRequestException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { UserCategorie } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser, CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin/register')
  @ApiOperation({ summary: 'Enregistrer le premier administrateur du système' })
  @ApiResponse({ status: 201, description: 'Administrateur enregistré avec succès' })
  @ApiResponse({ status: 409, description: 'Un administrateur existe déjà' })
  @ApiResponse({ status: 400, description: 'Données saisies invalides. Veuillez vérifier les données saisies' })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    try {
      return await this.usersService.createAdmin({
        ...registerAdminDto,
        categorie: UserCategorie.ADMIN
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          message: 'Données saisies invalides',
          details: error.message,
          validation: error.getResponse()
        });
      }
      throw error;
    }
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserCategorie.ADMIN)
  @ApiOperation({ summary: 'Créer un utilisateur (nécessite une authentification admin)' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('getuserbyid/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserCategorie.ADMIN)
  @ApiOperation({ summary: 'Trouver un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  getUserById(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('updateuserbyid/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserCategorie.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  updateUserById(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('deleteuserbyid/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserCategorie.ADMIN)
  @ApiOperation({ summary: 'Supprimer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  deleteUserById(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('listusers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserCategorie.ADMIN)
  @ApiOperation({ summary: 'Liste tous les administrateurs' })
  @ApiResponse({ status: 200, description: 'Liste des administrateurs' })
  listUsers() {
    return this.usersService.findAllAdmins();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les informations de l\'utilisateur authentifié' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Informations de l\'utilisateur récupérées avec succès'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Utilisateur non authentifié' 
  })
  async getCurrentUser(@GetCurrentUser() currentUser: CurrentUser) {
    return await this.usersService.findOne(currentUser.id);
  }
}
