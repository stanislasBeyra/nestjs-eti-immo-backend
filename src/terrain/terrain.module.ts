import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerrainService } from './terrain.service';
import { TerrainController } from './terrain.controller';
import { Terrain } from './entities/terrain.entity';
import { AgenceModule } from '../agence/agence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Terrain]),
    AgenceModule
  ],
  controllers: [TerrainController],
  providers: [TerrainService],
  exports: [TerrainService],
})
export class TerrainModule {}