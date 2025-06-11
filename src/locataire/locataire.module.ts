import { Module } from '@nestjs/common';
import { LocataireService } from './locataire.service';
import { LocataireController } from './locataire.controller';

@Module({
  controllers: [LocataireController],
  providers: [LocataireService],
})
export class LocataireModule {}
