# Roadmap - Brunch Bouaké PMS

Ce document décrit les étapes de la refonte architecturale et de la création de la version cible du PMS Brunch Bouaké.

## Phase 1 : Alignement Architectural (En cours)
- Diagnostic de l'existant.
- Mise à jour de `architecture.md`.
- Élaboration de la présente roadmap et du plan d'implémentation technique.

## Phase 2 : Consolidation UI Kit & Design System
- Standardisation des composants réutilisables (Modal, Select, Input, Datagrid/Table).
- Application stricte des CSS Modules.
- Amélioration du look "Premium" (Micro-animations, espacements, icônes allégées).
- Séparation de la logique de requêtage (hooks) et des composants de vue.

## Phase 3 : Modèle de Sécurité et RBAC (Refonte)
- Découplage strict des permissions en lecture (`*.read`) et écriture (`*.write`).
- Mise à jour du script de peuplement (seed) avec de nouveaux rôles (ex. Femme de chambre).
- Invalidation des sessions (Refresh Tokens) pour la sécurité avancée.

## Phase 4 : Refactoring des Vues Métier
- **Dashboard** : Plus de dynamisme, statistiques réelles rapides.
- **Réservations (Tape Chart)** : Bascule vers une vue chronologique fluide (timeline) pour visualiser facilement l'occupation.
- **Fiches Clients** : Layout type CRM avec mise en évidence des KPI et documents.
- **Facturation (Billing)** : Rationalisation de l'UI pour la clôture et la création de folios correctifs.

## Phase 5 : Évolutions Futures (Hors MVP actuel)
- Module **POS (Point of Sale)** pour le bar et le restaurant.
- Système de gestion de **Stock** et restauration.
- Intégration avancée d'un **Channel Manager** pour la synchronisation OTA.
- Module de **Comptabilité** complète et rapports fiscaux.
