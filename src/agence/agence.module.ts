import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgenceService } from './agence.service';
import { AgenceController } from './agence.controller';
import { Agence } from './entities/agence.entity';
import { AgencyDocument } from './entities/agency-document.entity';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from '../users/users.module';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agence, AgencyDocument]),
    MulterModule.register({
      dest: process.env.NODE_ENV === 'production' 
        ? '/tmp/agences' 
        : join(process.cwd(), 'uploads', 'agences'),
    }),
    UsersModule,
  ],
  controllers: [AgenceController],
  providers: [AgenceService],
  exports: [AgenceService],
})
export class AgenceModule {}
