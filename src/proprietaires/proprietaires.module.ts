import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProprietairesService } from './proprietaires.service';
import { ProprietairesController } from './proprietaires.controller';
import { Proprietaire } from './entities/proprietaire.entity';
import { AgenceModule } from '../agence/agence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proprietaire]),
    AgenceModule,
    UsersModule,
  ],
  controllers: [ProprietairesController],
  providers: [ProprietairesService],
  exports: [ProprietairesService],
})
export class ProprietairesModule {}
