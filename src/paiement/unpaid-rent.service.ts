import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paiement, PaiementStatut, PaiementType } from './entities/paiement.entity';
import { Location, LocationStatut } from '../location/entities/location.entity';
import { UnpaidRentDto } from './dto/unpaid-rent.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UnpaidRentService {
    private readonly logger = new Logger(UnpaidRentService.name);

    constructor(
        @InjectRepository(Paiement)
        private paiementRepository: Repository<Paiement>,
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
    ) { }

    /**
     * Génère automatiquement les loyers impayés pour tous les locataires
     */
    async generateUnpaidRents(): Promise<void> {
        this.logger.log('Début de la génération des loyers impayés');

        try {
            // Récupérer toutes les locations actives
            const activeLocations = await this.locationRepository.find({
                where: { statut: LocationStatut.ACTIF },
                relations: ['locataire', 'bien', 'agence'],
            });

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            for (const location of activeLocations) {
                await this.checkAndGenerateUnpaidRent(location, currentMonth, currentYear);
            }

            this.logger.log('Génération des loyers impayés terminée avec succès');
        } catch (error) {
            this.logger.error('Erreur lors de la génération des loyers impayés:', error);
            throw error;
        }
    }

    /**
     * Vérifie et génère un loyer impayé pour une location donnée
     */
    private async checkAndGenerateUnpaidRent(
        location: Location,
        currentMonth: number,
        currentYear: number,
    ): Promise<void> {
        try {
            const now = new Date();
            const startDate = new Date(location.date_debut);
            const endDate = location.date_fin ? new Date(location.date_fin) : now;

            // Commencer depuis le mois de début de la location
            let checkDate = new Date(startDate.getFullYear(), startDate.getMonth(), location.jour_paiement);

            // Si la date de début est après le jour de paiement du mois, commencer le mois suivant
            if (startDate.getDate() > location.jour_paiement) {
                checkDate.setMonth(checkDate.getMonth() + 1);
            }

            // Parcourir tous les mois depuis le début jusqu'à maintenant
            while (checkDate <= now && checkDate <= endDate) {
                const month = checkDate.getMonth() + 1;
                const year = checkDate.getFullYear();

                // Calculer la date d'échéance pour ce mois
                const dueDate = new Date(year, month - 1, location.jour_paiement);

                // Si nous sommes après la date d'échéance
                if (now > dueDate) {
                    // Vérifier si le paiement existe déjà pour ce mois
                    const existingPayment = await this.paiementRepository.findOne({
                        where: {
                            location_id: location.id,
                            mois_reference: month,
                            annee_reference: year,
                            type: PaiementType.LOYER,
                        },
                    });

                    // Si aucun paiement n'existe, créer un loyer impayé
                    if (!existingPayment) {
                        await this.createUnpaidRentRecord(location, month, year, dueDate);
                    }
                    // Si le paiement existe mais est marqué comme payé, on ne fait rien
                    // Si le paiement existe et est déjà impayé, on ne fait rien non plus
                }

                // Passer au mois suivant
                checkDate.setMonth(checkDate.getMonth() + 1);
            }
        } catch (error) {
            this.logger.error(`Erreur lors de la vérification/génération pour la location ${location.id}:`, error);
            throw error;
        }
    }

    /**
     * Crée un enregistrement de loyer impayé
     */
    private async createUnpaidRentRecord(
        location: Location,
        month: number,
        year: number,
        dueDate: Date,
    ): Promise<void> {
        try {
            const montantTotal = location.loyer + (location.charges || 0);

            const unpaidRent = this.paiementRepository.create({
                agence_id: location.agence_id,
                property_id: location.bien_id,
                locataire_id: location.locataire_id,
                location_id: location.id,
                numero_recu: `IMPAYE-${uuidv4().slice(0, 8).toUpperCase()}`,
                type: PaiementType.LOYER,
                montant_attendu: montantTotal,
                montant: 0,
                date_paiement: dueDate,
                periode_debut: new Date(year, month - 1, 1),
                periode_fin: new Date(year, month, 0),
                mois_reference: month,
                annee_reference: year,
                statut: PaiementStatut.IMPAYE,
                commentaires: `Loyer impayé généré automatiquement pour ${month}/${year}`,
            });

            await this.paiementRepository.save(unpaidRent);

            this.logger.log(
                `Loyer impayé créé pour le locataire ${location.locataire_id} - Bien ${location.bien_id} - Mois ${month}/${year}`,
            );
        } catch (error) {
            this.logger.error(`Erreur lors de la création du loyer impayé pour la location ${location.id}:`, error);
            throw error;
        }
    }

    /**
     * Récupère la liste des loyers impayés avec toutes les informations
     */
    async getUnpaidRentsList(): Promise<UnpaidRentDto[]> {
        try {
            const results = await this.paiementRepository.find({
                where: {
                    statut: PaiementStatut.IMPAYE,
                    type: PaiementType.LOYER
                },
                relations: ['locataire', 'property', 'property.images', 'location'],
                order: {
                    date_paiement: 'DESC'
                }
            });

            // Grouper les paiements par locataire
            const groupedByLocataire = new Map<number, any>();

            for (const paiement of results) {
                const locataireId = paiement.locataire_id;

                if (!groupedByLocataire.has(locataireId)) {
                    groupedByLocataire.set(locataireId, {
                        locataire_id: paiement.locataire_id,
                        locataire_firstname: paiement.locataire?.firstname || '',
                        locataire_lastname: paiement.locataire?.lastname || '',
                        locataire_email: paiement.locataire?.email || '',
                        locataire_mobile: paiement.locataire?.mobile || '',
                        bien_id: paiement.property_id,
                        bien_title: paiement.property?.title || '',
                        localite: paiement.property?.localite || '',
                        type_maison: paiement.property?.type || '',
                        categorie: paiement.property?.categorie || '',
                        image: paiement.property?.main_image || '',
                        date_entree: paiement.location?.date_debut || null,
                        loyer_mensuel: paiement.location?.loyer || 0,
                        mois_impayes: 0,
                        montant_total_impaye: 0,
                        derniere_date_paiement: null,
                        historique_loyers_impayes: []
                    });
                }

                const locataireData = groupedByLocataire.get(locataireId);

                // Calculer les jours de retard
                const joursRetard = paiement.date_paiement ?
                    Math.floor((new Date().getTime() - new Date(paiement.date_paiement).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                // Ajouter ce paiement à l'historique
                locataireData.historique_loyers_impayes.push({
                    paiement_id: paiement.id,
                    mois: paiement.mois_reference,
                    annee: paiement.annee_reference,
                    periode: `${this.getMonthName(paiement.mois_reference)} ${paiement.annee_reference}`,
                    montant_du: paiement.montant_attendu,
                    date_echeance: paiement.date_paiement,
                    date_creation_impaye: paiement.created_at,
                    jours_retard: joursRetard,
                    statut: paiement.statut,
                    reference_paiement: paiement.reference_transaction || `PAY-${paiement.annee_reference}-${paiement.mois_reference.toString().padStart(2, '0')}-${paiement.id.toString().padStart(3, '0')}`,
                    description: paiement.commentaires || null
                });

                // Mettre à jour les totaux
                locataireData.mois_impayes += 1;
                locataireData.montant_total_impaye += parseFloat(paiement.montant_attendu as unknown as string) || 0;

                // Mettre à jour la dernière date de paiement
                if (!locataireData.derniere_date_paiement ||
                    new Date(paiement.date_paiement) > new Date(locataireData.derniere_date_paiement)) {
                    locataireData.derniere_date_paiement = paiement.date_paiement;
                }
            }

            return Array.from(groupedByLocataire.values());
        } catch (error) {
            this.logger.error('Erreur lors de la récupération de la liste des loyers impayés:', error);
            throw error;
        }
    }

    private getMonthName(month: number): string {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[month - 1] || 'Mois inconnu';
    }

    /**
     * Récupère les périodes impayées pour un locataire
     */
    

    /**
     * Récupère les statistiques des loyers impayés
     */
    async getUnpaidRentStatistics(): Promise<any> {
        try {
            const query = `
              SELECT 
                COUNT(DISTINCT p.locataire_id) as nombre_locataires_impayes,
                COUNT(p.id) as nombre_total_mois_impayes,
                SUM(p.montant_attendu) as montant_total_impaye,
                AVG(p.montant_attendu) as montant_moyen_impaye
              FROM paiements p
              WHERE p.statut = 'impayé' AND p.type = 'loyer'
            `;

            const result = await this.paiementRepository.query(query);
            return result[0];
        } catch (error) {
            this.logger.error('Erreur lors de la récupération des statistiques des loyers impayés:', error);
            throw error;
        }
    }



    async getUnpaidRentsByLocataireId(locataireId: number): Promise<UnpaidRentDto[]> {
        try {
            const results = await this.paiementRepository.find({
                where: {
                    locataire_id: locataireId,
                    statut: PaiementStatut.IMPAYE,
                    type: PaiementType.LOYER
                },
                relations: ['locataire', 'property', 'property.images', 'location'],
                order: {
                    date_paiement: 'DESC'
                }
            });

            // Grouper les paiements par locataire
            const groupedByLocataire = new Map<number, any>();

            for (const paiement of results) {
                const locataireId = paiement.locataire_id;

                if (!groupedByLocataire.has(locataireId)) {
                    groupedByLocataire.set(locataireId, {
                        locataire_id: paiement.locataire_id,
                        locataire_firstname: paiement.locataire?.firstname || '',
                        locataire_lastname: paiement.locataire?.lastname || '',
                        locataire_email: paiement.locataire?.email || '',
                        locataire_mobile: paiement.locataire?.mobile || '',
                        bien_id: paiement.property_id,
                        date_entree: paiement.location?.date_debut || null,
                        loyer_mensuel: paiement.location?.loyer || 0,
                        mois_impayes: 0,
                        montant_total_impaye: 0,
                        derniere_date_paiement: null,
                        bien: paiement.property || '',
                        historique_loyers_impayes: []
                    });
                }

                const locataireData = groupedByLocataire.get(locataireId);

                // Calculer les jours de retard
                const joursRetard = paiement.date_paiement ?
                    Math.floor((new Date().getTime() - new Date(paiement.date_paiement).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                // Ajouter ce paiement à l'historique
                locataireData.historique_loyers_impayes.push({
                    paiement_id: paiement.id,
                    mois: paiement.mois_reference,
                    annee: paiement.annee_reference,
                    periode: `${this.getMonthName(paiement.mois_reference)} ${paiement.annee_reference}`,
                    montant_du: paiement.montant_attendu,
                    date_echeance: paiement.date_paiement,
                    date_creation_impaye: paiement.created_at,
                    jours_retard: joursRetard,
                    statut: paiement.statut,
                    reference_paiement: paiement.reference_transaction || `PAY-${paiement.annee_reference}-${paiement.mois_reference.toString().padStart(2, '0')}-${paiement.id.toString().padStart(3, '0')}`,
                    description: paiement.commentaires || null
                });

                // Mettre à jour les totaux
                locataireData.mois_impayes += 1;
                locataireData.montant_total_impaye += parseFloat(paiement.montant_attendu as unknown as string) || 0;

                // Mettre à jour la dernière date de paiement
                if (!locataireData.derniere_date_paiement ||
                    new Date(paiement.date_paiement) > new Date(locataireData.derniere_date_paiement)) {
                    locataireData.derniere_date_paiement = paiement.date_paiement;
                }
            }

            return Array.from(groupedByLocataire.values());
        } catch (error) {
            this.logger.error(`Erreur lors de la récupération des loyers impayés pour le locataire ${locataireId}:`, error);
            throw error;
        }
    }
}