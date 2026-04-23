# TerraGrow UAT Testing Platform

> **Nom du projet** : TerraGrow UAT Testing App
> **Client** : CFG Alsace (Centre de Formation et de Gestion)
> **Auteur** : Pierre Wirenius (TerraGrow)
> **Date** : Avril 2026
> **Stack** : HTML / CSS (Tailwind) / JavaScript vanilla + Supabase (Auth, Database, Edge Functions)
> **Design System** : Marcassin 🐗 (voir `/design-system/design-system.md`)

---

## 1. Contexte & Problème

TerraGrow développe un logiciel SaaS de gestion agricole (jumeau economique de l'exploitation) pour les agriculteurs et leurs conseillers de gestion. Le partenariat avec CFG Alsace est dans sa phase de validation front-end (UAT).

**Le problème actuel** : les retours de test sont collectes via un fichier Excel partagé (7 conseillers, 23 user journeys, 5 critères par journey). C'est lourd, difficile à consolider, et peu engageant pour les testeurs.

**La solution** : une web app simple et elegante qui remplace l'Excel par une interface web accessible via magic link. Les testeurs s'inscrivent, reçoivent un lien d'accès, arrivent sur un dashboard de tests, cliquent sur un test, le réalisent sur l'app TerraGrow, puis reviennent remplir leur feedback structuré.

---

## 2. Utilisateurs

| Rôle | Description | Accès |
|---|---|---|
| **Testeur (Conseiller CFG)** | Conseiller de gestion agricole qui teste les interfaces TerraGrow et donne son feedback | Inscription + magic link |
| **Admin (Pierre / TerraGrow)** | Consulte la synthèse des retours, invite des testeurs, gère les campagnes de test | Marqué admin dans la base |

**Testeurs identifiés** : Michaël, Romain, Jean-Luc, Victoria, Frédéric, Antoine, Camille (7 conseillers CFG Alsace).

---

## 3. Fonctionnalités

### 3.1 Authentification (Supabase Magic Link)

**Inscription** (1er accès) :
- Formulaire avec : Nom, Prénom, Email professionnel, Numéro de téléphone, Entreprise, Poste
- Bouton "Recevoir le Lien d'accès"
- Le formulaire crée le profil dans `profiles` et envoie un magic link
- Page de fond dark (#021130) avec le logo TerraGrow

**Connexion** (accès suivants) :
- Formulaire avec : Email
- Bouton "Recevoir le Lien d'accès"
- Lien "Première visite ? Inscrivez-vous"
- Même fond dark

**Page de confirmation** :
- Fond clair
- Spinner + message "Lien d'Accès Envoyé"
- Texte explicatif + bouton "Renvoyer ?"

### 3.2 Dashboard Testeur

**Header** :
- Photo de profil (avatar par défaut avec initiales)
- Nom, Prénom
- Poste + Entreprise

**Barre de KPIs** (ligne horizontale de cartes indicateurs) :
- Nombre total de tests réalisés (avec progress bar)
- Répartition des statuts (étiquette visuelle : combien de tests completés / partiels / non faits)
- Diagramme circulaire ou mini chart de progression
- Légende des statuts

**Grille de tests** (cards scrollables horizontalement ou en grid) :
- Chaque card affiche : ID du test (ex: "A5"), Titre du test, Description courte, Badge de statut (Non commencé / En cours / Terminé), Section (Agriculteur ou Conseiller)
- Les cards sont cliquables → mènent à la page de détail du test
- Séparation visuelle entre tests Agriculteur (A1-A13) et tests Conseiller (C1-C10)

**Barre de scroll** pour naviguer entre les tests si la grille dépasse l'écran.

### 3.3 Page de détail d'un test

**En-tête** :
- Profil utilisateur (même que dashboard)
- Photo décorative / illustration du module testé

**Corps du test** :
- Titre du test (ex: "A5 — Trésorerie : prévisionnel 12 mois")
- Description longue (la user story complète)
- Écrans / flow à parcourir (instructions du parcours)
- Objectif de lisibilité (ce qu'on regarde)

**Lien vers l'app à tester** :
- Bouton/lien vers `https://preprod-conseil.terragrow.fr/login` avec les identifiants de démo

**Formulaire de feedback** (la partie que le testeur remplit) :

1. **Statut de réalisation** : Select → Parcouru / Partiel / Non parcouru
2. **5 critères à évaluer** (chacun avec un select) :
   - C1 — Lisibilité visuelle : OK / À améliorer / Bloquant
   - C2 — Compréhension du parcours : OK / À améliorer / Bloquant
   - C3 — Logique métier : OK / À améliorer / Bloquant
   - C4 — Complétude de l'information : OK / À améliorer / Bloquant
   - C5 — Valeur métier perçue : OK / À améliorer / Bloquant
3. **Commentaire critères** : Textarea libre
4. **Note globale /5** : Input number (0-5) avec validation
5. **Verbatim** : Textarea (1-3 phrases)
6. **Suggestion d'amélioration** : Textarea (1-2 idées)

**Actions** :
- Bouton "Sauvegarder" (enregistre en draft)
- Bouton "Retour" (retour au dashboard)
- Auto-save en cours de saisie (optionnel)

### 3.4 Vue Synthèse (Admin)

Accessible uniquement aux admins. Agrège les retours de tous les testeurs.

**Par journey** :
- Nombre de ✅ OK / ⚠️ À améliorer / ❌ Bloquant (sur les 5 critères × N testeurs)
- Total critères évalués et % OK
- Nombre de Parcouru / Partiel / Non parcouru
- Note moyenne /5
- Liste des verbatims

**Vue globale** :
- Taux de complétion global
- Score moyen global
- Journeys les plus problématiques (tri par note)
- Export possible (optionnel)

---

## 4. Les 23 User Journeys à tester

### Portail Agriculteur (A1 → A13)

| ID | Module | User story |
|---|---|---|
| A1 | Onboarding agriculteur | Invité par mon conseiller, je termine la config et j'arrive sur un dashboard compréhensible en < 5min |
| A2 | Parcelles & assolement | Je visualise mes parcelles, je crée et projette mon assolement prévisionnel sur plusieurs campagnes |
| A3 | ITK | Je construis mes itinéraires techniques par culture pour cadrer mon prévisionnel |
| A4 | Carnet de plaine | Je mets à jour les interventions réalisées sur mes parcelles |
| A5 | Trésorerie : prévisionnel 12 mois | Je consulte mon prévisionnel de trésorerie pour anticiper les tensions de cash |
| A6 | Trésorerie : gestion factures | Je dépose mes factures et visualise leur statut pour fiabiliser mon prévisionnel |
| A7 | Trésorerie : flux bancaires | Je catégorise mes flux bancaires pour un prévisionnel fiable |
| A8 | Rentabilité : vue ateliers | J'accède à la rentabilité de tous mes ateliers sur la campagne |
| A9 | Rentabilité : focus atelier | Je zoome sur un atelier pour comprendre mes charges et ma marge |
| A10 | Pluriannuel | Je visualise ma trajectoire économique sur plusieurs exercices comptables |
| A11 | Stocks : gestion | Je gère mes stocks et lots pour fiabiliser marges et trésorerie |
| A12 | Stocks : import manuel | J'ajoute manuellement des ventes/achats pour maintenir mes stocks à jour |
| A13 | Chat conseiller | J'échange avec mon conseiller via le chat intégré |

### Portail Conseiller (C1 → C10)

| ID | Module | User story |
|---|---|---|
| C1 | Portefeuille client | J'ouvre mon portefeuille, segmente mes adhérents et repère les dossiers à risque |
| C2 | Fiche client | J'ai une lecture synthétique des indicateurs clés d'un adhérent |
| C3 | Fiche client › Trésorerie | Je visualise le risque cash et la trajectoire à 12 mois |
| C4 | Fiche client › Pluriannuel | Je lis la trajectoire économique sur plusieurs exercices |
| C5 | Fiche client › Rentabilité | Je situe la rentabilité par rapport à un référentiel |
| C6 | Fiche client › Projets | Je consulte/crée des projets d'investissement avec simulation |
| C7 | Fiche client › Itinéraires | Je compare les performances techniques dans le portefeuille |
| C8 | Fiche client › Stocks | Je fiabilise ma lecture marge/trésorerie via les stocks |
| C9 | Data visualisation portefeuille | Je construis des graphiques à la volée sur mon portefeuille |
| C10 | Chat agriculteur | Je centralise mes échanges avec mes adhérents |

---

## 5. Design & UI

### Charte visuelle

- **Fond des pages auth** : #021130 (bleu très foncé TerraGrow)
- **Fond de l'app** : backgroundPrimary (clair, Tailwind)
- **Logo** : `/logo/terragrow-logo.svg` (SVG, fond dark #021130, formes blanches)
- **Design System** : Marcassin 🐗 — OBLIGATOIRE. Voir `/design-system/design-system.md`

### Composants à utiliser (Marcassin DS)

| Élément UI | Composant Marcassin |
|---|---|
| Boutons | Button (Basics) — Primary, Secondary, Ghost |
| Formulaires | Select, Radio Button (Basics) |
| Cards de test | Cards / Indicator Card (Complex) |
| Badges de statut | Badge/Badge Type (Basics) |
| Layout dashboard | Grid + Header Components Section (Basics) |
| Navigation | SideBar ou Tab Bar Mobile (Basics) |
| Typographie | Display, Heading, Label (Basics) — classes Tailwind |
| Spacing | Tailwind Dimensions (0-96) |
| Shadows | shadow-sm à shadow-2xl (Basics) |
| Icônes | Heroicons (micro/mini/solid) embarqués dans Basics |

### Responsive

- Desktop first (les testeurs utilisent Chrome/Edge/Firefox desktop)
- Mobile acceptable mais pas prioritaire

---

## 6. Architecture technique

### Stack

```
Frontend :  HTML + Tailwind CSS + JavaScript vanilla
Backend :   Supabase (PostgreSQL + Auth + Edge Functions)
Auth :      Magic Link (Supabase Auth)
Deploy :    GitHub Pages ou Vercel (static hosting)
```

### Structure des fichiers

```
/
├── index.html              # Page de login
├── register.html           # Page d'inscription
├── magic-link-sent.html    # Confirmation d'envoi du magic link
├── dashboard.html          # Dashboard testeur
├── test.html               # Page de détail d'un test (dynamique via query param ?id=A5)
├── admin.html              # Vue synthèse admin
├── css/
│   └── styles.css          # Tailwind + custom styles
├── js/
│   ├── supabase.js         # Client Supabase + auth helpers
│   ├── auth.js             # Logique auth (register, login, magic link)
│   ├── dashboard.js        # Logique dashboard
│   ├── test.js             # Logique page test + formulaire feedback
│   └── admin.js            # Logique vue synthèse
├── assets/
│   └── logo.svg            # Logo TerraGrow
└── data/
    └── journeys.json       # Données des 23 journeys (statique)
```

### Flux d'authentification

```
1. Utilisateur arrive sur index.html (login)
2. Saisit son email → clic "Recevoir le Lien d'accès"
3. Supabase envoie un magic link par email
4. Redirection vers magic-link-sent.html (confirmation)
5. Utilisateur clique le lien dans son email
6. Supabase valide → redirection vers dashboard.html
7. Si pas de profil → redirection vers register.html pour compléter
```

---

## 7. Contraintes

- **Simplicité** : HTML/CSS/JS uniquement, pas de framework (React, Vue, etc.)
- **Supabase** : toute la logique backend est dans Supabase (auth, database, RLS)
- **Design System** : respecter le Marcassin DS à la lettre (tokens, composants, conventions)
- **Données de test** : les 23 journeys sont hardcodées dans un JSON, pas dans la base
- **Multi-testeur** : chaque testeur ne voit/modifie que ses propres feedbacks (RLS Supabase)
- **Admin** : seul l'admin voit la synthèse agrégée de tous les testeurs
- **Pas de données sensibles** : les identifiants de démo (agri@demo.fr / advisor@demo.fr / 0000) sont affichés dans l'app
- **Deadline** : avant le jalon Clik & Conseils du 30 avril 2026

---

## 8. Hors périmètre

- Pas de connexion au logiciel TerraGrow lui-même (l'app de test est séparée)
- Pas de gestion de versions des tests (une seule campagne à la fois)
- Pas de notifications push
- Pas de mode offline
- Pas de CI/CD complexe
