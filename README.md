# PMS Brunch Bouaké — Guide Technique & Architecture Multi-Mode

Bienvenue dans le dépôt du **PMS Brunch Bouaké**, un système moderne de gestion hôtelière et de restauration premium. Ce projet est conçu selon les principes esthétiques et techniques du **"Evreghen Command Center"** : une interface de contrôle haute fidélité, modulaire, fluide et robuste, spécialement adaptée aux réalités opérationnelles de Bouaké.

---

## 1. Comment basculer entre les modes de stockage (MySQL vs localStorage) sans casser l'interface utilisateur

Le PMS de l'hôtel-restaurant gère des données opérationnelles critiques (réservations, chambres, fiches de police, facturations, brunchs, inventaire). L'application prend en charge deux types de stockage grâce à une couche d'abstraction API intelligente située dans `/frontend/src/api/index.ts` :

1.  **MySQL (Production / Source de Vérité)** : Enregistre l'ensemble des données de manière persistante, transactionnelle et multi-utilisateurs.
2.  **`localStorage` (Simulation / Secours)** : Utilisé comme cache local temporaire ou mode démo autonome (sans serveur).

### Mécanisme de Résilience Transparente

L'interface utilisateur n'interagit jamais directement avec la base de données ou le `localStorage`. Elle appelle les services définis dans `/frontend/src/api/index.ts`. 

Chaque endpoint de l'API cliente est structuré de la manière suivante pour garantir qu'**aucun dysfonctionnement réseau ou de configuration de serveur ne casse l'affichage** :

```typescript
// Exemple de flux transparent pour les Chambres
rooms: {
  getAll: async (): Promise<Room[]> => {
    logApiCall('GET', '/api/rooms (fetch)');
    try {
      // 1. Essai de récupération en direct via l'API Express connectée à MySQL
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Échec HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      // 2. Repli fluide et silencieux sur le LocalStorage de secours si MySQL/Express est hors-ligne
      console.warn('[API CLIENT] Connexion impossible au Backend MySQL. Repli sur LocalStorage pour les chambres:', err);
      return delay(roomsRepo.get());
    }
  }
}
```

### Directives pour forcer un mode de stockage

*   **Activer le mode MySQL de Production / Développement** :
    *   Créez un fichier `.env` à la racine de votre projet (copié depuis `.env.example`).
    *   Renseignez les variables de connexion de votre hébergement MySQL (par exemple, vos identifiants Hostinger `sqlxxx.hostinger.com`).
    *   Démarrez l'application avec `npm run dev`. Le serveur Express détectera les variables d'environnement, établira la connexion avec MySQL et acheminera les requêtes vers la base de données.
*   **Forcer le mode Simulation / LocalStorage (Secours)** :
    *   Si le fichier `.env` n'existe pas, ou si `MYSQL_HOST` est vide, ou encore si le serveur SQL est injoignable, le backend bascule automatiquement en mode **Simulation**.
    *   Si le serveur Express lui-même n'est pas lancé (front-end autonome en intégration locale), le client React intercepte l'erreur d'appel réseau (`fetch` échoué) et bascule instantanément sur les dépôts locaux `LocalStorageRepo`.

---

## 2. Structure du Backend Express & Connexion MySQL

Le backend Express réside principalement dans le dossier `/backend` et le point d'entrée principal `/server.ts` à la racine. Il s'appuie sur les variables d'environnement définies dans `.env.example` pour se connecter à la base MySQL ou basculer sur un magasin de secours en mémoire.

### Structure de fichiers recommandée et implémentée

```
.
├── .env                    # Fichier de secrets (non suivi sous Git)
├── .env.example            # Modèle de configuration des variables d'environnement
├── server.ts               # Point d'entrée unique de l'application (Express + Middleware Vite)
├── backend/
│   ├── database.sql        # Script SQL de création de tables et de données de base
│   └── src/
│       ├── db/
│       │   ├── connection.ts    # Pool de connexion MySQL (lazy-loaded avec gestion d'erreur)
│       │   └── inMemoryStore.ts # Magasin de secours en mémoire (fallback SQL)
│       └── routes/
│           ├── rooms.ts         # Endpoints de l'API pour les chambres (GET, POST, PUT, DELETE)
│           └── reservations.ts  # Endpoints de l'API pour les réservations (GET, POST, PUT, DELETE)
└── frontend/
    ├── index.html          # Point d'entrée HTML de l'application cliente
    ├── vite.config.ts      # Configuration Vite du compilateur React
    └── src/
        ├── App.tsx         # Composant principal gérant les fenêtres de contrôle hôtelier
        ├── types.ts        # Interfaces partagées de typage strict TypeScript
        ├── data.ts         # Données d'état hôtelier par défaut
        └── api/
            └── index.ts    # Client API gérant les requêtes serveur et le repli sur LocalStorage
```

### Configuration des variables d'environnement (.env)

```env
# CONFIGURATION DE LA BASE DE DONNÉES MYSQL (HOSTINGER / LOCAL)
MYSQL_HOST=sqlxxx.hostinger.com
MYSQL_USER=u707543112_bb_user
MYSQL_PASSWORD=votre_mot_de_passe
MYSQL_DATABASE=u707543112_bb_db_v1
MYSQL_PORT=3306

# CONFIGURATION DU SERVEUR BACKEND
PORT=3000
NODE_ENV=development
```

---

## 3. Scripts d'Exécution & Commandes Utiles

Les scripts à la racine de l'application permettent de gérer les phases de développement, de construction et de démarrage :

*   **Mode Développement (`npm run dev`)** :
    Lance le serveur de développement via `tsx server.ts`. Express s'exécute sur le port `3000`, connecte la base MySQL si configurée, et injecte dynamiquement le serveur de développement de Vite pour servir le frontend à la même adresse.
*   **Mode Production - Compilation (`npm run build`)** :
    1. Compile et distribue les assets statiques optimisés du frontend React dans `frontend/dist/`.
    2. Utilise `esbuild` pour compiler et empaqueter le code du serveur TypeScript (`server.ts` et dépendances) dans un unique fichier compatible CommonJS autonome : `dist/server.cjs`.
*   **Mode Production - Démarrage (`npm start`)** :
    Exécute le serveur prêt à l'emploi `node dist/server.cjs`. Les fichiers statiques compilés du frontend sont alors servis de manière ultra-performante par Express.
