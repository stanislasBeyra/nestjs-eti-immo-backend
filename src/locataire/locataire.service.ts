import { Injectable } from '@nestjs/common';
import { CreateLocataireDto } from './dto/create-locataire.dto';
import { UpdateLocataireDto } from './dto/update-locataire.dto';

@Injectable()
export class LocataireService {
  create(createLocataireDto: CreateLocataireDto) {
    return 'This action adds a new locataire';
  }

  findAll() {
    return `This action returns all locataire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} locataire`;
  }

  update(id: number, updateLocataireDto: UpdateLocataireDto) {
    return `This action updates a #${id} locataire`;
  }

  remove(id: number) {
    return `This action removes a #${id} locataire`;
  }
}
