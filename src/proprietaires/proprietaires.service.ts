import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { Proprietaire } from './entities/proprietaire.entity';

@Injectable()
export class ProprietairesService {
  constructor(
    @InjectRepository(Proprietaire)
    private proprietairesRepository: Repository<Proprietaire>,
  ) {}

  async create(createProprietaireDto: CreateProprietaireDto): Promise<Proprietaire> {
    const proprietaire = this.proprietairesRepository.create(createProprietaireDto);
    return await this.proprietairesRepository.save(proprietaire);
  }

  async findAll(): Promise<Proprietaire[]> {
    return await this.proprietairesRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['agence', 'properties', 'paiements'],
    });
  }

  async findOne(id: number): Promise<Proprietaire> {
    const proprietaire = await this.proprietairesRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['agence', 'properties', 'paiements'],
    });

    if (!proprietaire) {
      throw new NotFoundException(`Proprietaire with ID ${id} not found`);
    }

    return proprietaire;
  }

  async update(id: number, updateProprietaireDto: UpdateProprietaireDto): Promise<Proprietaire> {
    const proprietaire = await this.findOne(id);
    Object.assign(proprietaire, updateProprietaireDto);
    return this.proprietairesRepository.save(proprietaire);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.proprietairesRepository.softDelete(id);
  }
}
