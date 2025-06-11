import { Injectable } from '@nestjs/common';
import { CreateBienDto } from './dto/create-bien.dto';
import { UpdateBienDto } from './dto/update-bien.dto';

@Injectable()
export class BiensService {
  create(createBienDto: CreateBienDto) {
    return 'This action adds a new bien';
  }

  findAll() {
    return `This action returns all biens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bien`;
  }

  update(id: number, updateBienDto: UpdateBienDto) {
    return `This action updates a #${id} bien`;
  }

  remove(id: number) {
    return `This action removes a #${id} bien`;
  }
}
