# Inventaire du Design - Brunch Bouaké PMS

## 1. Variables CSS Globales (`globals.css`)
Les tokens de design définissent une palette chaude (chocolat, or, terre cuite) adaptée à l'hôtellerie haut de gamme.

**Couleurs de marque :**
- Primary : `#E8491D` (Hover: `#C93C15`, Tint: `#FBE6DE`)
- Chocolate : `#3A1E17` (Soft: `#5C3A2E`)
- Gold : `#D9A441` (Hover: `#C4903A`, Light: `#F0D9A0`)

**Fonds & Bordures :**
- Backgrounds : Base `#FDFBF8` (très légèrement cassé), Subtle `#F5F0E9`, Dark `#231310`
- Borders : Default `#E7DED2`, Strong `#D8CBB8`

**Texte & Typographie :**
- Textes : Primary `#2B1A14`, Secondary `#7A6A5C`, Disabled `#B8A99A`, Inverse `#FDFBF8`
- Echelle d'espacement (4px à 128px) et ombres (`--shadow-soft`, `--shadow-hover`).
- Classes utilitaires : `.text-body-lg`, `.text-body-sm`, `.text-caption`.

**Couleurs de statut (Feedback) :**
- Success (`#3F7D5C`), Error (`#B23A2E`), Warning (`#9A6B1A`), Info (`#5C7A8A`) + fonds pâles associés.

## 2. Le composant `Button`
Situé dans `apps/frontend/src/components/ui/Button/`.
- **Props :** `variant` (`'primary' | 'outline' | 'tertiary' | 'gold'`), `size` (`'default' | 'small'`), `isLoading`.
- **Primary :** Fond `#E8491D`, texte blanc, ombre légère colorée `0 4px 14px rgba(232, 73, 29, 0.25)`. Translate vers le haut au hover.
- **Outline :** Bordure et texte `#3A1E17` (Chocolate). Inversion de couleur au hover.
- **Tertiary :** Transparent, avec un pseudo-élément `::after` qui crée une ligne de soulignement animée s'étendant à 100% au hover.
- **Gold :** Fond `#D9A441`, texte chocolat.
- **Tailles :** `default` (14px 28px, radius 10px), `small` (6px 14px, radius 8px, font-size plus petite).
- **Loading :** Remplace le texte par un `<span className={styles.spinner} />` en rotation.

## 3. Liste des Composants Réutilisables (UI)
Actuellement présents dans `apps/frontend/src/components/ui/` avec leurs modules CSS :
- **Badge** : Indique les statuts (ex: PENDING, CONFIRMED) avec les variantes de couleurs métier.
- **Button** : Bouton d'action décrit ci-dessus.
- **Card** : Conteneur générique pour encadrer les informations.
- **Input** : Champ de saisie standard.
- **Spinner** : Indicateur de chargement indépendant.
*(Note : Il n'y a pas encore de Modal, Tabs ou Table abstraite dans ce dossier `ui/`, ils sont soit gérés nativement, soit inlinés dans les vues).*

## 4. Polices Actuellement Chargées (`layout.tsx`)
- **Fraunces** (`next/font/google`) : Police serif élégante pour les titres (`--font-heading`).
- **Plus Jakarta Sans** : Police sans-serif géométrique et lisible pour le corps de texte (`--font-body`).

## 5. Intégration de `lucide-react` et Icônes
L'intégration se fait par des imports directs. Les icônes actuellement utilisées dans le dashboard sont très utilitaires :
- **Actions** : `Search`, `Eye`, `Plus`, `X`, `Edit`.
- **Statuts/Alertes** : `AlertTriangle`, `AlertCircle`, `CheckCircle2`, `HelpCircle`, `ShieldAlert`.
- **Métier** : `FileSpreadsheet`, `Sparkles` (Ménage), `User`, `Wrench` (Maintenance), `BarChart3` (Rapports), `Calendar`.

## 6. Animations et Transitions Présentes
- **Boutons (`Button.module.css`)** : 
  - `transition: all 200ms ease;` pour tous les changements d'état (hover, active).
  - Translation Y (`transform: translateY(-1px)`) au hover du primary.
  - Animation `spin` (0.8s linear infinite) pour les spinners.
  - Animation d'expansion de la barre de soulignement sur le bouton tertiary (`transition: all 250ms ease`).
- **Global (`globals.css`)** :
  - `transition: color 0.2s ease;` sur les liens natifs.
  - Animation `@keyframes skeletonPulse` pour l'effet de chargement fantôme (skeleton screens) qui clignote l'opacité de 1 à 0.4 sur 1.5s.

## 7. Captures Actuelles
*L'agent de navigation autonome a malheureusement échoué à exporter les captures d'écran après s'être connecté. Bien qu'il réussisse l'authentification (`admin@brunchbouake.com` / `admin_pass_2026`), ses exports d'images du DOM échouent techniquement dans son propre conteneur. Nous devons donc analyser le design sans screenshots virtuels.*

## 8. Mon Avis Honnête (Perfectibilité)
Le socle (tokens, typos) est **excellent et donne déjà un aspect premium**. Fraunces et les couleurs chaudes sont très élégants. Cependant :

1. **Il manque de la "matière" premium (Dynamic Design)** :
   L'UI est encore très plate (Flat). Pour un rendu luxueux ("Wow effect"), il faudrait :
   - L'ajout de micro-animations (ex: `framer-motion` ou transitions CSS plus organiques pour l'apparition des listes et des cartes).
   - Des effets de glassmorphism légers (ex: `backdrop-filter: blur()`) sur d'éventuels headers ou modals flottants.
   - De légers dégradés (gradients) subtils sur les fonds ou certaines cartes clés (ex: rapport financier), au lieu d'aplat strict.

2. **Généricité des composants** :
   Le dossier `ui/` est encore très pauvre. L'utilisation d'Inputs standards sans "Floating labels", et l'absence de `Select`, `Datepicker` ou `Table` designés risque de casser l'immersion premium. Ces éléments cruciaux dans un PMS (tableaux de réservations, sélection de dates) ont souvent un design navigateur par défaut si on ne les uniformise pas.

3. **Icônes "trop standards"** :
   Les icônes `lucide-react` sont fonctionnelles mais un peu "tech/SaaS". Un hôtel haut de gamme bénéficierait d'icônes avec un poids plus léger (`strokeWidth={1.5}` voire `1`), ou d'icônes bicolores pour matcher l'identité Chocolat/Or.
