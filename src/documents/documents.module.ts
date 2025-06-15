import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AgencyDocument } from './entities/document.entity';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { AgenceModule } from '../agence/agence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgencyDocument]),
    MulterModule.register({
      dest: process.env.NODE_ENV === 'production' 
        ? '/tmp/documents' 
        : join(process.cwd(), 'uploads', 'documents'),
    }),
    AgenceModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
