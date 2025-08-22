import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { UnpaidRentService } from '../unpaid-rent.service';

@Injectable()
export class GenerateUnpaidCliCommand {
  constructor(private readonly unpaidRentService: UnpaidRentService) {}

  @Command({
    command: 'generate:unpaid-rents',
    describe: 'Génère automatiquement les loyers impayés pour tous les locataires',
  })
  async generateUnpaidRents() {
    try {
      console.log('🚀 Génération des loyers impayés en cours...');
      await this.unpaidRentService.generateUnpaidRents();
      console.log('✅ Génération des loyers impayés terminée avec succès!');
    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error.message);
      process.exit(1);
    }
  }

  @Command({
    command: 'list:unpaid-rents',
    describe: 'Affiche la liste des loyers impayés',
  })
  async listUnpaidRents() {
    try {
      console.log('📋 Récupération des loyers impayés...');
      const unpaidRents = await this.unpaidRentService.getUnpaidRentsList();
      console.log(`📊 Nombre de loyers impayés: ${unpaidRents.length}`);
      unpaidRents.forEach((rent, index) => {
        console.log(`${index + 1}. ${rent.locataire_firstname} ${rent.locataire_lastname} - ${rent.montant_total_impaye}€ - ${rent.mois_impayes} mois`);
      });
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
  }
}