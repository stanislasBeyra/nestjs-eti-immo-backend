import { Injectable } from '@nestjs/common';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';

@Injectable()
export class ProprietairesService {
  create(createProprietaireDto: CreateProprietaireDto) {
    return 'This action adds a new proprietaire';
  }

  findAll() {
    return `This action returns all proprietaires`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proprietaire`;
  }

  update(id: number, updateProprietaireDto: UpdateProprietaireDto) {
    return `This action updates a #${id} proprietaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} proprietaire`;
  }
}
