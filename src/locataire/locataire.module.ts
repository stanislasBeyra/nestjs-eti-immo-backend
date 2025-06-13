import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locataire } from './entities/locataire.entity';
import { LocataireService } from './locataire.service';
import { LocataireController } from './locataire.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Locataire]),
    forwardRef(() => AuthModule),
  ],
  controllers: [LocataireController],
  providers: [LocataireService],
  exports: [LocataireService],
})
export class LocataireModule {}
