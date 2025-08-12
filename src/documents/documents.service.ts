import { Injectable, BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
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
  ) { }

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

  async findByAgenceId(agence_id: number) {
    return await this.documentsRepository.find({
      where: { agence_id, deleted_at: IsNull() },
      relations: ['agence'],
    });
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return await this.documentsRepository.save(document);
  }

  async ValidatedDocument(id: number, status: number) {
    try {
      // Validation des paramètres
      if (![2, 3].includes(status)) {
        throw new BadRequestException('Le statut doit être 2 (validé) ou 3 (refusé)');
      }

      const document = await this.findOne(id);
      
      if (!document) {
        throw new NotFoundException('Document non trouvé');
      }

      // Vérification du statut actuel
      if (document.status === 2 && status === 2) {
        throw new BadRequestException('Document déjà validé');
      }
      
      if (document.status === 3 && status === 3) {
        throw new BadRequestException('Document déjà refusé');
      }

      // Mise à jour du statut
      document.status = status;
      const updatedDocument = await this.documentsRepository.save(document);
      
      return updatedDocument;
    } catch (error) {
      // Re-lancer l'erreur si c'est déjà une HttpException
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Sinon, créer une BadRequestException
      throw new BadRequestException(`Erreur lors de la validation du document: ${error.message}`);
    }
  }

  async remove(id: number) {
    const document = await this.findOne(id);
    document.deleted_at = new Date();
    return await this.documentsRepository.save(document);
  }
}
