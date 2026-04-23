# Marcassin Design System

> **Source Figma** : [Marcassin 🐗 - Complex Components](https://www.figma.com/design/DsiVHsKnkEyM3I2Baqhctd/Marcassin-%F0%9F%90%97---Complex-Components)
> **Dernière mise à jour** : Avril 2026
> **Domaine** : Application SaaS de gestion agricole (parcelles, cultures, opérations techniques, météo, finances, stocks)

Ce document est la référence absolue pour tout développement front-end. Chaque composant et fonctionnalité DOIT respecter ces spécifications à la lettre.

---

## 1. Architecture du Design System

Le DS Marcassin est organisé en **2 bibliothèques Figma** complémentaires :

| Bibliothèque | Rôle | Contenu |
|---|---|---|
| **Marcassin 🐗 - Basics** | Fondations + composants atomiques | Tokens (couleurs, typo, spacing, shadows), Button, Select, Badge, Radio, Table Cell, SideBar, Tab Bar, Icons (Heroicons) |
| **Marcassin 🐗 - Complex Components** | Composants composites métier | Modals, Cards, Gantt, Maps, Charts, Drawers, Timelines, Weather, Financial, Workflow, Chat/AI, Forms |

Le système s'appuie sur **Tailwind CSS** comme framework utilitaire (les tokens sont nommés selon les conventions Tailwind).

---

## 2. Design Tokens

### 2.1 Couleurs

Collection de variables : **"Marcassin"** (dans la bibliothèque Basics)

#### Backgrounds (Tailwind Base)

| Token | Usage |
|---|---|
| `backgroundPrimary` | Fond principal de l'application |
| `backgroundSecondary` | Fond secondaire (sections, cartes) |
| `backgroundTertiary` | Fond tertiaire (sous-sections, alternance) |
| `backgroundInversePrimary` | Fond inversé (dark sections) |
| `backgroundHover` | Fond au survol des éléments interactifs |

#### Backgrounds Extensions (couleurs sémantiques)

| Token | Usage |
|---|---|
| `backgroundRed` | Erreur, danger, suppression |
| `backgroundAmber` | Avertissement, attention |
| `backgroundLime` | Succès léger, validation |
| `backgroundTeal` | Information, statuts neutres positifs |
| `backgroundSky` | Information secondaire |
| `backgroundBlue` | Actions principales, sélection |
| `backgroundCyan` | Données météo, information technique |
| `backgroundRose` | Alertes douces, notifications |
| `backgroundPink` | Mise en avant décorative |
| `backgroundZinc` | Éléments désactivés, neutres |

#### Hover States (Styles de remplissage)

| Style | Usage |
|---|---|
| `Hover States/Buttons/btn-hover` | Survol des boutons principaux |
| `Hover States/Buttons/btn-inverse-hover` | Survol des boutons inversés |

### 2.2 Typographie

**Police principale** : Suivre la police définie dans la bibliothèque Figma (les styles de texte sont mappés aux classes Tailwind).

#### Catégorie Display (titres héroïques)

| Style | Classe Tailwind | Font-size | Line-height |
|---|---|---|---|
| `Display/Extra Large` | `text-9xl` | 8rem (128px) | 1 |
| `Display/Large` | `text-8xl` | 6rem (96px) | 1 |
| `Display/Medium` | `text-7xl` | 4.5rem (72px) | 1 |
| `Display/Small` | `text-6xl` | 3.75rem (60px) | 1 |
| `Display/Tiny` | `text-5xl` | 3rem (48px) | 1 |

#### Catégorie Heading (titres de sections)

| Style | Usage |
|---|---|
| `Heading/Large` | Titre de page |
| `Heading/Medium` | Titre de section |
| `Heading/Small` | Titre de sous-section |
| `Heading/Tiny` | Titre de carte / bloc |

#### Catégorie Label (textes d'interface)

| Style | Usage |
|---|---|
| `Label/Large` | Labels principaux de formulaire |
| `Label/Base` | Labels standard |
| `Label/Small` | Labels secondaires, métadonnées |
| `Label/Tiny` | Labels minimaux, captions, annotations |

### 2.3 Spacing (Margin & Padding)

Collection de variables : **"Tailwind Dimensions"** (bibliothèque Basics)

Le système utilise l'échelle de spacing Tailwind standard. Les variables sont scopées pour `TEXT_CONTENT`, `WIDTH_HEIGHT`, et `GAP`.

| Token | Valeur Tailwind | Pixels |
|---|---|---|
| `0` | `p-0` / `m-0` | 0px |
| `px` | `p-px` / `m-px` | 1px |
| `0.5` | `p-0.5` / `m-0.5` | 2px |
| `1` | `p-1` / `m-1` | 4px |
| `2` | `p-2` / `m-2` | 8px |
| `3` | `p-3` / `m-3` | 12px |
| `4` | `p-4` / `m-4` | 16px |
| `5` | `p-5` / `m-5` | 20px |
| `6` | `p-6` / `m-6` | 24px |
| `7` | `p-7` / `m-7` | 28px |
| `8` | `p-8` / `m-8` | 32px |
| `9` | `p-9` / `m-9` | 36px |
| `44` | `p-44` / `m-44` | 176px |
| `56` | `p-56` / `m-56` | 224px |

> L'échelle complète suit la convention Tailwind (0, px, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96).

### 2.4 Box Shadows

Styles d'effet Figma (bibliothèque Basics), mappés aux classes Tailwind :

| Style | Classe Tailwind | Usage |
|---|---|---|
| `Box Shadow/shadow-sm` | `shadow-sm` | Éléments légèrement surélevés (inputs) |
| `Box Shadow/shadow` | `shadow` | Cartes, conteneurs |
| `Box Shadow/shadow-md` | `shadow-md` | Dropdowns, popovers |
| `Box Shadow/shadow-lg` | `shadow-lg` | Modals, drawers |
| `Box Shadow/shadow-xl` | `shadow-xl` | Éléments flottants proéminents |
| `Box Shadow/shadow-2xl` | `shadow-2xl` | Éléments de premier plan |
| `Box Shadow/shadow-inner` | `shadow-inner` | Inputs enfoncés, zones intérieures |
| `box shadow/shadow-inner-magic` | Custom | Effet intérieur spécial (effet "magic") |

---

## 3. Iconographie

Le design system utilise **Heroicons** dans trois variantes de taille :

| Variante | Préfixe | Taille | Usage |
|---|---|---|---|
| Micro | `heroicons-micro/` | 16px | Inline dans le texte, badges, petits boutons |
| Mini | `heroicons-mini/` | 20px | Boutons, navigation, indicateurs |
| Solid | `heroicons-solid/` | 24px | Actions principales, menus, header |

> **Règle** : toujours utiliser les icônes Heroicons de la bibliothèque Marcassin Basics. Ne jamais substituer par une autre bibliothèque d'icônes.

---

## 4. Composants Basics (Atomiques)

### 4.1 Button

**Source** : `Marcassin 🐗 - Basics` → `Button`

Propriétés de variantes attendues :
- **Type** : Primary, Secondary, Tertiary, Danger, Ghost
- **State** : Default, Hover, Pressed, Disabled
- **Size** : S, M, L
- **Icon** : With/Without leading icon

Règles :
- Toujours utiliser le composant Button de la bibliothèque, jamais un bouton HTML natif non stylé
- Les états hover utilisent les styles `btn-hover` et `btn-inverse-hover`
- Le texte des boutons est en **sentence-case** (première lettre majuscule uniquement)
- Padding et border-radius suivent les tokens Tailwind définis dans le composant

### 4.2 Select

**Source** : `Marcassin 🐗 - Basics` → `Select`

- Dropdown de sélection avec support pour placeholder, valeur sélectionnée, et multi-select
- Respecter les états : Default, Focus, Filled, Error, Disabled

### 4.3 Radio Button

**Source** : `Marcassin 🐗 - Basics` → `Radio button`

- Groupes de boutons radio avec label associé
- États : Default, Selected, Disabled

### 4.4 Badge / Badge Plus

**Source** : `Marcassin 🐗 - Basics` → `Badge/Badge Type` et `Badge/Badge Plus`

- Badges pour indicateurs de statut, compteurs, labels
- Variantes par type (couleur sémantique)
- Badge Plus pour les badges avec action (ajout)

### 4.5 Tables / Table Cell

**Source** : `Marcassin 🐗 - Basics` → `Tables / Table Cell` et `maracassin-table-cell`

- Cellules de tableau avec support pour différents types de contenu
- Gérer les états de tri, sélection, et hover par ligne

### 4.6 SideBar

**Source** : `Marcassin 🐗 - Basics` → `SideBar`

- Navigation latérale principale de l'application
- Contient les liens de navigation vers les modules métier
- Supporte l'état collapsed/expanded

### 4.7 Tab Bar Button - Mobile

**Source** : `Marcassin 🐗 - Basics` → `Tab Bar Button - Mobile`

- Navigation par onglets sur mobile
- États : Active, Inactive

### 4.8 Header Components Section

**Source** : `Marcassin 🐗 - Basics` → `Header Components Section`

- En-têtes de sections réutilisables
- Variantes avec/sans actions, avec/sans description

### 4.9 System Element

**Source** : `Marcassin 🐗 - Basics` → `System Element`

- Éléments système génériques (alerts, notifications, toasts)

---

## 5. Composants Complexes (Métier)

### 5.1 Cards (69 variantes, 15 sous-types)

Le composant le plus utilisé du système. Sous-types :

| Sous-type | Usage | Variantes |
|---|---|---|
| **Indicator Card** | KPIs, métriques clés | 9 variantes |
| **Modulation Map Card** | Cartes de modulation agricole | 4 variantes |
| **File Card** | Fichiers et documents | 3 variantes |
| **Product Stock Card** | Gestion des stocks produits | 13 variantes |
| **Parcel Card on Map** | Parcelle affichée sur la carte | 2 variantes |
| **Contract Scan** | Aperçu de contrat scanné | 5 variantes |
| **Program Card** | Programme d'opérations | 5 variantes |
| **Technical Operation Card** | Opération technique | 8 variantes |
| **Culture Card** | Fiche culture | 3 variantes |
| **Card/PPF** | Plan Prévisionnel de Fumure | 4 variantes |
| **Card/Parcel PPF** | PPF par parcelle | 1 variante |
| **Card/Illustrate Prompt Shortcut** | Raccourcis IA (Laptop/Mobile) | 5 variantes (Default/Hover/Pressed) |
| **Card/Economic Progress** | Progression économique | 2 variantes |

### 5.2 Modals (75 variantes, 16 sous-types)

Le composant le plus complexe du système.

| Sous-type | Usage | Variantes |
|---|---|---|
| **Creation Program Modal** | Création de programme cultural | 7 étapes (wizard) |
| **Modal Parcelle** | Gestion de parcelle | 3 variantes |
| **Modal Ajout Operation** | Ajout/édition d'opération technique | 22 variantes (6 types × Adding/Editing × multi-step) |
| **Sending Modal** | Confirmation d'envoi | 2 variantes |
| **Dialog** | Dialogue de confirmation | 2 variantes |
| **Stock Justification** | Justification de stock | 4 étapes |
| **Comparative** | Vue comparative | 1 variante |
| **Market Alert** | Alerte marché | 2 variantes |
| **Phyto Register Export** | Export registre phytosanitaire | 3 variantes |
| **Library** | Bibliothèque de ressources | 4 variantes |
| **Invoice Scan** | Scan de facture | 1 variante |
| **Matching Suggest** | Suggestion de rapprochement | 1 variante |
| **Proposal Demand** | Proposition/demande | 3 variantes |
| **Adding/Editing Stock** | Gestion des stocks | 13 variantes (Fonction × Type × Stock) |
| **Export Modal** | Options d'export | 3 variantes |
| **Modal Edit Transaction** | Édition de transaction | 2 variantes |

**Types d'opérations** (Modal Ajout Operation) :
- Seeding (Semis)
- Destruction
- Protection (Phytosanitaire)
- Fertilization (Fertilisation)
- Soil Cultivation (Travail du sol)
- Harvesting (Récolte)

### 5.3 Gantt Chart (68 variantes)

| Sous-composant | Propriétés | Détails |
|---|---|---|
| **Technical Operation** | Size: S/M, Type: 6 types, State: Default/Hover/Pressed, Status: Done/Scheduled | 48 variantes |
| **Column** | Size: s/l/xs/xl, Today: TRUE/FALSE | 8 variantes |
| **Parcel Row** | Différentes tailles de parcelle | 6 variantes |
| **Program Row** | Ligne de programme | 1 variante |
| **Gantt (container)** | Type: Programs/Assolement, Group By, Scale | 5 variantes |

### 5.4 Weather Grid (53 variantes)

| Sous-composant | Propriétés | Détails |
|---|---|---|
| **Rain** | Level: 0/Low/Medium/High | 4 variantes |
| **Wind Icon** | 8 directions cardinales (N/NE/E/SE/S/SW/W/NW) | 8 variantes |
| **Weather Grid Column** | Scale × State × Size × Conditions | 36 variantes |
| **WeatherGrid (container)** | - | 4 variantes |

### 5.5 Timeline (25 variantes)

| Sous-composant | Propriétés |
|---|---|
| **Invoices Drag Drop Cards** | 8 états de drag & drop |
| **Technical Operation Card** | 8 états |
| **Column** | 5 variantes |
| **Timeline (container)** | Types: Weather/Operations (Hour/Week), Invoices (Annual/Monthly) |

### 5.6 Charts (41 variantes, 10 sous-types)

| Sous-composant | Variantes |
|---|---|
| **Chart** | 2 (générique) |
| **Card Chart** | 4 |
| **Chart Card Assolement** | 2 (assolement) |
| **Profitability Section** | 3 (Margin/Type3/Load) |
| **Stock Level Indicator Full** | 3 |
| **Stock Level Indicator Chart** | 6 |
| **Chart Grid** | 6 unités (Degrés/mm/Tonnes/Litres/etc.) |
| **Bar Chart Month** | 3 |
| **Bar Chart** | 10 |

### 5.7 Drawer (9 variantes)

| Sous-type | Contenu |
|---|---|
| **Operations List** | Liste des opérations |
| **Load Details** | Détails de chargement |
| **Operation** | Détail opération (Done/Scheduled) |
| **Drawer Customer** | Fiche client |
| **Parcel** | 4 onglets : Analyze, Operation, Contracts, Observations |

### 5.8 Date & Time (16 variantes)

| Sous-composant | Variantes |
|---|---|
| **Date Time Picker** | 5 |
| **Month** | 1 |
| **Date** | 6 |
| **Calendar** | 3 |
| **Month Navigation Bar** | 1 |

### 5.9 Financial Details (11 variantes)

| Sous-composant | Variantes |
|---|---|
| **Income Statement** | Produits/Charges × Edit/Default |
| **Line** | 3 |
| **Cost Details** | 4 |

### 5.10 Workflow / Linear Flow (16 variantes)

| Sous-composant | Variantes |
|---|---|
| **Draggable Element** | 6 |
| **Draggable Group** | 2 |
| **Draggable Card** | 7 types financiers : Produit d'Exploitation, Marge Brute, Valeur Ajoutée, EBE, Résultat d'Exploitation, Résultat Courant, Résultat de l'Exercice |
| **Linear Flow** | 1 |

### 5.11 Map / Assolement (25 variantes)

Opérations de carte :
- **Default** : Vue standard
- **Draw** (01-06) : Mode dessin de parcelle
- **Select** (01-03) : Mode sélection
- **Splitting** (01-05) : Mode découpage de parcelle
- **Merge** (01-03) : Mode fusion de parcelles
- **Edit** (01-04) : Mode édition

### 5.12 Chat / AI Panel (9 variantes)

| Sous-composant | Variantes |
|---|---|
| **Chat/Message** | 5 (différents types de messages) |
| **AI Panel** | 1 (panneau d'assistant IA) |
| **Chat (container)** | 3 |

### 5.13 List (22 variantes)

| Sous-composant | Variantes |
|---|---|
| **List Section** | 8 types de sections |
| **List Row** | 14 types avec Inventory State et Unfold |

### 5.14 Slider (14 variantes)

| Sous-composant | Variantes |
|---|---|
| **Slider** | Container principal |
| **SliderBar** | 7 types |
| **Slider Risk Profile** | 4 profils : Cautious/Moderate/Risky/Aggressive |
| **SliderHandle** | Poignée de slider |

### 5.15 Right Panel (6 variantes)

| Vue | Usage |
|---|---|
| **Informations** | 5 tabs : Infos, Activity, Task, Note, Documents |
| **Model Tree Overview** | Vue arborescente du modèle |

### 5.16 Action Button (13 variantes)

| Sous-composant | Variantes |
|---|---|
| **Icon Export** | 7 types : .xml, .shp, AgriRouteur, .pdf, Print, Mail, Copy |
| **Action Button** | 6 : Default/Hover/Pressed × Export/Operation |

### 5.17 Autres composants complexes

| Composant | Variantes | Usage |
|---|---|---|
| **ParcelStepper** | 7 | Navigation entre parcelles (La Grande/Moyenne/Petite Pièce) |
| **Cycle** | 12 | Rotation des cultures, cycle cultural |
| **Options** | 5 | Sélection d'options (Selected/NotSelected/Default/Hover/Pressed) |
| **Options Stack** | 3 | Empilement d'options (Default/Grid/1Row) |
| **Form / Mail Form** | 2 | Formulaire d'envoi de mail |
| **FileViewer** | 3 | Visualiseur : Contract/Invoice/Empty |
| **Notation** | 5 | Système de notation |
| **Progress Indicator** | 4 | Indicateurs : 5%/50%/80%/100% |
| **DnD Drawer** | 3 | Tiroir drag & drop : Data/Element/Operation |
| **Farmer/Testimonial/Login** | 3 | Témoignages agriculteurs (Login) |
| **Performance Data** | 6 | Données perf (S/M/L × Level 2/3) |
| **Program Graphic Representation** | 4 | Statuts : Scheduled/Option/In Progress/Done |
| **Sticker Sharing Operation** | 4 | Partage d'opérations |
| **Drawer Recording** | 2 | Enregistrements : Operations/Observations |
| **MobileSubPageWrapper** | 2 | Wrapper sous-page mobile |
| **Observation** | 2 | Observations terrain |
| **Activity** | 2 | Activité (Date/End) |
| **Wrist** | 3 | Poignet (Default/Hover/Pressed) |

---

## 6. États d'interaction

Tous les composants interactifs DOIVENT implémenter ces états :

| État | Classe CSS | Comportement |
|---|---|---|
| **Default** | - | État de repos |
| **Hover** | `:hover` | Survol de la souris - utiliser `backgroundHover` ou les styles `btn-hover` |
| **Pressed** | `:active` | Clic en cours |
| **Disabled** | `:disabled`, `[aria-disabled]` | Élément non interactif - utiliser `backgroundZinc` |
| **Dragging** | `[data-dragging]` | Élément en cours de glissement (DnD) |

Pour les composants métier avec **Status** :
- `Done` : Opération réalisée (vert/validé)
- `Scheduled` : Opération planifiée (bleu/neutre)
- `In Progress` : En cours d'exécution
- `Option` : Optionnel/brouillon

---

## 7. Responsive & Mobile

Le DS supporte deux breakpoints principaux :

| Plateforme | Indicateur | Composants spécifiques |
|---|---|---|
| **Desktop** | - | SideBar, Right Panel, Gantt complet, Drawers latéraux |
| **Mobile** | `Mobile ? = Ok` (propriété Figma) | Tab Bar Button - Mobile, MobileSubPageWrapper, versions compactées des cartes |

Règles :
- Les composants avec propriété `Mobile ?` ont une variante mobile dédiée — l'utiliser
- Sur mobile, le SideBar est remplacé par le Tab Bar
- Les Drawers s'affichent en plein écran sur mobile (bottom sheet)
- Les Gantt et Timelines adoptent un scroll horizontal sur mobile

---

## 8. Conventions de nommage

### Composants

Les composants suivent une hiérarchie par slash :
```
Catégorie/Sous-catégorie/Composant
```
Exemples : `Card/PPF`, `Chat/Message`, `Badge/Badge Type`, `Class/Container/Item`

### Propriétés de variantes

Format Figma `Key=Value` :
- `Size` : S, M, L, Min, Max, XS, XL
- `State` : Default, Hover, Pressed, Dragging
- `Status` : Done, Scheduled, In Progress, Option
- `Type` : Seeding, Destruction, Protection, Fertilization, Soil Cultivation, Harvesting
- `Property 1` : Valeur contextuelle
- `Unfold` : TRUE, FALSE (pour les éléments dépliables)
- `Mobile ?` : Ok, - (support mobile)

### Langue

Le DS mélange français et anglais :
- **Anglais** pour les propriétés techniques (State, Size, Type, Status)
- **Français** pour le contenu métier (Produit d'Exploitation, Marge Brute, Choix Parcelles, Ajout Opération)

---

## 9. Règles de développement

### Obligatoires

1. **Toujours utiliser les tokens** : Ne jamais hard-coder de couleur, spacing, ou ombre. Utiliser les variables CSS / classes Tailwind correspondantes.
2. **Respecter la hiérarchie** : Display > Heading > Label > Body pour la typographie.
3. **Heroicons uniquement** : Toute icône doit provenir de la bibliothèque Heroicons (micro/mini/solid) embarquée dans Marcassin Basics.
4. **Implémenter tous les états** : Default, Hover, Pressed, Disabled au minimum pour chaque composant interactif.
5. **Accessibilité** : Chaque composant interactif doit avoir un `aria-label` ou `aria-labelledby` approprié.
6. **Responsive** : Vérifier la variante mobile quand elle existe (`Mobile ? = Ok`).

### Interdits

1. Ne pas créer de composant custom quand un composant Marcassin existe.
2. Ne pas modifier les tokens (couleurs, spacing) sans validation du design.
3. Ne pas utiliser de shadows autres que celles définies dans la section Box Shadow.
4. Ne pas mélanger les bibliothèques tierces (Material 3, Simple DS, iOS) — elles sont référencées dans Figma mais les composants Marcassin ont priorité.

### Bonnes pratiques

1. **Composants composites** : Construire les vues en assemblant les composants Basics + Complex existants.
2. **Drag & Drop** : Les composants avec états `Dragging` doivent supporter le DnD natif HTML5 ou une librairie compatible.
3. **Wizard modals** : Les modals multi-étapes doivent utiliser le pattern stepper avec progression visuelle.
4. **Cartes de données** : Utiliser les `Indicator Card` pour les KPIs et les `Card Chart` pour les visualisations inline.
5. **Listes** : Utiliser les composants `List Section` + `List Row` avec support pour `Unfold` (accordéon).

---

## 10. Référence rapide des composants par module métier

| Module | Composants principaux |
|---|---|
| **Parcelles** | Map (Assolement), Parcel Card, ParcelStepper, Parcel Row, Drawer (Parcel) |
| **Cultures** | Culture Card, Cycle, Rotation Cycle, Program Card |
| **Opérations techniques** | Gantt, Technical Operation Card, Timeline, Modal Ajout Opération, Action Button |
| **Météo** | WeatherGrid, Weather Column, Weather Section, Timeline (Weather) |
| **Finances** | Financial Details, Workflow (Linear Flow), Charts, Income Statement |
| **Stocks** | Product Stock Card, Stock Level Indicator, Stock Justification Modal, Adding/Editing Stock Modal |
| **Contrats** | Contract Scan Card, FileViewer, Drawer (Customer) |
| **Exports** | Export Modal, Action Button (Icon Export), Phyto Register Export |
| **IA / Chat** | Chat, AI Panel, Card/Illustrate Prompt Shortcut |
| **Calendrier** | Date & Time, Calendar, Timeline |
| **Performance** | Performance Data, Performance Stack, Progress Indicator, Profitability Section |
| **Navigation** | SideBar (desktop), Tab Bar Button - Mobile, Right Panel, Drawer |

---

## 11. Figma — Liens de référence

| Ressource | Lien |
|---|---|
| Complex Components | [Ouvrir dans Figma](https://www.figma.com/design/DsiVHsKnkEyM3I2Baqhctd/Marcassin-%F0%9F%90%97---Complex-Components) |
| Basics (variables, composants atomiques) | Bibliothèque liée dans le fichier Complex Components |

> Pour toute question sur un composant spécifique, consulter directement le fichier Figma en recherchant le nom du composant dans la barre de recherche Figma.
