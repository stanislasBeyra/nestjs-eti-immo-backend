import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatistiqueService } from './statistique.service';
import { StatistiqueController } from './statistique.controller';
import { Bien } from '../biens/entities/bien.entity';
import { Location } from '../location/entities/location.entity';
import { Locataire } from '../locataire/entities/locataire.entity';
import { Agence } from '../agence/entities/agence.entity';
import { Proprietaire } from '../proprietaires/entities/proprietaire.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bien,
      Location,
      Locataire,
      Agence,
      Proprietaire
    ])
  ],
  controllers: [StatistiqueController],
  providers: [StatistiqueService],
})
export class StatistiqueModule {}
