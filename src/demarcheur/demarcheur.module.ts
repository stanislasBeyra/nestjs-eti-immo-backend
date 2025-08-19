import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemarcheurService } from './demarcheur.service';
import { DemarcheurController } from './demarcheur.controller';
import { Demarcheur } from './entities/demarcheur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Demarcheur])],
  controllers: [DemarcheurController],
  providers: [DemarcheurService],
  exports: [DemarcheurService],
})
export class DemarcheurModule {}
