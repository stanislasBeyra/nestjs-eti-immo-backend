import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaiementService } from './paiement.service';
import { PaiementController } from './paiement.controller';
import { Paiement } from './entities/paiement.entity';
import { Location } from '../location/entities/location.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UnpaidRentService } from './unpaid-rent.service';
import { GenerateUnpaidCliCommand } from './commands/generate-unpaid-cli.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paiement, Location]),
    NotificationsModule,
  ],
  controllers: [PaiementController],
  providers: [
    PaiementService,
    UnpaidRentService,
    GenerateUnpaidCliCommand,   // ✅ Nouveau
  ],
  exports: [PaiementService, UnpaidRentService],
})
export class PaiementModule {}
