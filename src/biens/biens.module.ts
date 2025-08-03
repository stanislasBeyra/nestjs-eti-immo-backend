import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiensService } from './biens.service';
import { BiensController } from './biens.controller';
import { Bien } from './entities/bien.entity';
import { BiensImage } from './entities/biens-image.entity';
import { AgenceModule } from '../agence/agence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bien, BiensImage]),
    AgenceModule,
  ],
  controllers: [BiensController],
  providers: [BiensService],
  exports: [BiensService],
})
export class BiensModule {}
