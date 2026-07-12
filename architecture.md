# Architecture - Brunch Bouaké PMS

## 1. Objectif du projet
Brunch Bouaké PMS est un système de gestion hôtelière conçu pour administrer les opérations d’hébergement du complexe Brunch Bouaké. Le premier périmètre couvre la réception, les chambres, les réservations, le check-in/check-out, la facturation, les paiements, le housekeeping et le reporting.

## 2. Vision produit
Le produit doit être moderne, rapide, modulaire et évolutif. Le design doit rester professionnel, inspiré des meilleurs PMS du marché, avec une interface claire pour la réception, le gérant et le personnel opérationnel.

## 3. Périmètre MVP
- Tableau de bord.
- Réservations.
- Chambres.
- Fiches clients.
- Check-in et check-out.
- Séjour en cours.
- Folio / facturation.
- Paiements.
- Housekeeping.
- Maintenance.
- Rapports.
- Paramètres de base.

## 4. Hors périmètre pour l'instant
- POS.
- Restauration.
- Livraison.
- CRM avancé.
- Channel manager complet.
- Comptabilité complète.
- Module RH.

## 5. Principes d'architecture
- Séparer clairement la présentation, la logique métier et l’accès aux données.
- Garder les modules indépendants.
- Concevoir une base compatible avec une évolution future vers plusieurs modules.
- Ne pas lier le projet à une seule forme de déploiement.
- Prévoir des écrans simples et rapides pour le front desk.

## 6. Modules fonctionnels
### 6.1 Dashboard
Vue globale des arrivées, départs, chambres disponibles, chambres occupées, housekeeping, maintenance et KPI.

### 6.2 Reservations
Gestion des réservations individuelles et futures réservations source OTA ou walk-in.

### 6.3 Rooms
Gestion des chambres, types, tarifs, statuts, équipements et disponibilité.

### 6.4 Guests
Gestion du fichier client, historique des séjours, pièces d’identité et notes internes.

### 6.5 Check-in / Check-out
Gestion du séjour, attribution de chambre, validation d’identité, ouverture et clôture du séjour.

### 6.6 Folio / Billing
Gestion des charges, taxes, remises, dépôts, paiements, remboursements et solde.

### 6.7 Housekeeping
Gestion des tâches de nettoyage, inspection et changement de statut des chambres.

### 6.8 Maintenance
Gestion des incidents techniques et indisponibilités de chambres.

### 6.9 Reports
Rapports d’occupation, revenus, paiements, chambres et activité quotidienne.

## 7. Structure de données
Les entités principales (alignées avec le schéma Prisma) sont :
- `User`, `Role`, `Permission` (Sécurité & RBAC)
- `Room`, `RoomType`, `RateplanDay` (Inventaire)
- `Guest`, `GuestDocument` (CRM)
- `Reservation`, `ReservationStatusHistory` (Réservations)
- `Folio`, `FolioLine`, `Payment`, `Deposit`, `Invoice` (Facturation)
- `HousekeepingTask`, `MaintenanceIssue` (Opérations)
- `AuditLog`, `DailySnapshot`, `SystemSettings` (Système et logs)

## 8. Conventions
- Chaque module doit avoir ses propres composants, services, routes et modèles.
- Les statuts doivent être centralisés.
- Les noms de fichiers doivent être cohérents et explicites.
- Les règles métier doivent être documentées avant implémentation.

## 9. Évolution future
Après validation du module PMS, le projet pourra accueillir des modules additionnels : POS, restauration, réservation avancée, channel manager, reporting financier et automatisations.

## 10. Rôle des outils
- Antigravity : implémentation et refactorisation.
- Google AI Pro / AI Studio : analyse, architecture, écarts, génération de structure.
- Documentation repo : source de vérité du produit.
