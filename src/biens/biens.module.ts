import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiensService } from './biens.service';
import { BiensController } from './biens.controller';
import { Bien } from './entities/biens.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bien])],
  controllers: [BiensController],
  providers: [BiensService],
  exports: [BiensService],
})
export class BiensModule {}
