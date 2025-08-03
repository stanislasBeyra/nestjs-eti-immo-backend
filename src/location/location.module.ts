import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Location } from './entities/location.entity';
import { Agence } from '../agence/entities/agence.entity';
import { Bien } from '../biens/entities/bien.entity';
import { Locataire } from '../locataire/entities/locataire.entity';
import { User } from '../users/entities/user.entity';
import { AgenceModule } from '../agence/agence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Location,
      Agence,
      Bien,
      Locataire,
      User
    ]),
    AgenceModule,
    UsersModule
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService]
})
export class LocationModule {}
