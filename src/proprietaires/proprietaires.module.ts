import { Module } from '@nestjs/common';
import { ProprietairesService } from './proprietaires.service';
import { ProprietairesController } from './proprietaires.controller';

@Module({
  controllers: [ProprietairesController],
  providers: [ProprietairesService],
})
export class ProprietairesModule {}
