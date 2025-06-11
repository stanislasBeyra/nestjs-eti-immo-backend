import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AgencyDocument } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(AgencyDocument)
    private documentsRepository: Repository<AgencyDocument>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto & { file_path: string; agence_id: number }) {
    try {
      const document = this.documentsRepository.create({
        ...createDocumentDto,
        status: 1, // PENDING
      });
      return await this.documentsRepository.save(document);
    } catch (error) {
      throw new BadRequestException('Error creating document: ' + error.message);
    }
  }

  async findAll() {
    return await this.documentsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['agence'],
    });
  }

  async findOne(id: number) {
    const document = await this.documentsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['agence'],
    });
    if (!document) {
      throw new BadRequestException('Document not found');
    }
    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return await this.documentsRepository.save(document);
  }

  async remove(id: number) {
    const document = await this.findOne(id);
    document.deleted_at = new Date();
    return await this.documentsRepository.save(document);
  }
}
