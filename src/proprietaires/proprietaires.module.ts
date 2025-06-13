import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProprietairesService } from './proprietaires.service';
import { ProprietairesController } from './proprietaires.controller';
import { Proprietaire } from './entities/proprietaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proprietaire])],
  controllers: [ProprietairesController],
  providers: [ProprietairesService],
  exports: [ProprietairesService],
})
export class ProprietairesModule {}
