# PMS Brunch Bouaké — Bible d'Architecture & de Design (AGENTS.md)

Ce fichier est la source unique de vérité (**Single Source of Truth**) pour l'agent d'IA Coding d'AI Studio et les développeurs. Toute modification du code, ajout de fonctionnalité ou refactorisation doit s'aligner strictement sur ces directives d'architecture, de design et de gestion de données.

---

## 1. Identité Visuelle & Charte Graphique (UI/UX) : "Evreghen Command Center"

Le PMS utilise le design **"Evreghen Command Center"** : une interface à haute densité d'information, inspirée d'un panneau de contrôle aéronautique ou militaire mais adoucie par des tons chauds, élégants et luxueux. Ce style est conçu pour donner aux gérants de l'établissement à Bouaké une vision d'ensemble immédiate et un contrôle total sur leurs opérations.

### Palette de Couleurs (Warm Premium & High Contrast)
Les variables CSS définies à la racine dans `/frontend/src/index.css` doivent respecter cette charte chromatique pour conserver une identité visuelle homogène :
*   **Arrière-plan principal (Canvas/Background)** : `#fcfaf7` (Crème doux, chaleureux et eye-safe).
*   **Texte principal (On-Background)** : `#423d38` (Brun cacao/charbon très chaud, élégant, évitant le noir pur chirurgical).
*   **Couleur de Marque (Signature Accent)** : `#fe6e00` (Orange signature vif pour l'esprit "Brunch Bouaké").
*   **Couleur de Marque Active (Hover/Focus)** : `#ff6b00` (Orange soutenu pour les états de survol).
*   **Cartes, Panneaux & Surfaces** : `#ffffff` (Blanc pur pour détacher les modules interactifs) avec des fonds secondaires gris chaud neutre (`#edebe9`).
*   **Indicateurs d'État Command Center** :
    *   **Succès / Confirmé / Libre** : `#00c758` (Vert émeraude frais)
    *   **Avertissement / En Attente / Sale** : `#edb200` (Or chaud)
    *   **Danger / Alerte / Maintenance / Occupé** : `#fb2c36` (Rouge écarlate)
    *   **Information / Optionnel** : `#3080ff` (Bleu cobalt)

### Typographie & Polices
*   **Titres & En-têtes (Outfit / Space Grotesk)** : Style géométrique, moderne et premium. Classes recommandées : `font-sans font-medium tracking-tight text-gray-900`.
*   **Corps de texte & Formulaires (Inter)** : Clarté et lisibilité optimales pour l'administration et les fiches de police.
*   **Nombres, Tarifs (FCFA), et Codes (JetBrains Mono)** : Alignement parfait des colonnes financières et des identifiants (ex: `120 000 FCFA`, `RES-001`, `PV-1`).

### Directives d'Espacement & Composants
*   **Coins arrondis (Rounded)** : Utilisation de `rounded-xl` (12px) et `rounded-2xl` (16px) pour adoucir le design technique et lui conférer un aspect accueillant de luxe.
*   **Ombres (Shadows)** : Ombres extrêmement légères, floues et diffuses pour éviter l'effet "blocs lourds".
*   **Micro-animations** : Toute transition d'onglet ou survol de bouton doit être fluide (`transition-all duration-200`) et animée élégamment via des fondus doux (`animate-fade-in` de `motion/react`).

---

## 2. Architecture Multi-Mode & Persistance de Données

Le PMS gère deux bases de stockage distinctes pour répondre aux contraintes d'infrastructure locales et d'hébergement.

### Règle Fondamentale de la Source de Vérité
1.  **MySQL est la seule source de vérité légitime en Production**. Les données de facturation hôtelière et de restauration en FCFA ne doivent tolérer aucune perte.
2.  **`localStorage` est un mécanisme temporaire de secours / cache**. Il sert uniquement de filet de sécurité en cas de panne réseau temporaire ou pour faire fonctionner l'interface en mode démonstration sans serveur. Le système de secours doit se synchroniser à nouveau dès le retour en ligne de l'API.

---

### Distinction des Trois Modes de Fonctionnement

Le système gère dynamiquement trois environnements distincts :

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PMS BRUNCH BOUAKÉ                             │
│                      Sélecteur de Mode API                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Mode Production  │       │ Mode Dével.      │       │ Mode Simulation  │
│  (Hostinger)     │       │    (Local)       │       │   (AI Studio)    │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ • MySQL Physique │       │ • MySQL Local/Dev│       │ • In-Memory Store│
│ • API Express    │       │ • API Express    │       │ • LocalStorage   │
│ • HTTPS Sécurisé │       │ • Logs Détaillés │       │ • Sans Erreur UI │
└──────────────────┘       └──────────────────┘       └────────────────└─┘
```

#### A. Mode Production (Hostinger)
*   **Description** : L'environnement réel hébergé chez Hostinger. Le front-end React interagit en continu avec l'API Express, elle-même connectée à la base de données MySQL `u707543112_bb_db_v1`.
*   **Comportement** : La base de données MySQL gère les clés primaires, les relations de clés étrangères (ex: empêcher la suppression d'une chambre si une réservation y est rattachée), et assure la cohérence des écritures.
*   **Accès** : Configuré via le fichier `.env` de production avec le mot de passe sécurisé `Prodesk@2965`.

#### B. Mode Développement (Local)
*   **Description** : Utilisé par les développeurs en local pour tester les modifications de code.
*   **Comportement** : Se connecte à une instance MySQL locale ou de test. Permet de tracer les requêtes SQL, de voir les logs des appels API en temps réel dans la console, et de debugger l'application à chaud.
*   **Accès** : Configuré via un fichier `.env` de développement pointant vers `localhost` avec les ports par défaut.

#### C. Mode Simulation (AI Studio)
*   **Description** : L'environnement de prévisualisation dans l'iframe d'AI Studio ou en mode démo déconnecté.
*   **Comportement** : Si la base MySQL de production ou locale est injouable ou non configurée, le serveur backend Express bascule silencieusement sur le `inMemoryStore` (voir `/backend/src/db/inMemoryStore.ts`) et le client React utilise ses dépôts `LocalStorageRepo` de secours. 
*   **Résilience** : L'interface utilisateur ne doit **jamais** afficher de page blanche ou de boîte de dialogue d'erreur bloquante si la base SQL est déconnectée. Les données initiales de simulation (seeds) sont chargées pour permettre un test complet et interactif de toutes les fonctionnalités.

---

## 3. Architecture Modulaire & Évolutivité

Le PMS est conçu de manière modulaire pour accueillir de futurs développements sans perturber le cœur du système. Chaque module est indépendant mais interconnecté :

*   **FrontDesk / Réservations** : Gestion des séjours, fiches de police et attribution automatique des chambres.
*   **Housekeeping** : Suivi de l'état des chambres (Libre, Occupé, Sale, Maintenance) par l'équipe de ménage.
*   **Cuisine & Restauration (Brunch)** : Commande et facturation directe des brunchs signatures sur la note de la chambre.
*   **Gestion des Stocks & Inventaire** : Suivi des consommables de l'hôtel (savons, serviettes, café de Man, bières du minibar) avec alertes de seuil de réapprovisionnement.
*   **Rapports & Statistiques Financières** : Analyse des taux d'occupation, des revenus mensuels en FCFA, des canaux d'acquisition (Direct vs OTA comme Booking.com).

### Directives de Codage pour l'Évolutivité
1.  **Typage Strict** : Tout nouveau modèle de données doit être déclaré dans `/frontend/src/types.ts` et répliqué dans le schéma MySQL (`/backend/database.sql`).
2.  **API Client / Serveur Symétrique** : Chaque action sur le frontend doit appeler un endpoint correspondant dans `/backend/src/routes/` et posséder un repli LocalStorage équivalent en cas d'indisponibilité.
3.  **Aucune dépendance circulaire** : Les composants d'affichage doivent être autonomes et recevoir leurs états et handlers via les propriétés de haut niveau ou un hook d'état centralisé.

---

## 4. Protocole de Coopération & Gestion de Git / GitHub

Pour assurer un développement fluide à quatre mains (vous en local via GitHub et AI Studio dans son espace d'exécution), nous suivons les règles suivantes :

### Flux de Synchronisation (Sync Workflow)
1.  **Changements locaux (Utilisateur)** : Lorsque vous effectuez des modifications en local, poussez-les sur votre dépôt GitHub.
2.  **Mise à jour dans AI Studio** : Avant de demander à AI Studio de générer du nouveau code, utilisez l'interface d'intégration GitHub d'AI Studio pour effectuer un **Pull/Sync** des derniers commits dans le conteneur d'exécution.
3.  **Génération par l'IA** : AI Studio lira vos fichiers mis à jour avant de coder, garantissant qu'aucune de vos modifications ne soit écrasée.
4.  **Enregistrement des modifications de l'IA** : Une fois que j'ai terminé d'écrire et de tester le code, ces changements sont immédiatement persistés dans l'espace de travail d'AI Studio et prêts à être poussés/exportés vers votre dépôt.

### Résolution et Évitement des Conflits
*   **Workflow Séquentiel** : Évitez de modifier le même fichier localement au même moment où vous donnez des instructions de codage en direct à AI Studio.
*   **Éditions Chirurgicales** : Les outils d'édition ciblée (`edit_file` / `multi_edit_file`) doivent être préférés à la réécriture complète de fichiers.
