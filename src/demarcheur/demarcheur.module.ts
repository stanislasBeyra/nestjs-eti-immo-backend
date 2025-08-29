import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemarcheurService } from './demarcheur.service';
import { DemarcheurController } from './demarcheur.controller';
import { Demarcheur } from './entities/demarcheur.entity';
import { AgenceModule } from '../agence/agence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Demarcheur]),
    AgenceModule
  ],
  controllers: [DemarcheurController],
  providers: [DemarcheurService],
  exports: [DemarcheurService],
})
export class DemarcheurModule {}
