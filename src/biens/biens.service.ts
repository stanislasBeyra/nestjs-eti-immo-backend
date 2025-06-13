import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateBiensDto } from './dto/create-biens.dto';
import { UpdateBiensDto } from './dto/update-biens.dto';
import { Bien } from './entities/biens.entity';

@Injectable()
export class BiensService {
  constructor(
    @InjectRepository(Bien)
    private biensRepository: Repository<Bien>,
  ) {}

  async create(createBiensDto: CreateBiensDto): Promise<Bien> {
    const bien = this.biensRepository.create(createBiensDto);
    return await this.biensRepository.save(bien);
  }

  async findAll(): Promise<Bien[]> {
    return await this.biensRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['agence', 'locations'],
    });
  }

  async findOne(id: number): Promise<Bien> {
    const bien = await this.biensRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['agence', 'locations'],
    });

    if (!bien) {
      throw new NotFoundException(`Bien with ID ${id} not found`);
    }

    return bien;
  }

  async update(id: number, updateBiensDto: UpdateBiensDto): Promise<Bien> {
    const bien = await this.findOne(id);
    Object.assign(bien, updateBiensDto);
    return await this.biensRepository.save(bien);
  }

  async remove(id: number): Promise<void> {
    const bien = await this.findOne(id);
    await this.biensRepository.softDelete(id);
  }
}
