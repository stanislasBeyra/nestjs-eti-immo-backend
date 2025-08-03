import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locataire } from './entities/locataire.entity';
import { LocataireService } from './locataire.service';
import { LocataireController } from './locataire.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AgenceModule } from '../agence/agence.module';
import { UsersModule } from '../users/users.module';
import { BiensModule } from 'src/biens/biens.module';
import { Bien } from '../biens/entities/bien.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Locataire, Bien]),
    forwardRef(() => AuthModule),
    AgenceModule,
    UsersModule,
    BiensModule
  ],
  controllers: [LocataireController],
  providers: [LocataireService],
  exports: [LocataireService],
})
export class LocataireModule {}
