import { Module } from '@nestjs/common';
import { BiensService } from './biens.service';
import { BiensController } from './biens.controller';

@Module({
  controllers: [BiensController],
  providers: [BiensService],
})
export class BiensModule {}
