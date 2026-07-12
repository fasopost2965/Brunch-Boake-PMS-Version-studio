# PMS Brunch Bouaké - Bible d'Architecture & de Design (AGENTS.md)

Ce fichier est la source unique de vérité (**Single Source of Truth**) pour l'agent d'IA Coding d'AI Studio et les développeurs. Toute modification du code, ajout de fonctionnalité ou refactorisation doit s'aligner strictement sur ces directives.

---

## 1. Identité Visuelle & Charte Graphique (UI/UX)

L'application utilise un design **Warm Premium & Elegant**, spécifiquement conçu pour l'univers de la restauration de luxe et de l'hôtellerie à Bouaké. Le thème par défaut est un **thème clair chaleureux et contrasté** (pas de mode sombre par défaut, sauf demande explicite).

### Palette de Couleurs (Variables CSS définies dans `src/index.css`)
*   **Arrière-plan (Background)** : `#fcfaf7` (Crème doux et chaleureux, repose l'œil et apporte un aspect haut de gamme).
*   **Texte Principal (On-Background)** : `#423d38` (Gris charbon très chaud / couleur cacao, évite le noir pur agressif).
*   **Couleur Primaire (Branding)** : `#fe6e00` (Orange vif signature pour l'identité "Brunch Bouaké").
*   **Couleur Primaire Forte** : `#ff6b00` (Pour les états survolés et l'accentuation).
*   **Surfaces & Cartes** : `#ffffff` (Blanc pur pour détacher les cartes de l'arrière-plan crème) avec un arrière-plan secondaire doux en `#f3f4f6` ou `#edebe9`.
*   **Indicateurs d'État** :
    *   Succès : `#00c758` (Vert frais)
    *   Avertissement : `#edb200` (Or / Jaune chaud)
    *   Danger / Alerte : `#fb2c36` (Rouge vif)
    *   Information : `#3080ff` (Bleu clair)

### Typographie & Polices
*   **Titres & En-têtes** : Google Font **Outfit** (ou *Space Grotesk*) pour un aspect moderne, géométrique et premium. `font-sans font-medium tracking-tight text-gray-900`
*   **Corps de texte & UI** : **Inter** (sans-serif) pour une lisibilité maximale dans les tableaux et les formulaires administratifs.
*   **Données, Monnaies (FCFA), et Codes** : **JetBrains Mono** pour un alignement tabulaire parfait des prix et des références.

### Règles d'Espacement & Composants
*   **Coins arrondis** : Utilisation constante des classes de bordures arrondies moyennes à grandes (`rounded-xl` ou `rounded-2xl`) pour un aspect moderne et accueillant.
*   **Ombres (Shadows)** : Ombres très douces et diffuses (`shadow-sm` ou `shadow-md` avec une opacité très légère) pour donner de la profondeur sans alourdir l'interface.
*   **Effets visuels** : Légers effets de flou d'arrière-plan (**Glassmorphism**) sur les fenêtres modales et les en-têtes collés (sticky).
*   **Micro-animations** : Transitions fluides sur les boutons (`transition-all duration-200`) et utilisation de micro-animations (entrées en fondu avec décalage vers le haut via `animate-fade-in`).

---

## 2. Architecture Backend & Persistance de Données

Puisque le système de gestion de propriété (PMS) gère des données critiques (réservations, transactions financières en FCFA, commandes de brunch, état des chambres), la persistance des données doit être robuste.

### Choix de la Stack Backend
Après analyse des besoins et de l'environnement d'AI Studio, l'architecture recommandée est l'**Option A (Firebase / Firestore + Auth)** pour les raisons suivantes :
1.  **Intégration Native** : AI Studio dispose d'outils natifs d'approvisionnement et de gestion de sécurité pour Firebase (`set_up_firebase`, `deploy_firebase`).
2.  **Temps Réel (Real-time)** : Crucial pour synchroniser instantanément l'état des chambres entre la réception, l'équipe de ménage (housekeeping) et la cuisine pour les brunchs.
3.  **Persistance Durable** : Évite toute perte de données suite au nettoyage du cache du navigateur (contrairement au `localStorage`).

#### Option Alternative : Express + PostgreSQL (Cloud SQL)
Si un backend SQL relationnel classique est choisi pour des requêtes financières complexes, nous utiliserons un serveur full-stack **Express + Vite** s'exécutant sur le port unique `3000` (requis par la plateforme) connecté à une base PostgreSQL Cloud SQL, géré via l'ORM Drizzle ou Prisma.

### Directives d'écriture du code Backend & API :
*   **Sécurisation des Clés d'API** : Les clés d'API (Firebase, Passerelles de paiement Orange/MTN Money, etc.) doivent impérativement rester côté serveur ou être injectées de manière sécurisée sans être exposées au client de manière brute.
*   **Pas de faux "Mock" en Production** : Lors de la transition vers le backend, remplacer progressivement les états simulés de `src/data.ts` par des requêtes d'API réelles.

---

## 3. Protocole de Coopération & Gestion de Git / GitHub

Pour assurer un développement fluide à quatre mains (vous en local via GitHub et AI Studio dans son espace d'exécution), nous suivons les règles suivantes :

### Flux de Synchronisation (Sync Workflow)
1.  **Changements locaux (Utilisateur)** : Lorsque vous effectuez des modifications en local, poussez-les sur votre dépôt GitHub.
2.  **Mise à jour dans AI Studio** : Avant de demander à AI Studio de générer du nouveau code, utilisez l'interface d'intégration GitHub d'AI Studio pour effectuer un **Pull/Sync** des derniers commits dans le conteneur d'exécution.
3.  **Génération par l'IA** : AI Studio lira vos fichiers mis à jour avant de coder, garantissant qu'aucune de vos modifications ne soit écrasée.
4.  **Enregistrement des modifications de l'IA** : Une fois que j'ai terminé d'écrire et de tester le code, ces changements sont immédiatement persistés dans l'espace de travail d'AI Studio et prêts à être poussés/exportés vers votre dépôt.

### Résolution et Évitement des Conflits
*   **Workflow Séquentiel** : Pour éviter les conflits de fusion (merge conflicts), évitez de modifier le même fichier au même moment où vous donnez des instructions de codage en direct à AI Studio.
*   **Éditions Chirurgicales** : AI Studio modifiera les fichiers de manière ciblée et modulaire en utilisant des outils d'édition précis (`edit_file` / `multi_edit_file`), évitant de réécrire des fichiers entiers à l'aveugle.
*   **Commit Fréquents** : Effectuez des commits réguliers de votre côté pour garder des incréments de code faciles à fusionner.
