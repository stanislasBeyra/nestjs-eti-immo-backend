import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserCategorie } from './entities/user.entity';
import { Agence } from '../agence/entities/agence.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Agence)
    private agenceRepository: Repository<Agence>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer le nouvel utilisateur
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      categorie: createUserDto.categorie || UserCategorie.ADMIN
    });

    // Sauvegarder l'utilisateur
    const savedUser = await this.usersRepository.save(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...result } = savedUser;
    return result;
  }

  async createAdmin(createUserDto: CreateUserDto) {
    // // Vérifier si un admin existe déjà
    // const existingAdmin = await this.usersRepository.findOne({
    //   where: { categorie: UserCategorie.ADMIN }
    // });

    // if (existingAdmin) {
    //   throw new ConflictException('Un administrateur existe déjà');
    // }

    // Créer l'admin avec la catégorie ADMIN
    return this.create({
      ...createUserDto,
      categorie: UserCategorie.ADMIN
    });
  }

  async findAll() {
    return await this.usersRepository.find({
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' }
    });
  }

  async findAllAdmins() {
    return await this.usersRepository.find({
      where: { 
        categorie: UserCategorie.ADMIN,
        deleted_at: IsNull() 
      },
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['agences']
    });
  }

  async update(id: number, updateUserDto: Partial<CreateUserDto>) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }
    await this.usersRepository.remove(user);
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async updateLastLogin(id: number) {
    const user = await this.findOne(id);
    user.last_login_at = new Date();
    await this.usersRepository.save(user);
    return user;
  }

  async getAdminAgences(userId: number) {
    return await this.agenceRepository
      .createQueryBuilder('agence')
      .where('agence.admin_id = :userId', { userId })
      .andWhere('agence.deleted_at IS NULL')
      .orderBy('agence.created_at', 'DESC')
      .getMany();
  }
} 
